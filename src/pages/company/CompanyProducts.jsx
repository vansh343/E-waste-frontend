import { useCallback, useEffect, useState } from 'react';
import { company } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useSpeak } from '../../context/SpeakContext';
import { Badge, Empty, PageHeader, Spinner } from '../../components/Ui';
import { timeAgo } from '../../api';

export default function CompanyProducts() {
  const [products, setProducts] = useState(null);
  const [form, setForm] = useState({ productName: '', quantity: '', priceRange: '', description: '' });
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const { setNarration } = useSpeak();

  const load = useCallback(async () => {
    try {
      setProducts(await company.products());
    } catch (e) {
      push(e.message, 'error');
      setProducts([]);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setNarration(
      'Mere products wala panna. Yahan aap apni company ke products, unki stock quantity aur price range jod sakte hain. Example: Battery, price 500–600 rupaye, profit 100 unit. Bechne wale yehi prices dekhte hain.',
    );
  }, [setNarration]);

  async function addProduct() {
    const name = form.productName.trim();
    if (!name) {
      push('Product ka naam daalein', 'error');
      return;
    }
    setBusy(true);
    try {
      await company.addProduct({
        productName: name,
        quantity: parseInt(form.quantity, 10) || 0,
        priceRange: form.priceRange.trim(),
        description: form.description.trim(),
      });
      setForm({ productName: '', quantity: '', priceRange: '', description: '' });
      push('Product jod diya gaya ✓', 'info');
      await load();
    } catch (e) {
      push(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(id, name) {
    if (!window.confirm(`${name} delete karein?`)) return;
    try {
      await company.removeProduct(id);
      push('Product delete ho gaya', 'info');
      await load();
    } catch (e) {
      push(e.message, 'error');
    }
  }

  if (products === null) return <Spinner />;

  return (
    <>
      <PageHeader title="📦 Mere Products" sub="Kya saman lete hain — rate ke saath" />

      <div className="card" style={{ borderColor: 'var(--green-400)' }}>
        <h3>🆕 Naya product jodein</h3>
        <div className="field">
          <label className="label">Product ka naam</label>
          <input
            className="input"
            placeholder="jaise Battery, Laptop, Old Mobile"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
          />
        </div>
        <div className="input-row">
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Stock quantity (unit)</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="jaise 100"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Price range (₹)</label>
            <input
              className="input"
              placeholder="jaise 500-600"
              value={form.priceRange}
              onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Description <span className="muted">(optional)</span></label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="jaise Working laptop, sahi haalat"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="input-row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={addProduct} disabled={busy}>
            {busy ? 'Joda ja raha...' : '+ Product jodein'}
          </button>
        </div>
      </div>

      <div className="section-title"><h2>List</h2></div>
      <div className="card">
        {products.length === 0 && <Empty>Abhi koi product nahi. Upar se pehla product jodein.</Empty>}
        {products.map((p) => (
          <div className="row" key={p.companyProductId}>
            <div className="row-main">
              <div className="row-title">📦 {p.productName}</div>
              <div className="row-sub">
                Stock: <b>{p.quantity}</b> unit · {p.createdAt ? timeAgo(p.createdAt) : ''}
              </div>
              {p.description ? <div className="row-sub">{p.description}</div> : null}
            </div>
            <Badge tone="green">₹ {p.priceRange?.replace(/-/g, '–')}</Badge>
            <button className="btn btn-danger btn-sm" onClick={() => removeProduct(p.companyProductId, p.productName)}>
              🗑
            </button>
          </div>
        ))}
      </div>
    </>
  );
}