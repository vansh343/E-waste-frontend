import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card card center">
        <div style={{ fontSize: 46 }}>🧭</div>
        <h1>Yeh raasta nahi mila</h1>
        <p className="muted">Jo page aap dhoond rahe hain wo exist nahi karta.</p>
        <Link className="btn btn-primary" to="/">Home chalein</Link>
      </div>
    </div>
  );
}