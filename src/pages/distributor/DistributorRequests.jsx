import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { distributor, timeAgo } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useSpeak } from '../../context/SpeakContext';
import { useSocket } from '../../context/SocketContext';
import { Badge, Empty, PageHeader, Spinner } from '../../components/Ui';

export default function DistributorRequests() {
  const [requests, setRequests] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { push } = useToast();
  const { setNarration } = useSpeak();
  const { subscribe } = useSocket();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setRequests(await distributor.requests());
    } catch (e) {
      push(e.message, 'error');
      setRequests([]);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return subscribe('request', () => load());
  }, [subscribe, load]);

  useEffect(() => {
    setNarration(
      'Naye requests wala panna. Seller ne chat request bheja hai aapko. Accept karein, price ka pehla message apne aap bhej diya jayega. Reject bhi kar sakte hain.',
    );
  }, [setNarration]);

  async function act(id, type) {
    setBusyId(`${id}-${type}`);
    try {
      const r = type === 'accept' ? await distributor.acceptRequest(id) : await distributor.rejectRequest(id);
      if (type === 'accept') {
        sessionStorage.setItem(
          'kk_deal',
          JSON.stringify({ productId: r.productId, quantity: r.quantity, productName: r.productName }),
        );
        push('Request accept! Price message bhej diya gaya ✓', 'info');
      } else {
        push('Request reject kar diya', 'warn');
      }
      await load();
    } catch (e) {
      push(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  function openChat(r) {
    sessionStorage.setItem('kk_deal', JSON.stringify({ productId: r.productId, quantity: r.quantity, productName: r.productName }));
    navigate(`/distributor/chat/${r.sellerId}`);
  }

  if (requests === null) return <Spinner />;

  return (
    <>
      <PageHeader title="✉️ Naye Requests" sub="Aapke area ke sellers ne chat bheja" />
      {requests.length === 0 && (
        <div className="card">
          <Empty>Filhaal koi request nahi.</Empty>
        </div>
      )}
      {requests.map((r) => (
        <div className="card" key={r.requestId}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0 }}>📦 {r.productName} × {r.quantity}</h3>
              <div className="muted" style={{ marginTop: 4 }}>Bechne wala: #{r.sellerId} · {timeAgo(r.createdAt)}</div>
            </div>
            <Badge tone={r.status === 'ACCEPTED' ? 'green' : r.status === 'REJECTED' ? 'red' : 'amber'}>
              {r.status === 'ACCEPTED' ? 'Accept ho gaya ✓' : r.status === 'REJECTED' ? 'Reject' : 'Pending'}
            </Badge>
          </div>

          {r.status === 'ACCEPTED' && (
            <div className="kv mt-8">
              <b>☝️ Price quote</b>
              <span>₹ {r.unitPrice} / unit</span>
            </div>
          )}
          {r.status === 'ACCEPTED' && (
            <div className="kv">
              <b>💰 Total</b>
              <span className="amount">₹ {Number(r.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="input-row mt-8" style={{ justifyContent: 'flex-end' }}>
            {r.status === 'PENDING' && (
              <>
                <button className="btn btn-danger" onClick={() => act(r.requestId, 'reject')} disabled={busyId !== null}>
                  {busyId === `${r.requestId}-reject` ? 'Ho raha...' : '✕ Reject'}
                </button>
                <button className="btn btn-primary" onClick={() => act(r.requestId, 'accept')} disabled={busyId !== null}>
                  {busyId === `${r.requestId}-accept` ? 'Ho raha...' : '✓ Accept (price auto)'}
                </button>
              </>
            )}
            {r.status === 'ACCEPTED' && (
              <button className="btn btn-primary" onClick={() => openChat(r)}>💬 Chat kholo</button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}