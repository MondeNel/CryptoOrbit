import { useEffect, useRef } from 'react';
import useStore, { fmtP } from '../../store/useStore.js';
import { Audio } from '../../lib/audio.js';

const CELL_H = 52;

function ReelCell({ digit, dimmed, colIndex, spinTick }) {
  const reelRef = useRef(null), prevTick = useRef(spinTick), prevDigit = useRef(digit), initDone = useRef(false);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel || initDone.current) return;
    initDone.current = true;
    reel.style.transition = 'none'; reel.style.transform = 'translateY(0px)';
    reel.innerHTML = '';
    const el = document.createElement('div'); el.className = 'r-digit'; el.textContent = digit;
    reel.appendChild(el); prevDigit.current = digit;
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!initDone.current) return;
    const reel = reelRef.current; if (!reel) return;
    reel.style.transition = 'none'; reel.style.transform = 'translateY(0px)';
    reel.innerHTML = '';
    const el = document.createElement('div'); el.className = 'r-digit'; el.textContent = digit;
    reel.appendChild(el); prevDigit.current = digit;
  }, [digit]); // eslint-disable-line

  useEffect(() => {
    if (spinTick === prevTick.current) return;
    prevTick.current = spinTick;
    const reel = reelRef.current; if (!reel) return;
    const timer = setTimeout(() => {
      const cur = parseInt(prevDigit.current) || 0, tgt = parseInt(digit) || 0;
      const steps = []; let v = cur;
      const total = 2 * 10 + ((tgt - cur + 10) % 10 || 10);
      for (let i = 0; i < total; i++) { v = (v + 1) % 10; steps.push(v); }
      steps[steps.length - 1] = tgt;
      reel.style.transition = 'none'; reel.style.transform = 'translateY(0px)'; reel.innerHTML = '';
      const startEl = document.createElement('div'); startEl.className = 'r-digit'; startEl.textContent = cur; reel.appendChild(startEl);
      steps.forEach(n => { const el = document.createElement('div'); el.className = 'r-digit'; el.textContent = n; reel.appendChild(el); });
      const dist = steps.length * CELL_H, dur = (steps.length * 75) / 1000;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        reel.style.transition = `transform ${dur}s cubic-bezier(0.12,0.8,0.3,1)`;
        reel.style.transform  = `translateY(-${dist}px)`;
        Audio.tick();
      }));
      prevDigit.current = digit;
    }, colIndex * 120);
    return () => clearTimeout(timer);
  }, [spinTick]); // eslint-disable-line

  return (
    <div className={`dc${dimmed ? ' dim' : ''}`}>
      <div className="reel" ref={reelRef}><div className="r-digit">{digit}</div></div>
      <div className="vig" />
    </div>
  );
}

export default function PriceTicker() {
  const prices   = useStore(s => s.prices);
  const sym      = useStore(s => s.sym);
  const spinTick = useStore(s => s.spinTick);
  const str = fmtP(prices[sym], sym);
  let col = 0;
  return (
    <div className="ticker">
      {str.split('').map((ch, i) =>
        ch === '.' ? <div key={i} className="dsep">.</div>
          : <ReelCell key={`${sym}-${i}`} digit={ch} dimmed={col%2===1} colIndex={col++} spinTick={spinTick} />
      )}
    </div>
  );
}