import useStore from '../store/useStore.js';

export default function HistoryPage() {
  const user = useStore(s => s.user), hist = useStore(s => s.hist);
  const winRate = user.total_bets > 0 ? ((user.total_wins / user.total_bets) * 100).toFixed(1) : '0.0';

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden',minHeight:0}}>
      <div className="hist-top-stats">
        {[{l:'TOTAL BETS',v:user.total_bets},{l:'WINS',v:user.total_wins},{l:'WIN RATE',v:`${winRate}%`},{l:'DAILY BETS',v:user.daily_bets}]
          .map(s => <div key={s.l} className="hs"><div className="hs-v">{s.v}</div><div className="hs-l">{s.l}</div></div>)}
      </div>
      <div className="hist-list">
        {hist.length === 0 ? <div className="tx-empty">No bets placed yet</div> :
          hist.map(h => (
            <div key={h.id} className={`h-item ${h.won?'win':'lose'}`}>
              <div className="h-top">
                <div className="h-meta">
                  <span className="h-sym">{h.sym}</span>
                  <span className={`h-dir ${h.dir==='up'?'u':'d'}`}>{h.dir==='up'?'▲ UP':'▼ DOWN'}</span>
                </div>
                <span className={`h-pay ${h.won?'pos':'neg'}`}>{h.won?`+R${(h.payout-h.stake).toFixed(2)}`:`-R${h.stake.toFixed(2)}`}</span>
              </div>
              <div className="h-rounds">
                {h.rounds.map((r,i) => <div key={i} className={`hd ${r==='won'?'w':'l'}`}>{r==='won'?'W':'L'}</div>)}
                <span className="h-time">{h.time}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}