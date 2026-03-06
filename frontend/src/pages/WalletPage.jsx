import useStore, { fmtZAR, TXICON } from '../store/useStore.js';
import { Audio } from '../lib/audio.js';

export default function WalletPage() {
  const user = useStore(s => s.user), txns = useStore(s => s.txns);
  const openWallet = useStore(s => s.openWallet);

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden',minHeight:0}}>
      <div className="wallet-screen">
        <div className="wallet-panel">
          <div className="w-header">
            <div className="w-title">◈ · WALLET</div>
            <div className="w-bal-row">
              <div className="w-bal-item"><label>Account Balance</label><div className="wv">{fmtZAR(user.account_balance)}</div></div>
              <div className="w-bal-item" style={{textAlign:'right'}}><label>Current Balance</label><div className="wv g">{fmtZAR(user.current_balance)}</div></div>
            </div>
            <div className="w-acts">
              <button className="wb wb-dep" onClick={() => { openWallet('deposit'); Audio.click(); }}>＋ DEPOSIT</button>
              <button className="wb wb-wit" onClick={() => { openWallet('withdraw'); Audio.click(); }}>↑ WITHDRAW</button>
            </div>
          </div>
          <div className="tx-sec">
            <div className="tx-hd">Transaction History</div>
            {txns.length === 0 ? <div className="tx-empty">No transactions yet</div> :
              txns.map(tx => {
                const pos = tx.amt > 0 || tx.type === 'free';
                return (
                  <div key={tx.id} className="tx-item">
                    <div className={`tx-ico ${tx.type}`}>{TXICON[tx.type]||'◈'}</div>
                    <div className="tx-info"><div className="tx-lbl">{tx.lbl}</div><div className="tx-meta">{tx.time}</div></div>
                    <div className="tx-right">
                      <div className={`tx-amt ${tx.type==='free'?'gld':pos?'pos':'neg'}`}>{pos?'+':'-'}R{Math.abs(tx.amt).toFixed(2)}</div>
                      <div className="tx-bal">bal R{tx.bal.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}