import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useSpeak } from '../context/SpeakContext';

const NAV = {
  ROLE_SELLER: [
    { to: '/seller', icon: '🏠', label: 'Naya Order' },
    { to: '/seller/requests', icon: '✉️', label: 'Meri Requests' },
    { to: '/seller/deals', icon: '🤝', label: 'Meri Deals' },
  ],
  ROLE_COMPANY: [
    { to: '/company', icon: '🏢', label: 'Dashboard' },
    { to: '/company/requests', icon: '✉️', label: 'Naye Requests' },
    { to: '/company/products', icon: '📦', label: 'Mere Products' },
    { to: '/company/distributors', icon: '🚚', label: 'Mere Distributors' },
    { to: '/company/deals', icon: '🤝', label: 'Meri Deals' },
  ],
  ROLE_DISTRIBUTOR: [
    { to: '/distributor', icon: '🚚', label: 'Dashboard' },
    { to: '/distributor/requests', icon: '✉️', label: 'Naye Requests' },
    { to: '/distributor/deals', icon: '🤝', label: 'Meri Deals' },
  ],
  ROLE_ADMIN: [
    { to: '/admin', icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Sab Users' },
    { to: '/admin/deals', icon: '🤝', label: 'Sare Deals' },
    { to: '/admin/companies', icon: '🏢', label: 'Companies' },
    { to: '/admin/pending', icon: '⏳', label: 'Approval Queue' },
  ],
};

const ROLE_LABEL = {
  ROLE_SELLER: 'Beche wala (Seller)',
  ROLE_COMPANY: 'Company',
  ROLE_DISTRIBUTOR: 'Distributor',
  ROLE_ADMIN: 'Admin',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { subscribe, connected } = useSocket();
  const { push } = useToast();
  const { speak } = useSpeak();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return undefined;

    const onChat = (msg) => {
      if (msg.senderId === user.id) return;
      const onThatChat = location.pathname.includes(`/chat/${msg.senderId}`);
      if (!onThatChat) {
        push(`Nayi baatayein aa gayi hain`, 'warn');
      }
    };
    const onRequest = (p) => {
      if (p.type === 'CHAT_REQUEST') {
        push(`Naya request: ${p.productName} x${p.quantity}`, 'warn');
        speak(`${p.productName}, ${p.quantity} unit ka naya request aaya hai. Ada mile, chaat shuru karein.`);
      } else if (p.type === 'CHAT_REQUEST_ACCEPTED') {
        push('Aapki request accept ho gayi!', 'info');
        speak('Aapki request ko accept kar liya gaya hai. Naya message aaya hai, price ke liye chaat dekhein.');
      } else if (p.type === 'CHAT_REQUEST_REJECTED') {
        push('Request reject ho gayi', 'error');
        speak('Aapki request ko reject kar diya gaya hai.');
      }
    };
    const onDeal = (p) => {
      if (p.type === 'LOCKED') {
        push('Deal lock ho gayi! QR scan karein', 'info');
        speak('Kamaab! Deal lock ho gayi hai. Ab dono taraf se QR code scan karke accept karein.');
      } else if (p.type === 'ACCEPT_WINDOW') {
        push('Accept window khul gayi — accept karein', 'warn');
        speak('Accept window khul gayi hai. Deal ko accept karne ke liye accept button dabayein.');
      } else if (p.type === 'DONE') {
        push('Deal poora ho gaya!', 'info');
        speak('Mubaarak ho! Deal poora ho gaya hai.');
      }
    };

    const unChat = subscribe('chat', onChat);
    const unRequest = subscribe('request', onRequest);
    const unDeal = subscribe('deal', onDeal);
    return () => {
      unChat();
      unRequest();
      unDeal();
    };
  }, [user, subscribe, push, speak, location.pathname]);

  if (!user) return null;
  const navItems = NAV[user.role] || [];
  const label = ROLE_LABEL[user.role] || user.role;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🍃</div>
          <div>
            <div className="brand-name">Kabadi Connect</div>
            <div className="brand-tag">Kabad ka sahi bhaav</div>
          </div>
        </div>

        <div className="nav-section">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <div className="user-chip" title={user.phone}>
            📞 {user.phone} · <b>{label}</b>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            ✕ Logout karein
          </button>
        </div>
      </aside>

      <main className="main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontWeight: 700, color: 'var(--green-800)', fontSize: 13.5 }}>
            <span className={`ws-dot${connected ? ' on' : ''}`} style={{ marginRight: 6 }} />
            {connected ? 'Real-time se juda hai' : 'Real-time se judne ki koshish...'}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}