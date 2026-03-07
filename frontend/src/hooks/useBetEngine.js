import { useRef } from 'react';
import useStore, { MILESTONE_MSGS } from '../store/useStore.js';
import api from '../services/api.js';
import { Audio } from '../lib/audio.js';

export function useBetEngine() {
  const betRef   = useRef(null);
  const storeRef = useRef(null);

  // storeRef.current is updated on every render, so setTimeout callbacks
  // fired 3–6 seconds later always call live store functions, never stale closures.
  storeRef.current = useStore(s => ({
    sym: s.sym, prices: s.prices, stake: s.stake, betting: s.betting, user: s.user,
    setBetting: s.setBetting, setDots: s.setDots, setPlanetStep: s.setPlanetStep,
    setOrbitActive: s.setOrbitActive, setShake: s.setShake, setCoreS: s.setCoreS,
    setR3S: s.setR3S, setNmShow: s.setNmShow, setOrbitSt: s.setOrbitSt,
    setResBanner: s.setResBanner, setMilestone: s.setMilestone,
    deductBalance: s.deductBalance, setUserFromApi: s.setUserFromApi,
    appendRecent: s.appendRecent, loadTxns: s.loadTxns, loadHist: s.loadHist,
    fireToast: s.fireToast, tickPrices: s.tickPrices,
  }));

  const resolveRound = (round) => {
    if (!betRef.current) return;

    const store = storeRef.current;
    const bet   = betRef.current;

    // Tick the price in sync with each round resolution
    store.tickPrices();

    const result = bet.outcomes[round];
    bet.results.push(result);

    const nd   = [null, null, null];
    bet.results.forEach((r, i) => { nd[i] = r; });
    const wins = bet.results.filter(r => r === 'won').length;

    const isNM = round === 1 && result === 'lost' && wins === 1;
    if (isNM) {
      nd[round] = 'near';
      Audio.nearMiss();
      store.setShake(true);
      store.setNmShow(true);
      setTimeout(() => {
        const s = storeRef.current;
        s.setShake(false);
        s.setNmShow(false);
        s.setDots(prev => { const d = [...prev]; d[round] = 'lost'; return d; });
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
        try {
          const roundStr = bet.results.map(r => r === 'won' ? 'win' : 'lose').join(',');

          await api.post('/bets/resolve', {
            bet_id: bet.id,
            exit_price: storeRef.current.prices[storeRef.current.sym],
            round_results: roundStr,
          }).catch(() => {});

          const { data } = await api.get('/auth/me').catch(() => ({ data: null }));
          if (data) {
            storeRef.current.setUserFromApi(data);
            storeRef.current.appendRecent(won ? 'won' : 'lost');
            if (won && MILESTONE_MSGS[data.streak]) {
              storeRef.current.setMilestone({ show: true, text: MILESTONE_MSGS[data.streak] });
              setTimeout(() => storeRef.current.setMilestone({ show: false, text: '' }), 2800);
            }
          }
        } catch (e) {
          console.error('[useBetEngine] resolveRound API error:', e);
        } finally {
          const s = storeRef.current;

          s.setCoreS(won ? 'win' : 'lose');
          s.setR3S(won ? 'win' : 'lose');
          s.setOrbitSt(won ? `▲ WIN · R${payout.toFixed(2)}` : '▼ LOSS');
          s.setResBanner({
            show: true,
            type: won ? 'win' : 'lose',
            text: won
              ? `◎ WIN! +R${(payout - bet.stake).toFixed(2)} · Payout R${payout.toFixed(2)}`
              : `✕ LOSS · −R${bet.stake.toFixed(2)}`,
          });

          await Promise.all([s.loadTxns(), s.loadHist()]).catch(() => {});

          setTimeout(() => {
            storeRef.current.setBetting(false);
            storeRef.current.setOrbitActive(false);
            betRef.current = null;
          }, 2200);
        }
      }, delay);
    }
  };

  const placeBet = async (dir) => {
    const store = storeRef.current;
    if (store.betting) return;
    if (store.stake > store.user.current_balance) { store.fireToast('Insufficient balance'); return; }
    if (store.stake < 10) { store.fireToast('Minimum stake is R10'); return; }
    Audio.bet();

    try {
      const { data: bet } = await api.post('/bets/place', {
        symbol: store.sym,
        direction: dir,
        stake: store.stake,
        entry_price: store.prices[store.sym],
      });

      const outcomes = [
        Math.random() < 0.5 ? 'won' : 'lost',
        Math.random() < 0.5 ? 'won' : 'lost',
        Math.random() < 0.5 ? 'won' : 'lost',
      ];
      betRef.current = { id: bet.id, dir, stake: store.stake, outcomes, results: [] };

      store.setBetting(true);
      store.setDots([null, null, null]);
      store.setPlanetStep(0);
      store.setOrbitActive(true);
      store.setCoreS('');
      store.setR3S('');
      store.setNmShow(false);
      store.setResBanner({ show: false, type: '', text: '' });
      store.setOrbitSt('Round 1 of 3...');
      store.deductBalance(store.stake);
      setTimeout(() => resolveRound(0), 3200);
    } catch (e) {
      storeRef.current.setBetting(false);
      storeRef.current.setOrbitActive(false);
      betRef.current = null;
      storeRef.current.fireToast(e.response?.data?.detail || 'Could not place bet');
    }
  };

  return { placeBet };
}