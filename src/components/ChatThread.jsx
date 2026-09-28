import { useState, useRef, useEffect } from 'react';
import { timeAgo } from '../api';

const KEY_LAYOUT = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export default function ChatThread({ messages, myId, onSend, sendingVia }) {
  const [entry, setEntry] = useState('');
  const bottomRef = useRef(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function press(key) {
    if (busy) return;
    if (key === 'del') {
      setEntry((e) => e.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!entry || entry.includes('.')) return;
      setEntry((e) => e + '.');
      return;
    }
    if (entry.length >= 9) return;
    setEntry((e) => e + key);
  }

  async function handleSend() {
    if (!entry || busy) return;
    setBusy(true);
    try {
      await onSend(entry);
      setEntry('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="thread">
        {messages.length === 0 && (
          <div className="empty">
            Abhi koi baat nahi hui. Numpad se apna bhav (number) bhejein! 💬
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.senderId === myId;
          return (
            <div key={m.messageId ?? i} className={`bubble ${mine ? 'bubble-mine' : 'bubble-theirs'}`}>
              {m.message}
              <span className="bubble-time">
                {timeAgo(m.createdAt)}{m.isRead ? ' · ✓✓' : ''}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="numpad">
        <div className="numpad-screen">
          <span className={`numpad-value ${entry ? '' : 'placeholder'}`}>
            {entry || '₹ ka bhaav batao... (sirf number)'}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEntry((e) => e.slice(0, -1))}
            disabled={busy || !entry}
            title="Ek digit hatayein"
          >
            ⌫
          </button>
        </div>
        <div className="numpad-grid">
          {KEY_LAYOUT.map((k) => (
            <button
              key={k}
              className="numpad-key"
              onClick={() => press(k)}
              disabled={busy}
              aria-label={k === 'del' ? 'Backspace' : k}
            >
              {k === 'del' ? '⌫' : k}
            </button>
          ))}
          <button
            className="numpad-key send"
            onClick={handleSend}
            disabled={busy || !entry}
          >
            {busy ? '...' : 'Bhejo ➤'}
          </button>
        </div>
      </div>
      {sendingVia && (
        <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
          {sendingVia}
        </div>
      )}
    </>
  );
}