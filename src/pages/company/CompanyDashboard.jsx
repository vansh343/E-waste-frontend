import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { company, deal } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useSpeak } from '../../context/SpeakContext';
import { Badge, Empty, PageHeader, Spinner } from '../../components/Ui';
import { timeAgo } from '../../api';

export default function CompanyDashboard() {
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deals, setDeals] = useState([]);
  const { push } = useToast();
  const { setNarration } = useSpeak();

  useEffect(() => {
    Promise.all([company.profile(), company.products(), company.distributors(), company.requests(), deal.my()])
      .then(([p, pr, d, r, dl]) => {
        setProfile(p);
        setProducts(pr || []);
        setDistributors(d || []);
        setRequests(r || []);
        setDeals(dl || []);
      })
      .catch((e) => push(e.message, 'error'));
  }, [push]);

  useEffect(() => {
    setNarration(
      'Company dashboard. Yahan aapki company ka profile hai, products ki list, distributors ki list, aur customers ke requests. Naye requests wale tab mein naye bechne walon ki baatein hain. Product jodne ke liye mere products par jayein.',
    );
  }, [setNarration]);

  if (!profile) return <Spinner />;
  const pending = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <>
      <PageHeader title={`🏢 ${profile.businessName}`} sub={`${profile.location} · ${profile.phone}`} />

      <div className="grid grid-3">
        <div className="card">
          <div style={{ fontSize: 26 }}>📦</div>
          <h3>{products.length}</h3>
          <p className="muted" style={{ marginBottom: 10 }}>Products</p>
          <Link className="btn btn-soft btn-sm" to="/company/products">Manage karein →</Link>
        </div>
        <div className="card">
          <div style={{ fontSize: 26 }}>🚚</div>
          <h3>{distributors.length}</h3>
          <p className="muted" style={{ marginBottom: 10 }}>Distributors</p>
          <Link className="btn btn-soft btn-sm" to="/company/distributors">Manage karein →</Link>
        </div>
        <div className="card">
          <div style={{ fontSize: 26 }}>✉️</div>
          <h3>{pending}</h3>
          <p className="muted" style={{ marginBottom: 10 }}>Naye requests</p>
          <Link className="btn btn-primary btn-sm" to="/company/requests">Dekhein →</Link>
        </div>
      </div>

      <div className="section-title">
        <h2>Chalu Deals</h2>
        <Link className="btn btn-ghost btn-sm" to="/company/deals">Sab deals →</Link>
      </div>
      <div className="card">
        {deals.length === 0 && <Empty>Abhi koi deal nahi. Requests accept karte hi deal shuru hoti hai.</Empty>}
        {deals.map((d) => (
          <div className="row" key={d.ledgerId}>
            <div className="row-main">
              <div className="row-title">📦 {d.productName} × {d.quantity}</div>
              <div className="row-sub mono">{d.orderId} · {timeAgo(d.createdAt)}</div>
            </div>
            <Badge tone={d.status === 'DONE' ? 'green' : d.status === 'PENDING' ? 'amber' : 'gray'}>
              {d.status === 'DONE' ? 'Poora ho gaya' : d.status === 'PENDING' ? 'QR phase' : d.status}
            </Badge>
            <span className="amount">₹ {Number(d.finalAmount).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      <div className="section-title">
        <h2>Aapke Products</h2>
      </div>
      <div className="card">
        {products.length === 0 && <Empty>Abhi product nahi jode. 'Mere Products' se jodein.</Empty>}
        {products.slice(0, 5).map((p) => (
          <div className="row" key={p.companyProductId}>
            <div className="row-main">
              <div className="row-title">{p.productName}</div>
              <div className="row-sub">Stock: {p.quantity} unit</div>
            </div>
            <span className="amount">₹ {p.priceRange?.replace(/-/g, '–')}</span>
          </div>
        ))}
      </div>
    </>
  );
}