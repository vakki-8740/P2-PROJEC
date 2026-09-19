import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { useParams, useNavigate } from 'react-router-dom';

export default function UserDetail() {
  const { mobile } = useParams();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userRef = ref(db, `users/${mobile}`);
    onValue(userRef, (snap) => {
      if (snap.exists()) setUser(snap.val());
    });

    const complaintsRef = ref(db, `complaints/${mobile}`);
    onValue(complaintsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const all = [];
        Object.entries(data).forEach(([type, entries]) => {
          Object.entries(entries).forEach(([id, entry]) => {
            all.push({ id, type, ...entry });
          });
        });
        setComplaints(all.reverse());
      }
    });

    const chatsRef = ref(db, `chats/${mobile}`);
    onValue(chatsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const all = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
        setChats(all.reverse());
      }
    });
  }, [mobile]);

  if (!user) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#007aff', fontSize: 14, fontWeight: 500 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1>User Detail</h1>
      </div>

      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#007aff', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>{user.name || 'Unknown'}</h2>
        </div>
        {[
          { label: 'Mobile', value: mobile },
          { label: 'Email', value: user.email },
          { label: 'Password', value: user.password },
          { label: 'Registered', value: user.date },
        ].filter(f => f.value).map((f, i) => (
          <div className="detail-row" key={i}>
            <span className="label">{f.label}</span>
            <span className="value">{f.value}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Complaints ({complaints.length})</h3>
        {complaints.length === 0 ? (
          <p style={{ fontSize: 14, color: '#86868b', textAlign: 'center', padding: 20 }}>No complaints</p>
        ) : complaints.map((c, i) => (
          <div className="list-item" key={i} onClick={() => navigate(`/complaint/${mobile}/${c.type}/${c.id}`)}>
            <div className="info">
              <div className="name">{c.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</div>
              <div className="detail">{(c.message || '').substring(0, 30)}</div>
            </div>
            <span className={`status-badge ${(c.status || 'pending').toLowerCase()}`}>{c.status || 'Pending'}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Chat History ({chats.length})</h3>
        {chats.length === 0 ? (
          <p style={{ fontSize: 14, color: '#86868b', textAlign: 'center', padding: 20 }}>No chat messages</p>
        ) : chats.map((c, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.sender === 'user' ? '#007aff' : '#34c759' }}>
                {c.sender === 'user' ? (user.name || 'User') : 'Bot'}
              </span>
              <span style={{ fontSize: 11, color: '#86868b' }}>{c.time}</span>
            </div>
            <p style={{ fontSize: 14, color: '#1d1d1f' }}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
