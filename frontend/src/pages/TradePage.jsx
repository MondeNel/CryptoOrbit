import { useEffect, useState } from 'react';
import useStore, { MMAP, fmtZAR } from '../store/useStore.js';
import { Audio } from '../lib/audio.js';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import PriceTicker    from '../components/trade/PriceTicker.jsx';
import OrbitAnimation from '../components/trade/OrbitAnimation.jsx';
import StreakBar       from '../components/trade/StreakBar.jsx';
import BetPanel        from '../components/trade/BetPanel.jsx';

export default function TradePage() {
  const prices = useStore(s => s.prices), prevPrices = useStore(s => s.prevPrices);
  const tickPrices = useStore(s => s.tickPrices), sym = useStore(s => s.sym);
  const market = useStore(s => s.market), setMarket = useStore(s => s.setMarket);
  const setSym = useStore(s => s.setSym), user = useStore(s => s.user);
  const [mOpen, setMOpen] = useState(false), [sOpen, setSOpen] = useState(false);




  const pct = ((prices[sym] - prevPrices[sym]) / prevPrices[sym]) * 100;
  const isUp = pct >= 0;

  return (
    <ErrorBoundary>
      <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden',minHeight:0}}
        onClick={() => { setMOpen(false); setSOpen(false); }}>
        <div className="top-bar">
          <div className="bal-block"><label>Account Balance</label><div className="bv">{fmtZAR(user.account_balance)}</div></div>
          <div className="bal-block right"><label>Current Balance</label><div className="bv">{fmtZAR(user.current_balance)}</div></div>
        </div>
        <div className="selectors" onClick={e => e.stopPropagation()}>
          <div className={`drop${mOpen?' open':''}`} onClick={() => { setMOpen(p=>!p); setSOpen(false); }}>
            <span>{market}</span><div className="arr"/>
          </div>
          <div className={`dd-menu${mOpen?' show':''}`} style={{left:28}}>
            {Object.keys(MMAP).map(m => (
              <div key={m} className={market===m?'act':''} onClick={() => { setMarket(m); setMOpen(false); Audio.click(); }}>{m}</div>
            ))}
          </div>
          <div className={`drop${sOpen?' open':''}`} onClick={() => { setSOpen(p=>!p); setMOpen(false); }}>
            <span>{sym}</span><div className="arr"/>
          </div>
          <div className={`dd-menu${sOpen?' show':''}`} style={{right:28}}>
            {MMAP[market].map(s => (
              <div key={s} className={sym===s?'act':''} onClick={() => { setSym(s); setSOpen(false); Audio.click(); }}>{s}</div>
            ))}
          </div>
        </div>
        <StreakBar />
        <div className="trade-main">
          <div className="sym-label">{sym.replace('/', ' / ')}</div>
          <div className="tkr-wrap" id="ticker-section">
            <div className="tkr-title">Live Price</div>
            <PriceTicker />
            <div className={`live-tag${isUp?' up':' dn'}`}>
              <div className="live-dot"/>
              <span>{isUp?'▲':'▼'} {Math.abs(pct).toFixed(3)}% · LIVE</span>
            </div>
          </div>
          <div className="divider"/>
          <OrbitAnimation />
          <BetPanel />
        </div>
      </div>
    </ErrorBoundary>
  );
}