import useStore from '../../store/useStore.js';

export default function StreakBar() {
  const streak = useStore(s => s.user.streak);
  const best   = useStore(s => s.user.best_streak);
  const recent = useStore(s => s.user.recent);
  const heat   = streak>=10?'#ff3366':streak>=5?'#ff6600':streak>=3?'#ffaa00':'var(--gold)';

  return (
    <div className="streak-bar">
      <div className="s-left">
        <div className="s-fire">🔥</div>
        <div>
          <div className="s-cnt" style={{color:heat}}>{streak}</div>
          <div className="s-lbl">Win Streak</div>
        </div>
      </div>
      <div className="s-pips">
        {[...Array(5)].map((_,i) => {
          const r = recent[recent.length - 5 + i];
          return <div key={i} className={`pip${r==='won'?' won':r==='lost'?' lost':''}`}/>;
        })}
      </div>
      <div className="s-right">
        <div className="s-best-lbl">Best</div>
        <div className="s-best">{best}</div>
      </div>
    </div>
  );
}