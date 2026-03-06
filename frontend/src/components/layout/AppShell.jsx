import { useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore.js';
import { Audio } from '../../lib/audio.js';
import WalletModal from '../WalletModal.jsx';

const NAV = [
  { path: '/',        ico: '◎', label: 'Trade'   },
  { path: '/history', ico: '◷', label: 'History' },
  { path: '/wallet',  ico: '◈', label: 'Wallet'  },
  { path: '/profile', ico: '◉', label: 'Profile' },
];

export default function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const appRef    = useRef(null);

  const milestone = useStore(s => s.milestone);
  const toastMsg  = useStore(s => s.toastMsg);
  const toastShow = useStore(s => s.toastShow);
  const obStep    = useStore(s => s.obStep);
  const obNext    = useStore(s => s.obNext);
  const obSkip    = useStore(s => s.obSkip);
  const wModal    = useStore(s => s.wModal);

  const OB_STEPS = [
    { targetId: 'ticker-section', headline: <>Watch the <span>live price</span></>,  body: 'Every digit updates in real time — like a slot machine counting your money.' },
    { targetId: 'bet-btns',       headline: <>Call <span>UP</span> or <span>DOWN</span></>, body: 'Predict whether the next price move will go UP or DOWN.' },
    { targetId: 'orbit-section',  headline: <>The <span>Probability Orbit</span></>, body: 'Three rounds resolve one by one. Win 2 of 3 and the payout is yours at 1.85×.' },
    { targetId: 'stake-section',  headline: <>Set your <span>stake</span></>,         body: 'Choose how much to risk per bet. Minimum R10, maximum R10,000.' },
  ];

  const obActive = obStep >= 0 && obStep < OB_STEPS.length;
  const obInfo   = obActive ? OB_STEPS[obStep] : null;

  let obRect = null;
  if (obActive && appRef.current) {
    const el = document.getElementById(OB_STEPS[obStep].targetId);
    if (el) {
      const r   = el.getBoundingClientRect();
      const app = appRef.current.getBoundingClientRect();
      obRect = { top: r.top-app.top-8, left: r.left-app.left-8, width: r.width+16, height: r.height+16 };
    }
  }

  return (
    <div className="app" ref={appRef}>
      <div className={`milestone${milestone.show ? ' show' : ''}`}>{milestone.text}</div>
      <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>

      {/* onboarding overlay */}
      <div className={`ob-overlay${obActive ? ' active' : ''}`}>
        <div className="ob-mask" />
        {obRect && <div className="ob-spotlight" style={{ top:obRect.top, left:obRect.left, width:obRect.width, height:obRect.height }} />}
        {obInfo && (
          <div className="ob-card" style={{ bottom: obRect && obRect.top > 400 ? 'auto' : '80px', top: obRect && obRect.top > 400 ? '24px' : 'auto' }}>
            <span className="ob-skip" onClick={obSkip}>SKIP</span>
            <div className="ob-pips">{OB_STEPS.map((_,i) => <div key={i} className={`ob-pip${i<=obStep?' done':''}`}/>)}</div>
            <div className="ob-step-num">STEP {obStep+1} OF {OB_STEPS.length}</div>
            <div className="ob-headline">{obInfo.headline}</div>
            <div className="ob-body">{obInfo.body}</div>
            <button className="ob-next" onClick={obNext}>{obStep < OB_STEPS.length-1 ? 'NEXT →' : 'START PLAYING'}</button>
          </div>
        )}
      </div>

      {wModal.open && <WalletModal />}
      <Outlet context={{ appRef }} />

      <div className="bnav">
        {NAV.map(n => (
          <div key={n.path} className={`ni${location.pathname === n.path ? ' on' : ''}`}
            onClick={() => { navigate(n.path); Audio.click(); }}>
            <span className="ni-ico">{n.ico}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}