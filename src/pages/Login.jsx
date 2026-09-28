import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, ApiError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSpeak } from '../context/SpeakContext';
import { ErrorNote } from '../components/Ui';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sentMsg, setSentMsg] = useState('');
  const { refresh } = useAuth();
  const { push } = useToast();
  const { setNarration } = useSpeak();
  const navigate = useNavigate();

  async function sendOtp() {
    setError(null);
    if (!phone.trim()) {
      setError('Phone number daalein.');
      return;
    }
    setBusy(true);
    try {
      const res = await auth.requestLoginOtp(phone.trim());
      setSentMsg(res.message || 'OTP bheja gaya.');
      setStep(2);
      push('OTP SMS bheja gaya ✓', 'info');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'OTP bhejne mein dikkat.');
    } finally {
      setBusy(false);
    }
  }

  async function doLogin() {
    setError(null);
    if (!code.trim()) {
      setError('OTP code daalein (demo: koi bhi 6 digit).');
      return;
    }
    setBusy(true);
    try {
      await auth.login(phone.trim());
      await refresh();
      push('Login ho gaya! Swagat hai 🎉', 'info');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login fail.');
    } finally {
      setBusy(false);
    }
  }

  const cta = phone.trim()?.length > 4 && phone.trim()?.match(/^\+?[0-9]{8,15}$/);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="center" style={{ marginBottom: 14 }}>
          <div className="brand-logo" style={{ margin: '0 auto 10px' }}>🍃</div>
          <h1 className="auth-title">Login karein</h1>
          <p className="auth-sub">Kabadi Connect mein wapas aayen</p>
        </div>

        <div className="card">
          <ErrorNote error={error} />

          {step === 1 && (
            <>
              <div className="field">
                <label className="label">📞 Mobile number</label>
                <input
                  className="input"
                  type="tel"
                  placeholder="jaise 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-block" onClick={sendOtp} disabled={busy || !cta}>
                {busy ? 'Bheja ja raha...' : 'OTP bhejein'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="muted" style={{ marginTop: 0 }}>
                OTP <b>{phone}</b> par bheja gaya. <span style={{ color: 'var(--green-700)' }}>Demo setup mein koi bhi 6-digit code chalega.</span>
              </p>
              <div className="field">
                <label className="label">🔐 OTP code</label>
                <input
                  className="input"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-block" onClick={doLogin} disabled={busy}>
                {busy ? 'Login ho raha...' : 'Login karein →'}
              </button>
              <div className="input-row mt-8">
                <button className="btn btn-ghost btn-sm btn-block" onClick={() => setStep(1)} disabled={busy}>
                  ← Number badlein
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-block"
                  onClick={sendOtp}
                  disabled={busy}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          {sentMsg && step === 2 && (
            <div className="center muted" style={{ marginTop: 12, fontSize: 13 }}>{sentMsg}</div>
          )}
        </div>

        <p className="swap-link">
          Naya account banana hai? <Link to="/signup">Signup karein</Link>
        </p>
      </div>
    </div>
  );
}