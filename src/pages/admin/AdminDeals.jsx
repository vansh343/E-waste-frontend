import { useEffect, useState } from 'react';
import { admin } from '../../api';
import { PageHeader, Spinner, Empty } from '../../components/Ui';
import { timeAgo } from '../../api';

const STATUS_TONE = {
  PENDING: 'badge-amber',
  LOCKED: 'badge-blue',
  ACCEPT_WINDOW: 'badge-blue',
  DONE: 'badge-green',
  NEGOTIATING: 'badge-gray',
};

const STATUS_LABEL = {
  PENDING: '⏳ Pending',
  LOCKED: '🔒 Locked',
  ACCEPT_WINDOW: '✅ Accept window',
  DONE: '🎉 Done',
  NEGOTIATING: '🤝 Discussing',
};

export default function AdminDeals() {
  const [deals, setDeals] = useState([]);
  const [busy, setBusy] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    admin
      .allDeals()
      .then((d) => setDeals(d || []))
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <Spinner />;

  const list = filter === 'ALL' ? deals : deals.filter((d) => d.status === filter);

  return (
    <>
      <PageHeader
        title="🤝 Sare Deals"
        sub="Har role ke deal records — poori marketplace ka poora ledger"
      />

      <div className="seg-tabs">
        <button className={`seg-btn${filter === 'ALL' ? ' active' : ''}`} onClick={() => setFilter('ALL')}>
          Sab ({deals.length})
        </button>
        {Object.keys(STATUS_LABEL).map((s) => (
          <button key={s} className={`seg-btn${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {STATUS_LABEL[s]} ({deals.filter((d) => d.status === s).length})
          </button>
        ))}
      </div>

      {error && <div className="card" style={{ color: 'var(--danger)' }}>⚠️ {error}</div>}
      {!error && list.length === 0 && <Empty>Koi deal nahi mila.</Empty>}

      {list.map((d) => (
        <div className="card" key={d.ledgerId}>
          <div className="admin-card-row">
            <div>
              <div className="row-title" style={{ fontWeight: 800, fontSize: 16 }}>
                📦 {d.productName} × {d.quantity}
              </div>
              <div className="muted mono" style={{ fontSize: 12.5 }}>
                {d.orderId} · {timeAgo(d.createdAt)}
              </div>
            </div>
            <span className="amount">₹ {Number(d.finalAmount).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
            <span className={`badge ${STATUS_TONE[d.status] || 'badge-gray'}`}>
              {STATUS_LABEL[d.status] || d.status}
            </span>
            {d.sellerId && <span className="badge badge-green">Seller #id {d.sellerId}</span>}
            {d.companyId && <span className="badge badge-blue">Company #id {d.companyId}</span>}
            {d.distributorId && <span className="badge badge-gray">Distributor #id {d.distributorId}</span>}
          </div>
        </div>
      ))}
    </>
  );
}