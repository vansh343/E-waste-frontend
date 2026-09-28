import { Link } from 'react-router-dom';
import { useSpeak } from '../context/SpeakContext';
import { useEffect } from 'react';

export default function Landing() {
  const { setNarration } = useSpeak();

  useEffect(() => {
    setNarration(
      'Kabadi Connect mein aapka swagat hai. Yahan aap purana kabad, jaise battery, laptop, mobile top, bech sakte hain aur sahi bhaav paa sakte hain. Company aur distributor aapse seedha baat karke deal pakka karte hain. Sab kuch hinglish mein voice device ke saath. Neeche apni maayari ke hisaab se role chunein.',
    );
  }, [setNarration]);

  return (
    <div className="landing">
      <div className="landing-inner">
        <div className="topbar">
          <div className="brand">
            <div className="brand-logo">🍃</div>
            <div>
              <div className="brand-name" style={{ fontSize: 20 }}>Kabadi Connect</div>
              <div className="brand-tag">Kabad ka sahi bhaav · E-waste mandi</div>
            </div>
          </div>
          <div className="topbar-actions">
            <Link to="/signup" className="btn btn-soft">Signup karein</Link>
            <Link to="/login" className="btn btn-primary">Login karein</Link>
          </div>
        </div>

        <div className="hero">
          <h1>
            Purana kabad <span style={{ color: 'var(--green-600)' }}>becho</span>,
            <br />
            sahi bhaav <span style={{ color: 'var(--green-600)' }}>pao</span>. 💰
          </h1>
          <p>
            'Kabadi Connect' — ek digital kabaadiwala market. Battery, laptop, mobile, 
            patrhaar... jo bechna ho wo baatao, aapko sahi khareedar milenge. 
            Bargaining chat mein, deal lock QR se, aur pura process <b>Hinglish + voice</b> mein.
          </p>
          <div className="hero-stats">
            <div className="stat"><b>100%</b><span>Seedha kharidar se</span></div>
            <div className="stat"><b>🔄</b><span>Unlimited bargaining</span></div>
            <div className="stat"><b>🗣️</b><span>Voice assist in Hinglish</span></div>
            <div className="stat"><b>🌿</b><span>E-waste = environment care</span></div>
          </div>
        </div>

        <h2 className="how-title">Aap ho. Aapka role chunein</h2>
        <div className="role-grid">
          <Link to="/signup?role=ROLE_SELLER" className="role-card">
            <div className="role-icon">🧑‍🌾</div>
            <h3>Beche wala — Seller</h3>
            <p>Purana kabad hai jo bechna hai? Items daalein, sahi kharidar dekhein, chat mein bhaav lagaayein aur QR se deal pakki karein.</p>
            <span className="btn btn-soft btn-sm">Seller bano →</span>
          </Link>

          <Link to="/signup?role=ROLE_COMPANY" className="role-card">
            <div className="role-icon">🏢</div>
            <h3>Company (Kharidar)</h3>
            <p>Aap e-waste company ho? Products ki list, rate aur distributors manage karein. Sellers ke requests accept karke seedha deal karein.</p>
            <span className="btn btn-soft btn-sm">Company bano →</span>
          </Link>

          <Link to="/login" className="role-card">
            <div className="role-icon">🚚</div>
            <h3>Distributor</h3>
            <p>Aapka distributor account aapki company banati hai. Login karke request dekhiye, chat kijiye aur apne area ke deals pakkiye.</p>
            <span className="btn btn-soft btn-sm">Login karo →</span>
          </Link>
        </div>

        <h2 className="how-title">Kaise kaam karta hai?</h2>
        <div className="how-steps">
          <div className="step">
            <b>1. Bataayein kya bechna hai</b>
            <span>Item ka naam aur quantity daalein — jaise Battery x3, Laptop x1. Photo se auto-identify bhi ho sakta hai.</span>
          </div>
          <div className="step">
            <b>2. Sahi kharidar milega</b>
            <span>System aapke area ke paas ki companies aur distributors dikhata hai — saath rate aur doori ke saath.</span>
          </div>
          <div className="step">
            <b>3. Chat mein bhaav lagayein</b>
            <span>Voice + text chat. Money bargaining allowed! Final number dono side set karein aur lock karein.</span>
          </div>
          <div className="step">
            <b>4. QR se deal confirm</b>
            <span>Dono QR scan karein aur accept karein. Deal pakki! E-waste sahi haatho mein jaata hai — environment ke liye bhi accha.</span>
          </div>
        </div>

        <p className="center muted" style={{ marginTop: 42 }}>
          Made for Smart India Hackathon · 🌿 Green & White · Hinglish Voice Assist
        </p>
      </div>
    </div>
  );
}