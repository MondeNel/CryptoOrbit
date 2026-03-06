import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore.js';
import api from '../services/api.js';
import { Audio } from '../lib/audio.js';

export default function LoginPage() {
  const [form, setForm] = useState({ u: '', p: '' });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { setToken, loadMe } = useStore(s => ({ setToken: s.setToken, loadMe: s.loadMe }));

  const submit = async () => {
    if (!form.u || !form.p) { setErr('Fill in all fields'); return; }
    setErr(''); setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { username: form.u, password: form.p });
      setToken(data.access_token, data.refresh_token);
      Audio.click();
      await loadMe();
      navigate('/', { replace: true });
    } catch (e) {
      setErr(e.response?.data?.detail || 'Login failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="app">
      <div className="auth-over">
        <div className="auth-logo-block">
          <span className="auth-logo-ico">◎</span>
          <div className="auth-logo-txt">ORBITBET</div>
        </div>
        <div className="auth-card">
          <div className="auth-tabs">
            <button className="atab on">LOGIN</button>
            <button className="atab" onClick={() => navigate('/register')}>REGISTER</button>
          </div>
          <div className="afield"><label>Username</label>
            <input placeholder="your_username" value={form.u}
              onChange={e => setForm(p => ({...p, u: e.target.value}))}
              onKeyDown={e => e.key==='Enter' && submit()}/>
          </div>
          <div className="afield" style={{marginBottom:18}}><label>Password</label>
            <input type="password" placeholder="••••••••" value={form.p}
              onChange={e => setForm(p => ({...p, p: e.target.value}))}
              onKeyDown={e => e.key==='Enter' && submit()}/>
          </div>
          {err && <div className="aerr">{err}</div>}
          <button className="asub" disabled={busy} onClick={submit}>
            {busy ? 'CONNECTING...' : 'LAUNCH'}
          </button>
          <div className="abonus">🎁 R10 free balance automatically credited</div>
        </div>
      </div>
    </div>
  );
}