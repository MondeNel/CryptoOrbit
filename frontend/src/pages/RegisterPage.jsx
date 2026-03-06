import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore.js';
import api from '../services/api.js';
import { Audio } from '../lib/audio.js';

export default function RegisterPage() {
  const [form, setForm] = useState({ u: '', e: '', p: '' });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { setToken, loadMe, obStart } = useStore(s => ({ setToken: s.setToken, loadMe: s.loadMe, obStart: s.obStart }));

  const submit = async () => {
    if (!form.u || !form.e || !form.p) { setErr('Fill in all fields'); return; }
    setErr(''); setBusy(true);
    try {
      const { data } = await api.post('/auth/register', { username: form.u, email: form.e, password: form.p });
      setToken(data.access_token, data.refresh_token);
      Audio.click();
      await loadMe();
      navigate('/', { replace: true });
      setTimeout(() => obStart(), 400); // trigger onboarding for new users
    } catch (e) {
      setErr(e.response?.data?.detail || 'Registration failed');
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
            <button className="atab" onClick={() => navigate('/login')}>LOGIN</button>
            <button className="atab on">REGISTER</button>
          </div>
          <div className="afield"><label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.e}
              onChange={e => setForm(p => ({...p, e: e.target.value}))}/>
          </div>
          <div className="afield"><label>Username</label>
            <input placeholder="your_username" value={form.u}
              onChange={e => setForm(p => ({...p, u: e.target.value}))}/>
          </div>
          <div className="afield" style={{marginBottom:18}}><label>Password</label>
            <input type="password" placeholder="••••••••" value={form.p}
              onChange={e => setForm(p => ({...p, p: e.target.value}))}
              onKeyDown={e => e.key==='Enter' && submit()}/>
          </div>
          {err && <div className="aerr">{err}</div>}
          <button className="asub" disabled={busy} onClick={submit}>
            {busy ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
          <div className="abonus">🎁 R10 free balance automatically credited</div>
        </div>
      </div>
    </div>
  );
}