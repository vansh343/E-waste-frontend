import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { admin } from '../../api';
import { PageHeader, Spinner } from '../../components/Ui';

const TABS = [
  { key: 'ALL', label: 'Sab' },
  { key: 'ROLE_SELLER', label: '🧑‍🌾 Seller' },
  { key: 'ROLE_COMPANY', label: '🏢 Company' },
  { key: 'ROLE_DISTRIBUTOR', label: '🚚 Distributor' },
  { key: 'ROLE_ADMIN', label: '🛡️ Admin' },
];

const ROLE_LABEL = {
  ROLE_SELLER: 'Beche wala',
  ROLE_COMPANY: 'Company',
  ROLE_DISTRIBUTOR: 'Distributor',
  ROLE_ADMIN: 'Admin',
};

const STATUS_BADGE = {
  ACTIVE: 'badge-green',
  PENDING_APPROVAL: 'badge-amber',
  SUSPENDED: 'badge-red',
  REJECTED: 'badge-gray',
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('ALL');
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(true);
  const [busyPhone, setBusyPhone] = useState(null);

  const load = () =>
    admin
      .allUsers()
      .then(setUsers)
      .catch(() => push('Users load nahi hue', 'error'))
      .finally(() => setBusy(false));

  useEffect(() => {
    load();
  }, []);

  const list = useMemo(
    () => (tab === 'ALL' ? users : users.filter((u) => u.role === tab)),
    [users, tab],
  );

  const act = async (fn, msg) => {
    try {
      const r = await fn();
      push(msg || r?.message || 'Ho gaya', 'info');
      await load();
    } catch (e) {
      push('Kuch galat ho gaya', 'error');
    }
  };

  const doToggleSuspension = (u) => {
    if (u.accountStatus === 'SUSPENDED') {
      return act(() => admin.assignRole(u.phone, u.role), `${u.phone} ab ACTIVE`);
    }
    return act(() => admin.suspend(u.phone), `${u.phone} suspend ho gaya`);
  };

  const doPromote = (u) => {
    if (u.role === 'ROLE_ADMIN') return push('Pehle se admin hai', 'warn');
    return act(() => admin.promoteAdmin(u.phone), `${u.phone} ab ADMIN`);
  };

  const doDelete = (u) => {
    if (!window.confirm(`Confirm: ${u.phone} ko delete karein?`)) return;
    return act(() => admin.deleteUser(u.phone), `${u.phone} delete ho gaya`);
  };

  if (busy) return <Spinner />;

  return (
    <>
      <PageHeader title="👥 Sab Users" sub="Role tabs se filter karein, actions se manage karein" />

      <div className="seg-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`seg-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 && <div className="card">Koi user nahi mila</div>}

      {list.map((u) => (
        <div className="card" key={u.id}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 800 }}>
                📞 {u.phone}
                {u.id === me?.id ? <span className="muted"> (aap)</span> : null}
              </div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                #{u.id} · {ROLE_LABEL[u.role] || u.role}
              </div>
              <div style={{ marginTop: 6 }}>
                <span className={`badge ${STATUS_BADGE[u.accountStatus] || 'badge-gray'}`}>{u.accountStatus}</span>
                {u.accountStatus === 'PENDING_APPROVAL' && (
                  <span className="badge badge-amber">approval pending</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignSelf: 'center' }}>
              {u.accountStatus !== 'SUSPENDED' && (
                <button
                  className="btn btn-warn btn-sm"
                  disabled={busyPhone === u.phone}
                  onClick={() => { setBusyPhone(u.phone); doToggleSuspension(u).finally(() => setBusyPhone(null)); }}
                >
                  ⏸ Suspend
                </button>
              )}
              {u.accountStatus === 'SUSPENDED' && (
                <button
                  className="btn btn-soft btn-sm"
                  disabled={busyPhone === u.phone}
                  onClick={() => { setBusyPhone(u.phone); doToggleSuspension(u).finally(() => setBusyPhone(null)); }}
                >
                  ▶️ Activate
                </button>
              )}
              <button
                className="btn btn-soft btn-sm"
                disabled={busyPhone === u.phone}
                onClick={() => { setBusyPhone(u.phone); doPromote(u).finally(() => setBusyPhone(null)); }}
              >
                🛡️ Admin banao
              </button>
              {u.id !== me?.id && (
                <button
                  className="btn btn-danger btn-sm"
                  disabled={busyPhone === u.phone}
                  onClick={() => { setBusyPhone(u.phone); doDelete(u).finally(() => setBusyPhone(null)); }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}