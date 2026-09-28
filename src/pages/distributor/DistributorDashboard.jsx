import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { distributor } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useSpeak } from '../../context/SpeakContext';
import { Empty, PageHeader, Spinner } from '../../components/Ui';
import { timeAgo } from '../../api';

export default function DistributorDashboard() {
  const [me, setMe] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [deals, setDeals] = useState([]);
  const [requests, setRequests] = useState([]);
  const { push } = useToast();
  const { setNarration } = useSpeak();

  useEffect(() => {
    Promise.all([distributor.me(), distributor.myCompany(), distributor.deals(), distributor.requests()])
      .then(([m, c, d, r]) => {
        setMe(m);
        setCompanyInfo(c);
        setDeals(d || []);
        setRequests(r || []);
      })
      .catch((e) => push(e.message, 'error'));
  }, [push]);

  useEffect(() => {
    setNarration(
      'Distributor dashboard. Aap {company} company ke distributor hain, area {area} mein. Naye requests mein sellers ke chat bheje aate hain. Apni deals aur QR flow yahan dekhein.',
    );
  }, [setNarration, me?.area, companyInfo?.businessName]);

  if (!me) return <Spinner />;
  const pending = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <>
      <PageHeader
        title={`🚚 ${me.name}`}
        sub={`${me.area} · 📞 ${me.phone} · ${companyInfo?.businessName || 'Company'} ke distributor`}
      />

      <div className="grid grid-3">
        <div className="card">
          <div style={{ fontSize: 26 }}>🏢</div>
          <h3>{companyInfo?.businessName || '—'}</h3>
          <p className="muted" style={{ marginBottom: 10 }}>Meri company</p>
        </div>
        <div className="card">
          <div style={{ fontSize: 26 }}>✉️</div>
          <h3>{pending}</h3>
          <p className="muted" style={{ marginBottom: 10 }}>Naye requests</p>
          <Link className="btn btn-primary btn-sm" to="/distributor/requests">Dekhein →</Link>
        </div>
        <div className="card">
          <div style={{ fontSize: 26 }}>🤝</div>
          <h3>{deals.length}</h3>
          <p className="muted" style={{ marginBottom: 10 }}>Meri deals</p>
          <Link className="btn btn-soft btn-sm" to="/distributor/deals">Dekhein →</Link>
        </div>
      </div>

      <div className="section-title"><h2>Chalu Deals</h2></div>
      <div className="card">
        {deals.length === 0 && <Empty>Abhi koi deal nahi. Naye requests se shuru karein.</Empty>}
        {deals.map((d) => (
          <div className="row" key={d.ledgerId}>
            <div className="row-main">
              <div className="row-title">📦 {d.productName} × {d.quantity}</div>
              <div className="row-sub mono">{d.orderId} · {timeAgo(d.createdAt)}</div>
            </div>
            <span className="amount">₹ {Number(d.finalAmount).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </>
  );
}