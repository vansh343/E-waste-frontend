import { useEffect, useState } from 'react';
import { admin } from '../../api';
import { PageHeader, Spinner, Empty } from '../../components/Ui';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    admin
      .allCompanies()
      .then((c) => setCompanies(c || []))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <Spinner />;

  return (
    <>
      <PageHeader
        title="🏢 Companies"
        sub="Sab registered e-waste companies"
      />

      {companies.length === 0 && <Empty>Koi company registered nahi.</Empty>}

      {companies.map((c) => (
        <div className="card" key={c.companyId}>
          <div className="admin-card-row">
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>🏢 {c.businessName || '—'}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                GSTIN {c.businessGstin || '—'} · {c.location || '—'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>📞 {c.phone}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>#{c.customerId} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}