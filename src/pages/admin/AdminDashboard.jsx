import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../api';
import { PageHeader, Spinner } from '../../components/Ui';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    Promise.all([admin.allUsers(), admin.allDeals(), admin.allCompanies(), admin.pendingCompanies()])
      .then(([u, d, c, p]) => {
        setUsers(u || []);
        setDeals(d || []);
        setCompanies(c || []);
        setPending(p || []);
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <Spinner />;

  const byRole = (r) => users.filter((x) => x.role === r).length;

  const stats = [
    { label: 'Sab Users', value: users.length, icon: '👥' },
    { label: 'Sellers', value: byRole('ROLE_SELLER'), icon: '🧑‍🌾' },
    { label: 'Companies', value: byRole('ROLE_COMPANY'), icon: '🏢' },
    { label: 'Distributors', value: byRole('ROLE_DISTRIBUTOR'), icon: '🚚' },
    { label: 'Admins', value: byRole('ROLE_ADMIN'), icon: '🛡️' },
    { label: 'Pending Approval', value: pending.length, icon: '⏳' },
    { label: 'Companies Log', value: companies.length, icon: '📚' },
    { label: 'Total Deals', value: deals.length, icon: '🤝' },
  ];

  return (
    <>
      <PageHeader title="📊 Admin Dashboard" sub="Kabadi Connect — poori system par nazar" />

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        {stats.map((s) => (
          <div className="card" key={s.label}>
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <h3 style={{ margin: '8px 0 2px' }}>{s.value}</h3>
            <div className="muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2">
        <Link className="card admin-nav-card" to="/admin/users">
          <span className="badge badge-green">Manage</span>
          <h3>👥 Sab Users</h3>
          <p>Role badlein, suspend karein, delete karein</p>
        </Link>
        <Link className="card admin-nav-card" to="/admin/deals">
          <span className="badge badge-blue">Monitor</span>
          <h3>🤝 Sare Deals</h3>
          <p>Har ek ledger, har ek kharid-farokht</p>
        </Link>
        <Link className="card admin-nav-card" to="/admin/companies">
          <span className="badge badge-amber">Monitor</span>
          <h3>🏢 Companies</h3>
          <p>Sab registered companies ki list</p>
        </Link>
        <Link className="card admin-nav-card" to="/admin/pending">
          <span className="badge badge-green">Review</span>
          <h3>⏳ Approval Queue</h3>
          <p>{pending.length} pending approval</p>
        </Link>
      </div>
    </>
  );
}