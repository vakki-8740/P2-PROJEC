import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../config/firebase';

export default function Settings() {
  const [redirectLinks, setRedirectLinks] = useState({
    deposit: '',
    withdrawal: '',
    chat: '',
  });
  const [telegram, setTelegram] = useState({
    complaintBotToken: '',
    complaintChatId: '',
    chatBotToken: '',
    chatChatId: '',
  });
  const [saved, setSaved] = useState(false);
  const [tgSaved, setTgSaved] = useState(false);

  useEffect(() => {
    const settingsRef = ref(db, 'settings/redirects');
    onValue(settingsRef, (snap) => {
      if (snap.exists()) setRedirectLinks(snap.val());
    });

    const tgRef = ref(db, 'settings/telegram');
    onValue(tgRef, (snap) => {
      if (snap.exists()) setTelegram(snap.val());
    });
  }, []);

  const handleSave = () => {
    const settingsRef = ref(db, 'settings/redirects');
    set(settingsRef, redirectLinks);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTgSave = () => {
    const tgRef = ref(db, 'settings/telegram');
    set(tgRef, telegram);
    setTgSaved(true);
    setTimeout(() => setTgSaved(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage redirect links and app config</p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Redirect Links</h3>
        <p style={{ fontSize: 13, color: '#86868b', marginBottom: 16 }}>
          These links control where users are redirected after actions
        </p>

        {[
          { key: 'deposit', label: 'Deposit Complaint Link', placeholder: 'https://example.com/deposit' },
          { key: 'withdrawal', label: 'Withdrawal Complaint Link', placeholder: 'https://example.com/withdrawal' },
          { key: 'chat', label: 'Online Chat Link', placeholder: 'https://example.com/chat' },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 6, display: 'block' }}>
              {field.label}
            </label>
            <div className="input-wrapper" style={{ background: '#f5f5f7' }}>
              <input
                placeholder={field.placeholder}
                value={redirectLinks[field.key]}
                onChange={(e) => setRedirectLinks(prev => ({ ...prev, [field.key]: e.target.value }))}
                style={{ fontSize: 14 }}
              />
            </div>
          </div>
        ))}

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0088cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Telegram Alerts</h3>
        </div>
        <p style={{ fontSize: 13, color: '#86868b', marginBottom: 16 }}>
          Set bot token and chat ID for complaint & chat alerts
        </p>

        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 10, padding: '8px 12px', background: '#f0f7ff', borderRadius: 8 }}>
          Complaint Alert Bot
        </h4>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 6, display: 'block' }}>
            Bot Token
          </label>
          <div className="input-wrapper" style={{ background: '#f5f5f7' }}>
            <input
              placeholder="1234567890:ABCdefGHI..."
              value={telegram.complaintBotToken}
              onChange={(e) => setTelegram(prev => ({ ...prev, complaintBotToken: e.target.value }))}
              style={{ fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 6, display: 'block' }}>
            Chat ID
          </label>
          <div className="input-wrapper" style={{ background: '#f5f5f7' }}>
            <input
              placeholder="-1001234567890"
              value={telegram.complaintChatId}
              onChange={(e) => setTelegram(prev => ({ ...prev, complaintChatId: e.target.value }))}
              style={{ fontSize: 14 }}
            />
          </div>
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 10, padding: '8px 12px', background: '#f0fff0', borderRadius: 8 }}>
          Chat Message Alert Bot
        </h4>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 6, display: 'block' }}>
            Bot Token
          </label>
          <div className="input-wrapper" style={{ background: '#f5f5f7' }}>
            <input
              placeholder="1234567890:ABCdefGHI..."
              value={telegram.chatBotToken}
              onChange={(e) => setTelegram(prev => ({ ...prev, chatBotToken: e.target.value }))}
              style={{ fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 6, display: 'block' }}>
            Chat ID
          </label>
          <div className="input-wrapper" style={{ background: '#f5f5f7' }}>
            <input
              placeholder="-1001234567890"
              value={telegram.chatChatId}
              onChange={(e) => setTelegram(prev => ({ ...prev, chatChatId: e.target.value }))}
              style={{ fontSize: 14 }}
            />
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleTgSave}>
          {tgSaved ? 'Saved!' : 'Save Telegram Settings'}
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Firebase Info</h3>
        {[
          { label: 'Project ID', value: 'zenvy-store-43ca0' },
          { label: 'Database', value: 'asia-southeast1' },
          { label: 'Projects', value: 'PARIMATCH-1, PARIMATCH-2' },
        ].map((f, i) => (
          <div className="detail-row" key={i}>
            <span className="label">{f.label}</span>
            <span className="value" style={{ fontSize: 12 }}>{f.value}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>About</h3>
        <div className="detail-row">
          <span className="label">Version</span>
          <span className="value">1.0.0</span>
        </div>
        <div className="detail-row">
          <span className="label">Admin Panel</span>
          <span className="value">React + Vite</span>
        </div>
        <div className="detail-row">
          <span className="label">UI Style</span>
          <span className="value">iOS Design</span>
        </div>
      </div>
    </div>
  );
}
