import { create } from 'zustand';
import api from '../services/api.js';

// ── Shared constants & helpers ───────────────────────────────────────────────
export const MMAP        = { Crypto: ['BTC/USD', 'ETH/USD'], Forex: ['USD/EUR', 'USD/ZAR'] };
export const BASE_PRICES = { 'BTC/USD': 67432.10, 'ETH/USD': 3241.55, 'USD/EUR': 0.9234, 'USD/ZAR': 18.654 };
export const VOLS = { 'BTC/USD': 0.0003, 'ETH/USD': 0.0004, 'USD/EUR': 0.0001, 'USD/ZAR': 0.0002 };
export const MILESTONE_MSGS = { 3: '🔥 3 in a row!', 5: '💥 5 streak — unstoppable!', 10: '🚀 10 streak — legendary!' };
export const TXICON      = { deposit: '💳', withdraw: '↑', bet_win: '◎', bet_loss: '✕', free: '🎁' };

export const fmtZAR  = v   => `ZAR ${Number(v).toFixed(2).replace('.', ',')}`;
export const fmtP    = (p, s) => (s === 'USD/EUR' || s === 'USD/ZAR') ? p.toFixed(4) : p >= 1000 ? p.toFixed(2) : p.toFixed(3);
export const fmtTime = iso  => new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

export const EMPTY_USER = {
  username: '', email: '',
  account_balance: 0, current_balance: 0,
  streak: 0, best_streak: 0,
  total_bets: 0, total_wins: 0,
  xp: 0, level: 1,
  daily_bets: 0, login_streak: 1,
  recent: [],
};

const useStore = create((set, get) => ({

  // AUTH
  token: localStorage.getItem('access_token') || null,
  setToken(access, refresh) {
    localStorage.setItem('access_token',  access);
    localStorage.setItem('refresh_token', refresh);
    set({ token: access });
  },
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ token: null, user: EMPTY_USER, txns: [], hist: [] });
  },

  // USER
  user: { ...EMPTY_USER },
  setUserFromApi(data) {
    set(s => ({ user: { ...s.user, ...data } }));
  },
  deductBalance(amount) {
    set(s => ({ user: { ...s.user, current_balance: +(s.user.current_balance - amount).toFixed(2) } }));
  },
  appendRecent(outcome) {
    set(s => ({ user: { ...s.user, recent: [...(s.user.recent || []), outcome].slice(-10) } }));
  },

  // DATA
  txns: [], hist: [],
  async loadTxns() {
    try {
      const { data } = await api.get('/wallet/transactions');
      set({ txns: data.map(t => ({ id: t.id, type: t.type, lbl: t.description, amt: t.amount, bal: t.balance_after, time: fmtTime(t.created_at) })) });
    } catch {}
  },
  async loadHist() {
    try {
      const { data } = await api.get('/bets/history');
      set({ hist: data.map(h => ({ id: h.id, sym: h.symbol, dir: h.direction, stake: h.stake, payout: h.payout || 0, won: h.won, rounds: h.round_results.split(',').map(r => r.trim() === 'win' ? 'won' : 'lost'), time: fmtTime(h.created_at) })) });
    } catch {}
  },
  async loadMe() {
    const { data } = await api.get('/auth/me');
    get().setUserFromApi(data);
    await Promise.all([get().loadTxns(), get().loadHist()]);
  },
  async refreshUser() {
    try { const { data } = await api.get('/auth/me'); get().setUserFromApi(data); } catch {}
  },

// PRICES
prices: { ...BASE_PRICES }, prevPrices: { ...BASE_PRICES }, spinTick: 0,
_realPrices: { ...BASE_PRICES }, // last known real prices from API

async fetchRealPrices() {
  try {
    const [cryptoRes, fxRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'),
      fetch('https://open.er-api.com/v6/latest/USD'),
    ]);
    const cryptoData = await cryptoRes.json();
    const fxData     = await fxRes.json();

    const updated = {};
    if (cryptoData?.bitcoin?.usd)  updated['BTC/USD'] = cryptoData.bitcoin.usd;
    if (cryptoData?.ethereum?.usd) updated['ETH/USD'] = cryptoData.ethereum.usd;
    if (fxData?.rates?.EUR)        updated['USD/EUR']  = fxData.rates.EUR;
    if (fxData?.rates?.ZAR)        updated['USD/ZAR']  = fxData.rates.ZAR;

    // Update the real price anchor
    set(s => ({ _realPrices: { ...s._realPrices, ...updated } }));
  } catch {}
},

tickPrices() {
  // Micro-tick: nudge current display price slightly around the real anchor
  set(s => {
    const n = { ...s.prices };
    Object.keys(n).forEach(sym => {
      const real = s._realPrices[sym] || n[sym];
      // Small random walk, but drift back toward real price
      const drift    = (real - n[sym]) * 0.15; // pull 15% back toward real
      const noise    = real * VOLS[sym] * (Math.random() * 2 - 1);
      n[sym] = Math.max(0.0001, n[sym] + drift + noise);
    });
    return { prices: n, prevPrices: { ...s.prices }, spinTick: s.spinTick + 1 };
  });
},


  // MARKET / SYMBOL
  market: 'Crypto', sym: 'BTC/USD',
  setMarket: m => set({ market: m, sym: MMAP[m][0] }),
  setSym:    s => set({ sym: s }),

  // STAKE
  stake: 50,
  setStake: v => set({ stake: Math.max(10, Math.min(10000, v)) }),

  // GAME STATE
  betting: false, dots: [null,null,null], planetStep: 0,
  orbitActive: false, shake: false, coreS: '', r3S: '',
  nmShow: false, orbitSt: '', resBanner: { show:false, type:'', text:'' },
  milestone: { show:false, text:'' },
  setBetting:     v => set({ betting: v }),
  // ✅ FIX: setDots now supports both plain arrays AND updater functions.
  // Previously `v => set({ dots: v })` would store the function itself as `dots`
  // when called with an updater, causing `dots.filter is not a function` crash.
  setDots:        v => set(s => ({ dots: typeof v === 'function' ? v(s.dots) : v })),
  setPlanetStep:  v => set({ planetStep: v }),
  setOrbitActive: v => set({ orbitActive: v }),
  setShake:       v => set({ shake: v }),
  setCoreS:       v => set({ coreS: v }),
  setR3S:         v => set({ r3S: v }),
  setNmShow:      v => set({ nmShow: v }),
  setOrbitSt:     v => set({ orbitSt: v }),
  setResBanner:   v => set({ resBanner: v }),
  setMilestone:   v => set({ milestone: v }),
  resetOrbit() {
    set({ dots:[null,null,null], planetStep:0, orbitActive:false, shake:false, coreS:'', r3S:'', nmShow:false, orbitSt:'', resBanner:{show:false,type:'',text:''} });
  },

  // WALLET MODAL
  wModal: { open:false, mode:'deposit' }, wEntry: '0', wChip: null,
  openWallet:  mode => set({ wModal: { open:true, mode }, wEntry:'0', wChip:null }),
  closeWallet: ()   => set({ wModal: { open:false, mode:'deposit' }, wEntry:'0', wChip:null }),
  setWEntry: v => set({ wEntry: v }), setWChip: v => set({ wChip: v }),

  // TOAST
  toastMsg: '', toastShow: false, _toastTimer: null,
  fireToast(msg) {
    const prev = get()._toastTimer;
    if (prev) clearTimeout(prev);
    const timer = setTimeout(() => set({ toastShow: false }), 2400);
    set({ toastMsg: msg, toastShow: true, _toastTimer: timer });
  },

  // ONBOARDING
  obStep: -1,
  obStart: () => set({ obStep: 0 }),
  obSkip:  () => set({ obStep: -1 }),
  obNext() { const step = get().obStep; set({ obStep: step < 3 ? step + 1 : -1 }); },
}));

export default useStore;