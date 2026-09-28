export function Spinner() {
  return <div className="spinner" />;
}

export function Badge({ tone = 'gray', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Empty({ children = 'Kuch nahi mila abhi.' }) {
  return <div className="empty">🗂️ {children}</div>;
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6, 38, 20, 0.45)',
        zIndex: 500,
        display: 'grid',
        placeItems: 'center',
        padding: 18,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {sub && <p className="muted" style={{ margin: '4px 0 0' }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorNote({ error }) {
  if (!error) return null;
  return (
    <div className="card" style={{ borderColor: '#fca5a5', background: '#fef2f2', color: 'var(--danger)' }}>
      ⚠️ {typeof error === 'string' ? error : error.message || 'Kuch galat ho gaya.'}
    </div>
  );
}