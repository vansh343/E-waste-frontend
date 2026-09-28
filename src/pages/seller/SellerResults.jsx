import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { seller } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useSpeak } from '../../context/SpeakContext';
import { Badge, Empty, PageHeader, Spinner } from '../../components/Ui';

export default function SellerResults() {
  const [data, setData] = useState(null);
  const [items, setItems] = useState({});
  const [busyId, setBusyId] = useState(null);
  const { push } = useToast();
  const { setNarration } = useSpeak();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem('kk_results');
    const itemsRaw = sessionStorage.getItem('kk_items');
    if (!raw) return;
    setData(JSON.parse(raw));
    if (itemsRaw) setItems(JSON.parse(itemsRaw));
  }, []);

  useEffect(() => {
    if (!data) return;
    setNarration(
      'Ye aapke item ke liye sahi kharidar hain. Har card mein company ka naam, rate aur doori hai. Jo card mein "Distributor se baat" likha hai wahan distributor se baat hogi, warna company se seedha. Chat shuru karein button dabakar kharidar ko request bhejein.',
    );
  }, [data, setNarration]);

  async function startChat(productId, productName, quantity, receiverId) {
    setBusyId(`${productId}-${receiverId}`);
    try {
      await seller.createChatRequest(receiverId, productId, quantity);
      sessionStorage.setItem('kk_deal', JSON.stringify({ productId, quantity, productName }));
      push('Chat request bheja gaya — kharidar jald reply karega ✓', 'info');
      navigate(`/seller/chat/${receiverId}`);
    } catch (e) {
      push(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (data === null) return <Spinner />;

  return (
    <>
      <PageHeader title="🎯 Aapke Sahi Kharidar" sub="Chat shuru karein aur bhaav pakka karein" />
      {data.products?.length === 0 && (
        <div className="card">
          <Empty>Koi kharidar nahi mila is item ke liye. Naam badalkar dobara try karein.</Empty>
        </div>
      )}

      {data.products?.map((match) => (
        <div key={match.productId}>
          <div className="section-title">
            <h2>
              {match.productName}
              <span className="muted" style={{ fontWeight: 400 }}> — {match.nearbyCompanies?.length} kharidar mile</span>
            </h2>
          </div>
          {match.nearbyCompanies?.map((c, i) => (
            <div className="card" key={i} style={{ borderColor: c.talkTo === 'DISTRIBUTOR' ? '#f0c14b' : 'var(--green-400)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h3 style={{ margin: 0 }}>🏢 {c.businessName}</h3>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {c.talkTo === 'DISTRIBUTOR' ? (
                      <>
                        🚚 Distributor: <b>{c.distributorName}</b> · {c.distributorArea}
                      </>
                    ) : (
                      <>📍 Company se seedha baat</>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge tone={c.talkTo === 'DISTRIBUTOR' ? 'amber' : 'green'}>
                    {c.talkTo === 'DISTRIBUTOR' ? 'Distributor se baat' : 'Company se baat'} 
                  </Badge>
                  <div className="amount" style={{ fontSize: 18, marginTop: 6 }}>₹ {c.priceRange?.replace(/-/g, '–') || '—'}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    Stock: {c.availableQuantity} ·{' '}
                    {c.exactLocationMatch ? 'Aapke area mein ✓' : c.distanceKm != null ? `${c.distanceKm.toFixed(1)} km door` : 'Doori check hui'}
                  </div>
                </div>
              </div>
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary"
                  disabled={busyId === `${match.productId}-${c.companyCustomerId ?? c.distributorCustomerId}`}
                  onClick={() =>
                    startChat(
                      match.productId,
                      match.productName,
                      items[match.productName] || 1,
                      c.talkTo === 'DISTRIBUTOR' ? c.distributorCustomerId : c.companyCustomerId,
                    )
                  }
                >
                  💬 Chat shuru karein
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {data.comments?.map((c, i) => (
        <p key={i} className="muted" style={{ fontSize: 13 }}>ℹ️ {c}</p>
      ))}

      <Link className="btn btn-ghost mt-16" to="/seller">← Naya order banaayein</Link>
    </>
  );
}