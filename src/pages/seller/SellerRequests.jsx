import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { seller, timeAgo } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useSpeak } from '../../context/SpeakContext';
import { useSocket } from '../../context/SocketContext';
import { Badge, Empty, PageHeader, Spinner } from '../../components/Ui';

export default function SellerRequests() {
  const [requests, setRequests] = useState(null);
  const { push } = useToast();
  const { setNarration } = useSpeak();
  const { subscribe } = useSocket();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setRequests(await seller.myRequests());
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
      'Ye aapki bheji hui chat requests hain. Jo request accept hui hai, uska rate aur total yahan dikhta hai. Chat kholo button dabakar baat karein.',
    );
  }, [setNarration]);

  function openChat(r) {
    sessionStorage.setItem('kk_deal', JSON.stringify({ productId: r.productId, quantity: r.quantity, productName: r.productName }));
    navigate(`/seller/chat/${r.receiverId}`);
  }

  if (requests === null) return <Spinner />;

  return (
    <>
      <PageHeader title="✉️ Meri Requests" sub="Jo kharidaron se baat shuru hui hai" />
      {requests.length === 0 && (
        <div className="card">
          <Empty>Abhi koi request nahi. Pehle 'Naya Order' se kisi kharidar ko chat bhejein.</Empty>
        </div>
      )}
      {requests.map((r) => (
        <div className="card" key={r.requestId}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                📦 {r.productName} × {r.quantity}
              </h3>
              <div className="muted" style={{ marginTop: 4 }}>{timeAgo(r.createdAt)} · Rec: #{r.receiverId}</div>
            </div>
            <Badge tone={r.status === 'ACCEPTED' ? 'green' : r.status === 'REJECTED' ? 'red' : 'amber'}>
              {r.status === 'ACCEPTED' ? 'Accept ✓' : r.status === 'REJECTED' ? 'Reject' : 'Pending...'}
            </Badge>
          </div>
          {r.status === 'ACCEPTED' && (
            <div className="kv mt-8">
              <b>☝️ Unit rate</b>
              <span>₹ {r.unitPrice}</span>
            </div>
          )}
          {r.status === 'ACCEPTED' && (
            <div className="kv">
              <b>💰 Total</b>
              <span className="amount">₹ {Number(r.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="input-row mt-8" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => openChat(r)}>
              💬 Chat kholo
            </button>
          </div>
        </div>
      ))}
    </>
  );
}