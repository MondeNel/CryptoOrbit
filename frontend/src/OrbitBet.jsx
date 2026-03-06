import { useState, useEffect, useRef, useCallback } from "react";
import api from "./services/api.js";
import useStore from "./store/useStore.js";

const doLogin = async () => {
  if (!lf.u || !lf.p) { setAerr('Fill in all fields'); return; }
  setAerr('');
  try {
    const { data } = await api.post('/auth/login', {
      username: lf.u, password: lf.p,
    });
    localStorage.setItem('access_token',  data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    await loadMe();
  } catch (e) {
    setAerr(e.response?.data?.detail || 'Login failed');
  }
};

const doReg = async () => {
  if (!rf.u || !rf.e || !rf.p) { setAerr('Fill in all fields'); return; }
  setAerr('');
  try {
    const { data } = await api.post('/auth/register', {
      username: rf.u, email: rf.e, password: rf.p,
    });
    localStorage.setItem('access_token',  data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    await loadMe();
  } catch (e) {
    setAerr(e.response?.data?.detail || 'Registration failed');
  }
};

const loadMe = async () => {
  const { data } = await api.get('/auth/me');
  useStore.getState().setUser(data);
  setUser({
    username:        data.username,
    email:           data.email,
    account_balance: data.account_balance,
    current_balance: data.current_balance,
    streak:          data.streak,
    best_streak:     data.best_streak,
    total_bets:      data.total_bets,
    total_wins:      data.total_wins,
    xp:              data.xp,
    level:           data.level,
    daily_bets:      data.daily_bets,
    login_streak:    data.login_streak,
    recent:          [],
  });
  await loadTxns();
  await loadHist();
  setScreen('app');
  setTimeout(() => obStart(), 400);
};

const loadTxns = async () => {
  try {
    const { data } = await api.get('/wallet/transactions');
    setTxns(data.map(t => ({
      id:   t.id,
      type: t.type,
      lbl:  t.description,
      amt:  t.amount,
      bal:  t.balance_after,
      time: new Date(t.created_at).toLocaleTimeString('en-ZA', { hour:'2-digit', minute:'2-digit' }),
    })));
  } catch {}
};

const loadHist = async () => {
  try {
    const { data } = await api.get('/bets/history');
    setHist(data.map(h => ({
      id:     h.id,
      sym:    h.symbol,
      dir:    h.direction,
      stake:  h.stake,
      payout: h.payout || 0,
      won:    h.won,
      rounds: h.round_results.split(',').map(r => r.trim() === 'win' ? 'won' : 'lost'),
      time:   new Date(h.created_at).toLocaleTimeString('en-ZA', { hour:'2-digit', minute:'2-digit' }),
    })));
  } catch {}
};

const placeBet = async (dir) => {
  if (betting) return;
  if (stake > user.current_balance) { toast('Insufficient balance'); return; }
  if (stake < 10) { toast('Minimum stake is R10'); return; }
  Audio.bet();

  try {
    const { data: bet } = await api.post('/bets/place', {
      symbol:      sym,
      direction:   dir,
      stake:       stake,
      entry_price: prices[sym],
    });

    // pre-determine 3 rounds for engagement (round 1 always win)
    const outcomes = [
      'won',
      Math.random() < 0.5 ? 'won' : 'lost',
      Math.random() < 0.5 ? 'won' : 'lost',
    ];

    betRef.current = { id: bet.id, dir, stake, outcomes, results: [] };
    setBetting(true);
    setDots([null,null,null]);
    setPlanetStep(0);
    setOrbitActive(true);
    setCoreS(''); setR3S(''); setNmShow(false);
    setResBanner({ show:false, type:'', text:'' });
    setOrbitSt('Round 1 of 3...');

    // deduct balance optimistically
    setUser(p => ({ ...p, current_balance: +(p.current_balance - stake).toFixed(2) }));

    setTimeout(() => resolveRound(0), 3200);
  } catch (e) {
    toast(e.response?.data?.detail || 'Could not place bet');
  }
};

const resolveRound = (round) => {
  if (!betRef.current) return;
  const bet = betRef.current;
  const result = bet.outcomes[round];
  bet.results.push(result);

  const nd = [null,null,null];
  bet.results.forEach((r,i) => { nd[i] = r; });
  const wins   = bet.results.filter(r => r==='won').length;
  const losses = bet.results.filter(r => r==='lost').length;

  const isNM = (round === 1 && result === 'lost' && wins === 1);
  if (isNM) {
    nd[round] = 'near';
    Audio.nearMiss();
    setShake(true); setNmShow(true);
    setTimeout(() => {
      setShake(false); setNmShow(false);
      setDots(p => { const d=[...p]; d[round]='lost'; return d; });
    }, 850);
  }
  setDots([...nd]);
  setPlanetStep(round + 1);
  Audio.round(round);

  if (round < 2) {
    setOrbitSt(`Round ${round + 2} of 3...`);
    setTimeout(() => resolveRound(round + 1), 3200);
  } else {
    // all 3 rounds done — call API to resolve
    const roundStr = bet.results.map(r => r === 'won' ? 'win' : 'lose').join(',');
    const won = wins >= 2;
    const delay = isNM ? 950 : 600;

    setTimeout(async () => {
      try {
        await api.post('/bets/resolve', {
          bet_id:       bet.id,
          exit_price:   prices[sym],
          round_results: roundStr,
        });
      } catch {}

      // refresh user state from server
      try {
        const { data } = await api.get('/auth/me');
        setUser(p => ({
          ...p,
          current_balance: data.current_balance,
          account_balance: data.account_balance,
          streak:          data.streak,
          best_streak:     data.best_streak,
          xp:              data.xp,
          level:           data.level,
          total_bets:      data.total_bets,
          total_wins:      data.total_wins,
          daily_bets:      data.daily_bets,
          recent:          [...(p.recent || []), won ? 'won' : 'lost'].slice(-10),
        }));
      } catch {}

      const payout = won ? +(bet.stake * 1.85).toFixed(2) : 0;
      if (won) Audio.win(); else Audio.loss();

      setCoreS(won ? 'win' : 'lose');
      setR3S(won  ? 'win' : 'lose');
      setOrbitSt(won ? `▲ WIN · R${payout.toFixed(2)}` : '▼ LOSS');
      setResBanner({
        show: true,
        type: won ? 'win' : 'lose',
        text: won
          ? `◎ WIN! +R${(payout-bet.stake).toFixed(2)} · Payout R${payout.toFixed(2)}`
          : `✕ LOSS · −R${bet.stake.toFixed(2)}`,
      });

      if (won && MILESTONE_MSGS[/* streak from server */1]) {
        // milestone handled server-side, check after refresh
      }

      await loadTxns();
      await loadHist();

      setTimeout(() => {
        setBetting(false);
        setOrbitActive(false);
        betRef.current = null;
      }, 2200);
    }, delay);
  }
};

const wConfirm = async () => {
  const a = wAmt;
  if (!a || a <= 0) return;
  const mode = wModal.mode;
  try {
    if (mode === 'deposit') {
      await api.post(`/wallet/deposit?amount=${a}`);
      Audio.win();
      toast(`✓ R${a.toLocaleString('en-ZA')} deposited!`);
    } else {
      await api.post(`/wallet/withdraw?amount=${a}`);
      Audio.loss();
      toast(`↑ R${a.toLocaleString('en-ZA')} withdrawal processed`);
    }
    // refresh balance + txns
    const { data } = await api.get('/auth/me');
    setUser(p => ({
      ...p,
      current_balance: data.current_balance,
      account_balance: data.account_balance,
    }));
    await loadTxns();
    setWModal({ open:false, mode:'deposit' });
    setWEntry('0');
    setWChip(null);
  } catch (e) {
    toast(e.response?.data?.detail || 'Transaction failed');
  }
};

const doLogout = () => {
  useStore.getState().logout();
  setScreen('splash');
  setUser({ username:'',email:'',account_balance:0,current_balance:0,streak:0,best_streak:0,total_bets:0,total_wins:0,xp:0,level:1,daily_bets:0,last_bet_date:'',login_streak:1,last_login_date:'',recent:[] });
  setHist([]); setTxns([]);
  Audio.click();
};