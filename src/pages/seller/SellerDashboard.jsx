import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { seller } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useSpeak } from '../../context/SpeakContext';
import { PageHeader, ErrorNote } from '../../components/Ui';

export default function SellerDashboard() {
  const [rows, setRows] = useState([{ name: '', qty: '' }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [detectBusy, setDetectBusy] = useState(false);
  const fileRef = useRef(null);
  const { push } = useToast();
  const { setNarration } = useSpeak();
  const navigate = useNavigate();

  useEffect(() => {
    setNarration(
      'Naya order panna. Yahan aap likh sakte hain kya bechna hai aur kitni quantity. Jaise Battery 3, Laptop 1. Chahti ho to photo bhi daal sakte hain, photo se item identify ho jayega. Phir search karein, aapko area ke kharidar mil jayenge.',
    );
  }, [setNarration]);

  function setRow(i, key, val) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, { name: '', qty: '' }]);
  }

  function removeRow(i) {
    setRows((rs) => (rs.length === 1 ? [{ name: '', qty: '' }] : rs.filter((_, idx) => idx !== i)));
  }

  function toItems() {
    const items = {};
    for (const r of rows) {
      const name = (r.name || '').trim();
      const qty = parseInt(r.qty, 10);
      if (name && qty > 0) items[name] = qty;
    }
    return items;
  }

  async function search() {
    const items = toItems();
    if (!Object.keys(items).length) {
      setError('Kam se kam ek item naam + quantity daalein.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await seller.search(items);
      sessionStorage.setItem('kk_results', JSON.stringify(res));
      sessionStorage.setItem('kk_items', JSON.stringify(items));
      navigate('/seller/results');
    } catch (e) {
      setError(e.message);
      push(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function onFiles(files) {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    if (arr.length > 5) {
      push('Maximum 5 photos.', 'error');
      return;
    }
    setDetectBusy(true);
    setError(null);
    try {
      const detected = await seller.detect(arr);
      if (detected?.length) {
        push(`Detect hua: ${detected.join(', ')} 🎉`, 'info');
        setRows((rs) => [
          ...detected.map((name) => ({ name, qty: '' })),
          ...rs.filter((r) => r.name.trim() || r.qty.trim()),
        ]);
      } else {
        push('Kuch detect nahi hua — naam khud daalein.', 'warn');
      }
    } catch (e) {
      setError('Photo detect nahi ho paya: ' + e.message);
    } finally {
      setDetectBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const validCount = Object.keys(toItems()).length;

  return (
    <>
      <PageHeader
        title="🧺 Naya Order banaayein"
        sub="Bataayein kya-kya bechna hai — sahi kharidar hum dhoondhenge"
        action={
          <>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            <button className="btn btn-soft" onClick={() => fileRef.current?.click()} disabled={detectBusy}>
              {detectBusy ? '🤖 Identify ho raha...' : '📷 Photo se identify karein'}
            </button>
          </>
        }
      />

      <div className="card">
        <ErrorNote error={error} />

        {rows.map((r, i) => (
          <div className="input-row" key={i} style={{ marginBottom: 10 }}>
            <div className="field" style={{ flex: 2 }}>
              <input
                className="input"
                placeholder="Item ka naam — jaise Battery, Laptop, Mobile"
                value={r.name}
                onChange={(e) => setRow(i, 'name', e.target.value)}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="Quantity"
                value={r.qty}
                onChange={(e) => setRow(i, 'qty', e.target.value)}
              />
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)}>✕</button>
          </div>
        ))}

        <div className="input-row" style={{ marginTop: 4 }}>
          <button className="btn btn-ghost" onClick={addRow}>+ Item aur jodein</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={search} disabled={busy || validCount === 0}>
            {busy ? 'Kharidar mil rahe hain...' : '🔍 Sahi kharidar dhundo'}
          </button>
        </div>
      </div>

      <div className="card mt-16">
        <h3>💡 Kaisa kaam karta hai?</h3>
        <p className="muted" style={{ marginBottom: 0 }}>
          Aap items daalte hi system aapke area ke paas ki companies aur unke distributors ko dekhta hai.
          Jo company us item mein deal karti hai, uski list aati hai — rate ke saath aur isse bhi, kis se baat karni hai:
          <b> kam quantity</b> par district distributor se aur <b> zyada quantity</b> par company se seedha.
        </p>
      </div>
    </>
  );
}