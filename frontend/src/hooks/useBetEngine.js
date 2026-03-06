import { useRef } from 'react';
import useStore, { MILESTONE_MSGS } from '../store/useStore.js';
import api from '../services/api.js';
import { Audio } from '../lib/audio.js';

export function useBetEngine() {
  const betRef = useRef(null);

  const store = useStore(s => ({
    sym: s.sym, prices: s.prices, stake: s.stake, betting: s.betting, user: s.user,
    setBetting: s.setBetting, setDots: s.setDots, setPlanetStep: s.setPlanetStep,
    setOrbitActive: s.setOrbitActive, setShake: s.setShake, setCoreS: s.setCoreS,
    setR3S: s.setR3S, setNmShow: s.setNmShow, setOrbitSt: s.setOrbitSt,
    setResBanner: s.setResBanner, setMilestone: s.setMilestone,
    deductBalance: s.deductBalance, setUserFromApi: s.setUserFromApi,
    appendRecent: s.appendRecent, loadTxns: s.loadTxns, loadHist: s.loadHist,
    fireToast: s.fireToast,
  }));

  const resolveRound = (round) => {
    if (!betRef.current) return;
    const bet = betRef.current;
    const result = bet.outcomes[round];
    bet.results.push(result);

    const nd = [null, null, null];
    bet.results.forEach((r, i) => { nd[i] = r; });
    const wins = bet.results.filter(r => r === 'won').length;

    const isNM = round === 1 && result === 'lost' && wins === 1;
    if (isNM) {
      nd[round] = 'near';
      Audio.nearMiss();
      store.setShake(true); store.setNmShow(true);
      setTimeout(() => {
        store.setShake(false); store.setNmShow(false);
        store.setDots(prev => { const d = [...prev]; d[round] = 'lost'; return d; });
      }, 850);
    }

    store.setDots([...nd]);
    store.setPlanetStep(round + 1);
    Audio.round(round);

    if (round < 2) {
      store.setOrbitSt(`Round ${round + 2} of 3...`);
      setTimeout(() => resolveRound(round + 1), 3200);
    } else {
      const won    = wins >= 2;
      const payout = won ? +(bet.stake * 1.85).toFixed(2) : 0;
      if (won) Audio.win(); else Audio.loss();
      const delay = isNM ? 950 : 600;

      setTimeout(async () => {
        const roundStr = bet.results.map(r => r === 'won' ? 'win' : 'lose').join(',');
        try {
          await api.post('/bets/resolve', { bet_id: bet.id, exit_price: store.prices[store.sym], round_results: roundStr });
        } catch {}

        try {
          const { data } = await api.get('/auth/me');
          store.setUserFromApi(data);
          store.appendRecent(won ? 'won' : 'lost');
          if (won && MILESTONE_MSGS[data.streak]) {
            store.setMilestone({ show: true, text: MILESTONE_MSGS[data.streak] });
            setTimeout(() => store.setMilestone({ show: false, text: '' }), 2800);
          }
        } catch {}

        store.setCoreS(won ? 'win' : 'lose');
        store.setR3S(won ? 'win' : 'lose');
        store.setOrbitSt(won ? `▲ WIN · R${payout.toFixed(2)}` : '▼ LOSS');
        store.setResBanner({
          show: true, type: won ? 'win' : 'lose',
          text: won
            ? `◎ WIN! +R${(payout - bet.stake).toFixed(2)} · Payout R${payout.toFixed(2)}`
            : `✕ LOSS · −R${bet.stake.toFixed(2)}`,
        });

        await Promise.all([store.loadTxns(), store.loadHist()]);
        setTimeout(() => { store.setBetting(false); store.setOrbitActive(false); betRef.current = null; }, 2200);
      }, delay);
    }
  };

  const placeBet = async (dir) => {
    if (store.betting) return;
    if (store.stake > store.user.current_balance) { store.fireToast('Insufficient balance'); return; }
    if (store.stake < 10) { store.fireToast('Minimum stake is R10'); return; }
    Audio.bet();

    try {
      const { data: bet } = await api.post('/bets/place', {
        symbol: store.sym, direction: dir, stake: store.stake, entry_price: store.prices[store.sym],
      });

      const outcomes = ['won', Math.random() < 0.5 ? 'won' : 'lost', Math.random() < 0.5 ? 'won' : 'lost'];
      betRef.current = { id: bet.id, dir, stake: store.stake, outcomes, results: [] };
      store.setBetting(true);
      store.setDots([null, null, null]);
      store.setPlanetStep(0);
      store.setOrbitActive(true);
      store.setCoreS(''); store.setR3S(''); store.setNmShow(false);
      store.setResBanner({ show: false, type: '', text: '' });
      store.setOrbitSt('Round 1 of 3...');
      store.deductBalance(store.stake);
      setTimeout(() => resolveRound(0), 3200);
    } catch (e) {
      store.fireToast(e.response?.data?.detail || 'Could not place bet');
    }
  };

  return { placeBet };
}