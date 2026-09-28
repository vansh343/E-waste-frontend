import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { deal } from '../api';
import { useToast } from '../context/ToastContext';
import { useSpeak } from '../context/SpeakContext';
import { Badge, Spinner } from './Ui';

const E_CYCLE_PREFIX = 'E-CYCLE-DEAL:';

// QR content: "E-CYCLE-DEAL:{ledgerId}:{token}:{phone}:{location}"
function normalizeToken(text) {
  const t = (text || '').trim();
  if (t.startsWith(E_CYCLE_PREFIX)) {
    return t.split(':')[2]?.trim() || '';
  }
  return t;
}

function parseDealPayload(text) {
  const t = (text || '').trim();
  if (!t.startsWith(E_CYCLE_PREFIX)) return null;
  const parts = t.split(':');
  const phone = parts[3];
  if (!phone) return null;
  return {
    ledgerId: parts[1],
    phone: phone.trim(),
    location: parts.slice(4).join(':').trim() || '',
  };
}

export default function QrPanel({ ledger, iAmSeller, onUpdated }) {
  const [qrImg, setQrImg] = useState(null);
  const [scanToken, setScanToken] = useState('');
  const [counterpartyInfo, setCounterpartyInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const { push } = useToast();
  const { speak } = useSpeak();

  const mineScanned = iAmSeller ? ledger.sellerScanned : ledger.counterpartyScanned;
  const otherScanned = iAmSeller ? ledger.counterpartyScanned : ledger.sellerScanned;
  const done = ledger.status === 'DONE';
  const step = mineScanned ? (otherScanned ? 3 : 2) : 1;

  useEffect(() => {
    let cancelled = false;
    deal
      .myQr(ledger.ledgerId)
      .then((res) => {
        if (cancelled) return;
        setQrImg(res.qr);
      })
      .catch((e) => push('QR milne mein dikkat: ' + e.message, 'error'));
    return () => {
      cancelled = true;
    };
  }, [ledger.ledgerId, ledger.updatedAt, push]);

  useEffect(() => {
    if (!camera) return undefined;
    const scanner = new Html5Qrcode('qr-reader');
    let active = true;
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (txt) => {
          if (!active) return;
          setScanToken(txt.trim());
          setCamera(false);
          push('QR scan ho gaya! Ab confirm karein', 'info');
          scanner.stop().catch(() => {});
        },
        () => {},
      )
      .catch((e) => {
        push('Camera chalu nahi hua: ' + (e.message || e), 'error');
        setCamera(false);
      });
    return () => {
      active = false;
      scanner.stop().catch(() => {});
    };
  }, [camera, push]);

  async function doScan() {
    const token = normalizeToken(scanToken);
    if (!token) {
      push('QR token daalein ya scan karein', 'error', 2500);
      return;
    }
    setBusy(true);
    try {
      const info = parseDealPayload(scanToken);
      const updated = await deal.scan(ledger.ledgerId, token);
      if (info) setCounterpartyInfo(info);
      push('Scan ho gaya! ✓ Saamne wale ka number aur jagah mil gayi', 'info');
      speak('QR scan ho gaya. Ab dono side se scan ho jaye tab accept window khulegi.');
      onUpdated?.(updated);
    } catch (e) {
      push(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function doAccept() {
    setBusy(true);
    try {
      const updated = await deal.accept(ledger.ledgerId);
      push('Deal accept ho gayi! DONE 🎉', 'info');
      speak('Deal accept ho gayi. Kaam poora! Mubaarak ho.');
      onUpdated?.(updated);
    } catch (e) {
      push(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="qr-box" style={{ borderStyle: 'solid', borderColor: 'var(--green-500)' }}>
        <div style={{ fontSize: 38 }}>🎉</div>
        <h3 style={{ margin: 0 }}>Deal poora ho gaya!</h3>
        <p className="muted" style={{ margin: 0 }}>
          Order / Reference: <b className="mono">{ledger.orderId}</b>
        </p>
        {counterpartyInfo && (
          <div className="reveal-card">
            <div className="label">Saamne wale ki details (QR se)</div>
            <div>📞 <span className="mono">{counterpartyInfo.phone}</span></div>
            {counterpartyInfo.location ? <div>📍 {counterpartyInfo.location}</div> : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card" style={{ borderColor: 'var(--green-400)' }}>
      <h3>📷 QR se deal ka confirm ho</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Har QR mein deal ka <b>common code</b> aur us vyakti ka <b>number + jagah</b> hota hai. Dono side ek doosre ka QR scan karein tab accept khulta hai.
      </p>

      <div className="qr-box">
        {qrImg ? (
          <img src={qrImg} alt="Mera QR" style={{ background: '#fff', padding: 8, borderRadius: 10 }} />
        ) : (
          <Spinner />
        )}
        <Badge tone={mineScanned ? 'green' : 'gray'}>
          {mineScanned ? 'Aapka scan ho gaya ✓' : 'Ye aapka QR hai — isme aapka number aur jagah hai'}
        </Badge>
        <div className="muted" style={{ fontSize: 12.5 }}>📱 Saamne wala ise camera se scan karega — use aapka common code, number aur location milegi</div>
      </div>

      {counterpartyInfo && (
        <div className="reveal-card mt-16">
          <div className="label">Saamne wale ki details (aapke scan se mili)</div>
          <div>📞 <span className="mono">{counterpartyInfo.phone}</span></div>
          {counterpartyInfo.location ? <div>📍 {counterpartyInfo.location}</div> : null}
        </div>
      )}

      {step >= 2 && (
        <div className="mt-16">
          <label className="label">Saamne wale ka QR token</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Yahan past karein ya camera se scan karein"
            value={scanToken}
            onChange={(e) => setScanToken(e.target.value)}
          />
          <div className="input-row mt-8">
            <button className="btn btn-ghost" onClick={() => setCamera((c) => !c)} disabled={busy}>
              {camera ? 'Camera band karein' : '📷 Camera se scan karein'}
            </button>
            <button className="btn btn-primary" onClick={doScan} disabled={busy}>
              {busy ? 'Hota raha...' : 'Scan confirm karein'}
            </button>
          </div>
          {camera && (
            <div className="mt-8">
              <div id="qr-reader" style={{ maxWidth: 340 }} />
            </div>
          )}
          <div className="mt-8">
            <Badge tone={otherScanned ? 'green' : 'amber'}>
              {otherScanned ? 'Saamne wale ka QR scan ho gaya — unka number aur location mil gayi ✓' : 'Saamne wala apna QR scan karega...'}
            </Badge>
          </div>
        </div>
      )}

      {step >= 3 && (
        <div className="mt-16">
          <div className="qr-box" style={{ borderStyle: 'solid', borderColor: 'var(--green-500)' }}>
            <Badge tone="green">Accept window khul gayi! ✓</Badge>
            <button className="btn btn-primary btn-block" onClick={doAccept} disabled={busy}>
              {busy ? 'Ho raha hai...' : '✓ Deal Accept karein'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}