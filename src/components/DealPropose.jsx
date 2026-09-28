import { useState } from 'react';
import { deal } from '../api';
import { useToast } from '../context/ToastContext';
import { useSpeak } from '../context/SpeakContext';
import { Badge } from './Ui';

export default function DealPropose({
  product,
  quantity,
  counterpartyId,
  productOptions,
  disabled,
  onLocked,
}) {
  const [productId, setProductId] = useState(product ?? '');
  const [qty, setQty] = useState(quantity ?? '');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const { speak } = useSpeak();

  async function propose() {
    const pid = Number(productId);
    const q = Number(qty);
    const amt = parseFloat(amount);
    if (!pid || !q || q <= 0) {
      push('Product aur quantity sahi chunein', 'error', 2500);
      return;
    }
    if (!amt || amt <= 0) {
      push('Sahi amount daalein', 'error', 2500);
      return;
    }
    setBusy(true);
    try {
      const res = await deal.propose({
        productId: pid,
        quantity: q,
        counterpartyId,
        amount: amt,
      });
      setResult(res);
      if (res.status === 'LOCKED') {
        push('Deal LOCK ho gayi! QR flow shuru karein', 'info');
        speak(`Deal lock ho gayi! ${Number(amt).toLocaleString('en-IN')} rupaye par. Ab QR scan karke accept karein.`);
        onLocked?.(res.ledger);
      } else if (res.status === 'NEGOTIATING') {
        push('Amount record ho gaya. Doosre side ka intezaar hai.', 'warn');
        speak('Aapka amount record kar liya gaya hai. Doosre side ke final amount ka intezaar karein.');
      } else if (res.status === 'MISMATCH') {
        push('Amounts match nahi hue — dobara negotiate karein', 'error');
        speak('Dono side ke amount match nahi hue. Dobara chat mein final price pakka karein aur dobara propose karein.');
      }
    } catch (e) {
      push(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ borderColor: 'var(--green-400)' }}>
      <h3 style={{ marginBottom: 4 }}>💰 Final amount pakka karein</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Dono side ko <b>same amount</b> daalna hoga tab deal lock hogi. Yahi bargaining ka final step hai.
      </p>

      {!product && (
        <div className="input-row">
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Product</label>
            {productOptions?.length ? (
              <select className="select" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">— chunein —</option>
                {productOptions.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                type="number"
                placeholder="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            )}
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Quantity</label>
            <input
              className="input"
              type="number"
              min="1"
              placeholder="jaise 3"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="input-row">
        <div className="field" style={{ flex: 3 }}>
          <label className="label">Aapka final amount (₹)</label>
          <input
            className="input"
            type="number"
            min="1"
            step="1"
            placeholder="jaise 480"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label className="label">Karein</label>
          <button className="btn btn-primary btn-block" onClick={propose} disabled={busy || disabled}>
            {busy ? 'Bheja ja raha...' : 'Propose'}
          </button>
        </div>
      </div>
      {result && (
        <div className="mt-8">
          <Badge tone={result.status === 'LOCKED' ? 'green' : result.status === 'MISMATCH' ? 'red' : 'amber'}>
            {result.status === 'LOCKED' ? 'Locked ✓' : result.status === 'MISMATCH' ? 'Match nahi hua' : 'Waiting...'}
          </Badge>
          <p className="muted" style={{ marginBottom: 0 }}>{result.message}</p>
        </div>
      )}
    </div>
  );
}