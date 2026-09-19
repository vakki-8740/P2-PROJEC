import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ complaints: 0, users: 0, chats: 0, pending: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const complaintsRef = ref(db, 'complaints');
    onValue(complaintsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const all = Object.entries(data).flatMap(([userMobile, types]) =>
          Object.entries(types).map(([type, entries]) => {
            const lastEntry = Object.values(entries).pop();
            return { userMobile, type, ...lastEntry };
          })
        );
        setStats(prev => ({ ...prev, complaints: all.length, pending: all.filter(c => c.status === 'Pending' || !c.status).length }));
        setRecentComplaints(all.slice(-5).reverse());
      }
    });

    const usersRef = ref(db, 'users');
    onValue(usersRef, (snap) => {
      const data = snap.val();
      setStats(prev => ({ ...prev, users: data ? Object.keys(data).length : 0 }));
    });

    const chatsRef = ref(db, 'chats');
    onValue(chatsRef, (snap) => {
      const data = snap.val();
      setStats(prev => ({ ...prev, chats: data ? Object.keys(data).length : 0 }));
    });
  }, []);

  const statCards = [
    { label: 'Total Complaints', value: stats.complaints, color: '#007aff', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    )},
    { label: 'Total Users', value: stats.users, color: '#34c759', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    )},
    { label: 'Active Chats', value: stats.chats, color: '#5856d6', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )},
    { label: 'Pending', value: stats.pending, color: '#ff9500', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Admin</p>
      </div>

      <div className="stat-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="number">{s.value}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Complaints</h3>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px 14px' }} onClick={() => navigate('/complaints')}>View All</button>
        </div>
        {recentComplaints.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <p>No complaints yet</p>
          </div>
        ) : (
          recentComplaints.map((c, i) => (
            <div className="list-item" key={i} onClick={() => navigate('/complaints')}>
              <div className="avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="info">
                <div className="name">{c.type === 'deposit' ? 'Deposit Issue' : 'Withdrawal Issue'}</div>
                <div className="detail">User: {c.userMobile}</div>
              </div>
              <span className={`status-badge ${(c.status || 'pending').toLowerCase()}`}>
                {c.status || 'Pending'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
