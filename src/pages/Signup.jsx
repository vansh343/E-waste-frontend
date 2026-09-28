import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth, ApiError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSpeak } from '../context/SpeakContext';
import { ErrorNote } from '../components/Ui';

const ROLES = {
  ROLE_SELLER: { icon: '🧑‍🌾', label: 'Seller (beche wala)', key: 'ROLE_SELLER' },
  ROLE_COMPANY: { icon: '🏢', label: 'Company (kharidar)', key: 'ROLE_COMPANY' },
};

export default function Signup() {
  const [params] = useSearchParams();
  const initialRole = params.get('role') === 'ROLE_COMPANY' ? 'ROLE_COMPANY' : 'ROLE_SELLER';
  const [role, setRole] = useState(initialRole);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessGstin, setBusinessGstin] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [pendingMsg, setPendingMsg] = useState(null);
  const { refresh, setUser } = useAuth();
  const { push } = useToast();
  const { setNarration } = useSpeak();
  const navigate = useNavigate();

  useEffect(() => {
    setNarration(
      'Signup panna. Pehle apna role chunein, phir mobile number, area ya location, aur company ke liye business ke details bharein. OTP verify karte hi aap andar aa jaayenge.',
    );
  }, [setNarration]);

  const isCompany = role === 'ROLE_COMPANY';
  const valid = useMemo(() => {
    const phoneOk = /^\+?[0-9]{8,15}$/.test(phone.trim());
    if (!phoneOk) return false;
    if (!location.trim()) return false;
    if (isCompany && !businessName.trim()) return false;
    return true;
  }, [phone, location, isCompany, businessName]);

  async function signUp() {
    setError(null);
    setBusy(true);
    try {
      const res = await auth.signup({
        phone: phone.trim(),
        role,
        location: location.trim(),
        businessName: businessName.trim() || null,
        businessGstin: businessGstin.trim() || null,
      });
      push(res.message || 'OTP bheja gaya ✓', 'info');
      setStep(2);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Signup mein dikkat.');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const res = await auth.verifyOtp(phone.trim(), code.trim());
      if (res && res.userdetail) {
        setUser(res.userdetail);
        await refresh();
        push('Aapka account ban gaya! Swagat hai 🎉', 'info');
      } else {
        setPendingMsg(res.message || 'Aapka account admin approval ke liye pending hai.');
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Verification fail.');
    } finally {
      setBusy(false);
    }
  }

  if (pendingMsg) {
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <div className="center">
            <div style={{ fontSize: 44 }}>⏳</div>
            <h1 className="mt-8">Account banane ki taiyaari</h1>
            <p className="muted">{pendingMsg}</p>
            <p className="muted" style={{ fontSize: 13 }}>
              Company accounts admin approve karte hain. Approve hone ke baad login ho sakte hain.
            </p>
            <div className="input-row mt-24 center" style={{ justifyContent: 'center' }}>
              <Link className="btn btn-primary" to="/login">Login page par jayein</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="center" style={{ marginBottom: 14 }}>
          <div className="brand-logo" style={{ margin: '0 auto 10px' }}>🍃</div>
          <h1 className="auth-title">Naya account banaayein</h1>
          <p className="auth-sub">Kabadi Connect mein shamil horein</p>
        </div>

        <div className="card">
          <div className="seg">
            {Object.values(ROLES).map((r) => (
              <button
                key={r.key}
                className={`btn ${role === r.key ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setRole(r.key)}
                type="button"
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>

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
              <div className="field">
                <label className="label">📍 Location / Area</label>
                <input
                  className="input"
                  placeholder="jaise Sgr, Srinagar ya Lalbazar"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              {isCompany && (
                <>
                  <div className="field">
                    <label className="label">🏢 Business name</label>
                    <input
                      className="input"
                      placeholder="jaise GreenSwap E-waste Co."
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="label">🧾 GSTIN <span className="muted">(optional)</span></label>
                    <input
                      className="input"
                      placeholder="jaise 01ABCDE1234F1Z5"
                      value={businessGstin}
                      onChange={(e) => setBusinessGstin(e.target.value)}
                    />
                  </div>
                </>
              )}
              {isCompany && (
                <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
                  Company account bante hi <b>admin approval</b> pending hoga — approve hone par hi login hoga.
                </p>
              )}
              <button className="btn btn-primary btn-block" onClick={signUp} disabled={busy || !valid}>
                {busy ? 'Bheja ja raha...' : 'OTP bhejein'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="muted" style={{ marginTop: 0 }}>
                OTP <b>{phone}</b> par bheja gaya. <span style={{ color: 'var(--green-700)' }}>Demo: koi bhi 6-digit code chalega.</span>
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
              <button className="btn btn-primary btn-block" onClick={verify} disabled={busy}>
                {busy ? 'Verify ho raha...' : 'Verify karke andar chalein →'}
              </button>
              <div className="input-row mt-8">
                <button className="btn btn-ghost btn-sm btn-block" onClick={() => setStep(1)} disabled={busy}>
                  ← Details badlein
                </button>
                <button className="btn btn-ghost btn-sm btn-block" onClick={signUp} disabled={busy}>
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </div>

        <p className="swap-link">
          Pehle se account hai? <Link to="/login">Login karein</Link>
        </p>
        <p className="center muted" style={{ fontSize: 12, marginTop: 14 }}>
          Distributor account aapki company banati hai — company se apna phone number lsit karaayein.
        </p>
      </div>
    </div>
  );
}