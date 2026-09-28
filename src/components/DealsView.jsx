import { useCallback, useEffect, useState } from 'react';
import { deal, timeAgo } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useSpeak } from '../context/SpeakContext';
import { Badge, Empty, PageHeader, Spinner } from './Ui';
import QrPanel from './QrPanel';

function statusChip(status) {
  if (status === 'DONE') return <Badge tone="green">✅ Poora ho gaya</Badge>;
  if (status === 'PENDING') return <Badge tone="amber">🔐 Lock — QR phase</Badge>;
  return <Badge tone="gray">{status}</Badge>;
}

export default function DealsView({ iAmSeller, title = 'Meri Deals', sub, loader }) {
  const { user } = useAuth();
  const { subscribe } = useSocket();
  const { push } = useToast();
  const { speak, setNarration } = useSpeak();
  const [ledgers, setLedgers] = useState(null);
  const [reload, setReload] = useState(0);

  const load = useCallback(async () => {
    try {
      const rows = loader ? await loader() : await deal.my();
      setLedgers(rows || []);
    } catch (e) {
      push(e.message, 'error');
      setLedgers([]);
    }
  }, [push, loader]);

  useEffect(() => {
    load();
  }, [load, reload]);

  useEffect(() => {
    return subscribe('deal', () => setReload((r) => r + 1));
  }, [subscribe]);

  useEffect(() => {
    setNarration(
      'Ye aapki saari deals ki list hai. Jo deal lock ho chuki hai wo yahan dikhti hai. QR scan aur accept ka kaam yahi se hota hai.',
    );
  }, [setNarration]);

  if (ledgers === null) return <Spinner />;

  return (
    <>
      <PageHeader title={title} sub={sub || 'Aapki pakki hui deals aur QR/accept flow yahan hai'} />
      {ledgers.length === 0 && (
        <div className="card">
          <Empty>Abhi koi deal nahi bani. Pehle kisi se baat karke final amount match karein.</Empty>
        </div>
      )}

      {ledgers.map((l) => (
        <div className="card" key={l.ledgerId}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0 }}>📦 {l.productName} × {l.quantity}</h3>
              <div className="muted" style={{ marginTop: 4 }}>
                <span className="mono">Order: {l.orderId}</span> · {timeAgo(l.createdAt)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {statusChip(l.status)}
              <div className="amount" style={{ fontSize: 19 }}>₹ {Number(l.finalAmount).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kv mt-8">
            <b>Bechne wala</b>
            <span>Seller #{l.sellerId}{l.sellerId === user?.id ? ' (aap)' : ''}</span>
          </div>
          <div className="kv">
            <b>Khareedne wala</b>
            <span>
              {l.distributorId ? `Distributor #${l.distributorId}` : `Company #${l.companyId}`}
              {iAmSeller ? '' : ' (aap)'}
            </span>
          </div>
          {l.status === 'PENDING' && (
            <p className="muted" style={{ margin: '8px 0 0' }}>
              📷 Number aur jagah sirf QR scan karne par milti hai.
            </p>
          )}

          {l.status === 'PENDING' && (
            <div className="mt-16">
              <QrPanel ledger={l} iAmSeller={!!iAmSeller} onUpdated={() => load()} />
            </div>
          )}
        </div>
      ))}
    </>
  );
}