import useStore from '../store/useStore.js';
import { Audio } from '../lib/audio.js';
import api from '../services/api.js';

export default function WalletModal() {
  const wModal      = useStore(s => s.wModal);
  const wEntry      = useStore(s => s.wEntry);
  const wChip       = useStore(s => s.wChip);
  const setWEntry   = useStore(s => s.setWEntry);
  const setWChip    = useStore(s => s.setWChip);
  const closeWallet = useStore(s => s.closeWallet);
  const setUserFromApi = useStore(s => s.setUserFromApi);
  const loadTxns    = useStore(s => s.loadTxns);
  const fireToast   = useStore(s => s.fireToast);

  const wAmt = parseInt(wEntry) || 0;

  const wKey = k => {
    Audio.click(); setWChip(null);
    if (k === 'del')     setWEntry(wEntry.length > 1 ? wEntry.slice(0,-1) : '0');
    else if (k === '00') setWEntry(wEntry === '0' ? '0' : wEntry.length >= 6 ? wEntry : wEntry + '00');
    else                 setWEntry(wEntry === '0' ? k  : wEntry.length >= 6 ? wEntry : wEntry + k);
  };

  const wQuick = a => { Audio.click(); setWEntry(String(a)); setWChip(a); };

  const wConfirm = async () => {
    if (!wAmt || wAmt <= 0) return;
    try {
      if (wModal.mode === 'deposit') {
        await api.post(`/wallet/deposit?amount=${wAmt}`);
        Audio.win(); fireToast(`✓ R${wAmt.toLocaleString('en-ZA')} deposited!`);
      } else {
        await api.post(`/wallet/withdraw?amount=${wAmt}`);
        Audio.loss(); fireToast(`↑ R${wAmt.toLocaleString('en-ZA')} withdrawal processed`);
      }
      const { data } = await api.get('/auth/me');
      setUserFromApi(data);
      await loadTxns();
      closeWallet();
    } catch (e) {
      fireToast(e.response?.data?.detail || 'Transaction failed');
    }
  };

  return (
    <div className="wm-back open">
      <div className="wm-sheet" onClick={e => e.stopPropagation()}>
        <div>
          <div className="wm-title">{wModal.mode === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</div>
          <div className="wm-sub">{wModal.mode === 'deposit' ? 'Add funds to your current balance' : 'Withdraw from your current balance'}</div>
        </div>
        <div className={`wm-disp${wAmt > 0 ? ' hv' : ''}`}>
          <div className="wm-cur">ZAR</div>
          <div className="wm-amt">{wAmt > 0 ? wAmt.toLocaleString('en-ZA') : '0'}</div>
        </div>
        <div className="wm-chips">
          {[50,100,250,500].map(a => (
            <div key={a} className={`wm-chip${wChip === a ? ' sel' : ''}`} onClick={() => wQuick(a)}>R{a}</div>
          ))}
        </div>
        <div className="wm-pad">
          {['1','2','3','4','5','6','7','8','9','del','0','00'].map(k => (
            <div key={k} className={`wm-key${k==='del'?' del':k==='00'?' z2':''}`} onClick={() => wKey(k)}>
              {k === 'del' ? '⌫' : k}
            </div>
          ))}
        </div>
        <button className={`wm-confirm${wModal.mode === 'deposit' ? ' wm-dep' : ' wm-wit'}`}
          disabled={wAmt <= 0} onClick={wConfirm}>
          {wModal.mode === 'deposit' ? 'DEPOSIT FUNDS ↓' : 'WITHDRAW FUNDS ↑'}
        </button>
        <div className="wm-cancel" onClick={closeWallet}>CANCEL</div>
      </div>
    </div>
  );
}