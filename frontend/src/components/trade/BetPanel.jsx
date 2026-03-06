import useStore from '../../store/useStore.js';
import { Audio } from '../../lib/audio.js';
import { useBetEngine } from '../../hooks/useBetEngine.js';

export default function BetPanel() {
  const stake    = useStore(s => s.stake);
  const setStake = useStore(s => s.setStake);
  const betting  = useStore(s => s.betting);
  const balance  = useStore(s => s.user.current_balance);
  const { placeBet } = useBetEngine();

  return (
    <>
      <div className="stake-row" id="stake-section">
        <span className="stake-label">Stake</span>
        <div className="stake-ctrl">
          <button className="stake-btn" disabled={betting}
            onClick={() => { setStake(stake - 10); Audio.click(); }}>−</button>
          <div className="stake-val">R {stake}</div>
          <button className="stake-btn" disabled={betting}
            onClick={() => { setStake(stake + 10); Audio.click(); }}>+</button>
        </div>
      </div>
      <div className="bet-btns" id="bet-btns">
        <button className="btn-up" disabled={betting || stake > balance}
          onClick={() => placeBet('up')}>▲ &nbsp;UP</button>
        <button className="btn-dn" disabled={betting || stake > balance}
          onClick={() => placeBet('down')}>DOWN &nbsp;▼</button>
      </div>
    </>
  );
}