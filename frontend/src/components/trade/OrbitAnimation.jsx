import useStore from '../../store/useStore.js';

export default function OrbitAnimation() {
  const rawDots    = useStore(s => s.dots);
  const orbitActive = useStore(s => s.orbitActive);

  console.log('dots:', typeof rawDots, JSON.stringify(rawDots))

  // ✅ FIX: dots can briefly be null/undefined during the loss reset cascade.
  // Guard here so .filter() never throws and blanks the screen.
  const dots = Array.isArray(rawDots) ? rawDots : [null, null, null];

  const shake      = useStore(s => s.shake);
  const coreS      = useStore(s => s.coreS);
  const r3S        = useStore(s => s.r3S);
  const nmShow     = useStore(s => s.nmShow);
  const planetStep = useStore(s => s.planetStep);
  const orbitSt    = useStore(s => s.orbitSt);
  const resBanner  = useStore(s => s.resBanner);

  const yOff = ['-85px', '-57px', '-20px', '0px'][Math.min(planetStep ?? 0, 3)];
  const wins = dots.filter(d => d === 'won').length;
  const loss = dots.filter(d => d === 'lost' || d === 'near').length;
  const pCls = orbitActive ? (wins > loss ? ' win' : loss > wins ? ' lose' : '') : '';

  return (
    <>
      <div className="orbit-sec" id="orbit-section">
        <div className="orbit-title">Probability Orbit</div>
        <div className={`orbit${shake ? ' shaking' : ''}`}>
          <div className={`otrace${orbitActive ? ' show' : ''}`} style={{ width: 170, height: 170 }} />
          <div className={`otrace${orbitActive ? ' show' : ''}`} style={{ width: 114, height: 114 }} />
          <div className={`ring r3${orbitActive ? ' sp ar' : ''}${r3S ? ` ${r3S}` : ''}`} />
          <div className={`ring r2${orbitActive ? ' sp ar' : ''}`} />
          <div className={`core${coreS ? ` ${coreS}` : ''}`} />
          {orbitActive && (
            <div
              className={`planet${pCls}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%,-50%) translateY(${yOff})`,
              }}
            />
          )}
          <div className={`nm-overlay${nmShow ? ' show' : ''}`} />
        </div>
        <div className="rounds">
          <div className={`rdot${dots[0] ? ` ${dots[0]}` : ''}`} /><div className="rsep">—</div>
          <div className={`rdot${dots[1] ? ` ${dots[1]}` : ''}`} /><div className="rsep">—</div>
          <div className={`rdot${dots[2] ? ` ${dots[2]}` : ''}`} />
        </div>
        <div className={`orbit-status${coreS ? ` ${coreS}` : ''}`}>{orbitSt}</div>
      </div>
      <div className={`res-banner${resBanner.show ? ' show' : ''} ${resBanner.type}`}>
        {resBanner.text}
      </div>
    </>
  );
}
