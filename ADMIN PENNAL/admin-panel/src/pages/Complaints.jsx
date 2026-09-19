import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const complaintsRef = ref(db, 'complaints');
    onValue(complaintsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const all = [];
        Object.entries(data).forEach(([mobile, types]) => {
          if (typeof types === 'object') {
            Object.entries(types).forEach(([type, entries]) => {
              if (typeof entries === 'object') {
                Object.entries(entries).forEach(([id, entry]) => {
                  if (entry && entry.timestamp) {
                    all.push({ id, userMobile: mobile, type, ...entry });
                  }
                });
              }
            });
          }
        });
        setComplaints(all.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      }
    });
  }, []);

  const filtered = complaints.filter(c => {
    const matchFilter = filter === 'all' || c.type === filter || (c.status || 'pending').toLowerCase() === filter;
    const matchSearch = search === '' || c.userMobile.includes(search) || (c.message || '').toLowerCase().includes(search.toLowerCase()) || (c.username || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Complaints</h1>
        <p>All user complaints ({complaints.length})</p>
      </div>

      <div className="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="tab-bar">
        {['all', 'deposit', 'withdrawal', 'pending', 'resolved'].map(f => (
          <div key={f} className={`tab-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3>No Complaints</h3>
          <p>No complaints found</p>
        </div>
      ) : (
        filtered.map((c, i) => (
          <div className="list-item" key={i} onClick={() => navigate('/complaint/' + c.userMobile + '/' + c.type + '/' + c.id)}>
            <div className="avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="info">
              <div className="name">
                {c.username || 'User'} - {c.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                {c.image1 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6, padding: '2px 6px', background: '#e8f5e9', borderRadius: 6, fontSize: 10, color: '#34c759', fontWeight: 600 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    {c.image3 ? '3 imgs' : c.image2 ? '2 imgs' : '1 img'}
                  </span>
                )}
              </div>
              <div className="detail">{c.userMobile} - {(c.problem || c.message || '').substring(0, 40)}</div>
            </div>
            <span className={`status-badge ${(c.status || 'pending').toLowerCase()}`}>{c.status || 'Pending'}</span>
          </div>
        ))
      )}
    </div>
  );
}
