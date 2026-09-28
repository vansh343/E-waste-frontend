import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useSpeak } from '../context/SpeakContext';
import { PageHeader } from './Ui';
import ChatThread from './ChatThread';
import DealPropose from './DealPropose';

export default function ChatPage({
  otherId,
  loadConversation,
  restSend,
  productOptions,
  counterpartyLabel,
}) {
  const { user } = useAuth();
  const { subscribe, sendChat, connected } = useSocket();
  const { push } = useToast();
  const { setNarration } = useSpeak();

  const [messages, setMessages] = useState(null);
  const [draft, setDraft] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('kk_deal') || 'null');
    } catch {
      return null;
    }
  });
  const seenRef = useRef(new Set());

  const pageNarration = useMemo(
    () =>
      `Aap ${counterpartyLabel || 'kharidar'} se baat kar rahe hain. Yahan numpad se sirf number daale jaate hain — apna bhaav batao. Neeche final amount pakka karein wala box hai — dono side jab same amount daalein tab deal lock hogi.`,
    [counterpartyLabel],
  );

  useEffect(() => {
    setNarration(pageNarration);
  }, [setNarration, pageNarration]);

  const appendUnique = useCallback((msg) => {
    if (msg?.messageId == null || seenRef.current.has(msg.messageId)) return;
    seenRef.current.add(msg.messageId);
    setMessages((prev) => [...(prev || []), msg]);
  }, []);

  useEffect(() => {
    let mounted = true;
    seenRef.current.clear();
    setMessages(null);
    loadConversation()
      .then((msgs) => {
        if (!mounted) return;
        (msgs || []).forEach((m) => seenRef.current.add(m.messageId));
        setMessages(msgs || []);
      })
      .catch((e) => {
        if (mounted) push(e.message, 'error');
        if (mounted) setMessages([]);
      });
    return () => {
      mounted = false;
    };
  }, [otherId, loadConversation, push]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribe('chat', (msg) => {
      if (msg.senderId !== Number(otherId) && msg.receiverId !== Number(otherId)) return;
      appendUnique(msg);
    });
  }, [subscribe, otherId, user, appendUnique]);

  async function handleSend(text) {
    const receiverId = Number(otherId);
    const ok = sendChat(receiverId, text);
    if (ok) return; // echo aayega veh via WS
    const saved = await restSend(receiverId, text);
    if (saved) appendUnique(saved);
  }

  return (
    <>
      <PageHeader
        title={`💬 Baat: ${counterpartyLabel || `Customer #${otherId}`}`}
        sub="Numpad se sirf number daaliye — bhaav batao, lekin no free text 😉"
      />
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="muted" style={{ fontSize: 13 }}>
            {connected ? <span className="ws-dot on" /> : <span className="ws-dot" />}
            {connected ? ' Real-time live' : ' Reconnect ho raha...'}
          </span>
          <span style={{ flex: 1 }} />
          <Link className="btn btn-ghost btn-sm" to="/seller/deals">Meri deals →</Link>
        </div>
        <div style={{ padding: 16 }}>
          {messages === null ? (
            <div className="spinner" />
          ) : (
            <ChatThread messages={messages} myId={user.id} onSend={handleSend} sendingVia={connected ? 'WebSocket (real-time)' : 'Rest'} />
          )}
        </div>
      </div>

      {draft && (
        <div className="card mt-16" style={{ borderColor: 'var(--green-300)', background: 'var(--green-50)' }}>
          <b>📦 Baat ho rahi hai: {draft.productName} × {draft.quantity}</b>
        </div>
      )}

      <div className="section-title">
        <h2>Deal stage</h2>
      </div>
      <DealPropose
        product={draft?.productId}
        quantity={draft?.quantity}
        counterpartyId={Number(otherId)}
        productOptions={productOptions}
      />
    </>
  );
}