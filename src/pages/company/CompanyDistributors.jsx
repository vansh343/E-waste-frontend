import { useCallback, useEffect, useState } from 'react';
import { company } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useSpeak } from '../../context/SpeakContext';
import { Empty, PageHeader, Spinner } from '../../components/Ui';

export default function CompanyDistributors() {
  const [distributors, setDistributors] = useState(null);
  const [form, setForm] = useState({ name: '', area: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const { setNarration } = useSpeak();

  const load = useCallback(async () => {
    try {
      setDistributors(await company.distributors());
    } catch (e) {
      push(e.message, 'error');
      setDistributors([]);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setNarration(
      'Mere distributors wala panna. Distributor aapke area ke paas wale khareed hain. Unka naam, area aur phone number add karein. Distributor add karte hi uske paas apna login bhi ban jata hai.',
    );
  }, [setNarration]);

  async function addDistributor() {
    const name = form.name.trim();
    const area = form.area.trim();
    const phone = form.phone.trim();
    if (!name || !area || !phone) {
      push('Naam, area aur phone sab bharein', 'error');
      return;
    }
    setBusy(true);
    try {
      await company.addDistributor({ name, area, phone });
      setForm({ name: '', area: '', phone: '' });
      push('Distributor add ho gaya ✓ Unka login bhi ban gaya', 'info');
      await load();
    } catch (e) {
      push(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removeDistributor(id, name) {
    if (!window.confirm(`${name} ko remove karein?`)) return;
    try {
      await company.removeDistributor(id);
      push('Distributor remove ho gaya', 'warn');
      await load();
    } catch (e) {
      push(e.message, 'error');
    }
  }

  if (distributors === null) return <Spinner />;

  return (
    <>
      <PageHeader title="🚚 Mere Distributors" sub="Aapke company ke distributors — add/remove karein" />

      <div className="card" style={{ borderColor: 'var(--green-400)' }}>
        <h3>🆕 Naya distributor jodein</h3>
        <div className="input-row">
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Naam</label>
            <input
              className="input"
              placeholder="jaise Raju Sahab"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Area</label>
            <input
              className="input"
              placeholder="jaise Lal Chowk"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Phone</label>
            <input
              className="input"
              placeholder="jaise 9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="input-row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={addDistributor} disabled={busy}>
            {busy ? 'Joda ja raha...' : '+ Distributor jodein'}
          </button>
        </div>
      </div>

      <div className="section-title"><h2>List</h2></div>
      <div className="card">
        {distributors.length === 0 && <Empty>Abhi koi distributor nahi. Upar se jodein.</Empty>}
        {distributors.map((d) => (
          <div className="row" key={d.distributorId}>
            <div className="row-main">
              <div className="row-title">🚚 {d.name}</div>
              <div className="row-sub">
                {d.area} · 📞 {d.phone}
                {d.customerId ? ' · Login bana hua hai ✓' : ' · Login pending'}
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => removeDistributor(d.distributorId, d.name)}>
              🗑
            </button>
          </div>
        ))}
      </div>
    </>
  );
}