import useStore from '../../store/useStore.js';

export default function OrbitAnimation() {
  const dots = useStore(s => s.dots), orbitActive = useStore(s => s.orbitActive);
  const shake = useStore(s => s.shake), coreS = useStore(s => s.coreS);
  const r3S = useStore(s => s.r3S), nmShow = useStore(s => s.nmShow);
  const planetStep = useStore(s => s.planetStep), orbitSt = useStore(s => s.orbitSt);
  const resBanner = useStore(s => s.resBanner);

  const yOff = ['-85px','-57px','-20px','0px'][Math.min(planetStep, 3)];
  const wins = dots.filter(d => d==='won').length, loss = dots.filter(d => d==='lost'||d==='near').length;
  const pCls = orbitActive ? (wins > loss ? ' win' : loss > wins ? ' lose' : '') : '';

  return (
    <>
      <div className="orbit-sec" id="orbit-section">
        <div className="orbit-title">Probability Orbit</div>
        <div className={`orbit${shake ? ' shaking' : ''}`}>
          <div className={`otrace${orbitActive?' show':''}`} style={{width:170,height:170}}/>
          <div className={`otrace${orbitActive?' show':''}`} style={{width:114,height:114}}/>
          <div className={`ring r3${orbitActive?' sp ar':''}${r3S?` ${r3S}`:''}`}/>
          <div className={`ring r2${orbitActive?' sp ar':''}`}/>
          <div className={`core${coreS?` ${coreS}`:''}`}/>
          {orbitActive && <div className={`planet${pCls}`} style={{position:'absolute',top:'50%',left:'50%',transform:`translate(-50%,-50%) translateY(${yOff})`}}/>}
          <div className={`nm-overlay${nmShow?' show':''}`}/>
        </div>
        <div className="rounds">
          <div className={`rdot${dots[0]?` ${dots[0]}`:''}`}/><div className="rsep">—</div>
          <div className={`rdot${dots[1]?` ${dots[1]}`:''}`}/><div className="rsep">—</div>
          <div className={`rdot${dots[2]?` ${dots[2]}`:''}`}/>
        </div>
        <div className={`orbit-status${coreS?` ${coreS}`:''}`}>{orbitSt}</div>
      </div>
      <div className={`res-banner${resBanner.show?' show':''} ${resBanner.type}`}>{resBanner.text}</div>
    </>
  );
}