import { useEffect, useState } from 'react';
import { admin } from '../../api';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, Empty } from '../../components/Ui';

export default function AdminPending() {
  const { push } = useToast();
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(true);
  const [busyPhone, setBusyPhone] = useState(null);

  const load = () =>
    admin
      .pendingCompanies()
      .then((p) => setPending(p || []))
      .catch(() => {})
      .finally(() => setBusy(false));

  useEffect(() => {
    load();
  }, []);

  if (busy) return <Spinner />;

  const act = (fn, msg) =>
    fn()
      .then(() => {
        push(msg, 'info');
        return load();
      })
      .catch(() => push('Kuch galat ho gaya', 'error'));

  return (
    <>
      <PageHeader
        title="⏳ Approval Queue"
        sub="Companies jo abhi pending hain — approve ya reject karein"
      />

      {pending.length === 0 && (
        <Empty>Abhi koi pending approval nahi. Naye company signups yahan aayenge.</Empty>
      )}

      {pending.map((p) => (
        <div className="card" key={p.id}>
          <div className="admin-card-row">
            <div>
              <div style={{ fontWeight: 800 }}>📞 {p.phone}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>#{p.id} · {p.role}</div>
              <span className="badge badge-amber" style={{ marginTop: 6 }}>⏳ PENDING_APPROVAL</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-sm"
                disabled={busyPhone === p.phone}
                onClick={() => {
                  setBusyPhone(p.phone);
                  act(() => admin.approveCompany(p.phone), `${p.phone} approve ho gaya`).finally(() => setBusyPhone(null));
                }}
              >
                ✓ Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                disabled={busyPhone === p.phone}
                onClick={() => {
                  setBusyPhone(p.phone);
                  act(() => admin.rejectCompany(p.phone), `${p.phone} reject ho gaya`).finally(() => setBusyPhone(null));
                }}
              >
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}