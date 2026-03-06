import { useNavigate } from 'react-router-dom';
import useStore, { fmtZAR } from '../store/useStore.js';
import { Audio } from '../lib/audio.js';

export default function ProfilePage() {
  const user     = useStore(s => s.user);
  const logout   = useStore(s => s.logout);
  const navigate = useNavigate();

  const xpInLvl = user.xp % 500;
  const xpPct   = xpInLvl / 500;
  const winRate = user.total_bets > 0
    ? ((user.total_wins / user.total_bets) * 100).toFixed(1)
    : '0.0';

  const doLogout = () => {
    Audio.click();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', minHeight:0 }}>
      <div className="profile-wrap">
        <div className="profile-col">

          <div className="prof-hero">
            <div className="prof-av">◉</div>
            <div>
              <div className="prof-name">{user.username}</div>
              <div className="prof-lv">LEVEL {user.level}</div>
              <div className="prof-bal">{fmtZAR(user.current_balance)}</div>
            </div>
          </div>

          <div className="xp-card">
            <div className="xp-lr">
              <span className="xp-lbl">XP Progress — Level {user.level}</span>
              <span className="xp-v">{xpInLvl} / 500</span>
            </div>
            <div className="xp-bg">
              <div className="xp-fill" style={{ width: `${xpPct * 100}%` }} />
            </div>
            <div className="xp-lvrow">
              <span>LVL {user.level}</span>
              <span>{500 - xpInLvl} XP to LVL {user.level + 1}</span>
            </div>
          </div>

          <div className="stat-grid">
            {[
              { i: '⚡', v: user.xp,          l: 'Total XP'     },
              { i: '🔥', v: user.streak,       l: 'Win Streak'   },
              { i: '🏆', v: user.best_streak,  l: 'Best Streak'  },
              { i: '📅', v: user.login_streak, l: 'Login Streak' },
              { i: '🎯', v: user.total_bets,   l: 'Total Bets'   },
              { i: '📈', v: `${winRate}%`,     l: 'Win Rate'     },
            ].map(s => (
              <div key={s.l} className="sc">
                <div className="sc-ico">{s.i}</div>
                <div className="sc-val">{s.v}</div>
                <div className="sc-lbl">{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', marginBottom:18, fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:'var(--muted)', lineHeight:1.7 }}>
            WIN  → 50 XP + min(streak × 5, 100)<br />
            LOSS → 10 XP participation reward<br />
            LEVEL = xp ÷ 500 + 1
          </div>

          <button className="logout-btn" onClick={doLogout}>LOGOUT</button>
        </div>
      </div>
    </div>
  );
}