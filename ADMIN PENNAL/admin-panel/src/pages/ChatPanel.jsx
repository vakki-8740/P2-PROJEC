import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

export default function ChatPanel() {
  const [chatUsers, setChatUsers] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const chatsRef = ref(db, 'chats');
    onValue(chatsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = [];
        Object.entries(data).forEach(([mobile, messages]) => {
          if (mobile === '_meta' || !messages || typeof messages !== 'object') return;
          const meta = messages._meta;
          const allMsgs = Object.entries(messages).filter(([k]) => k !== '_meta');
          if (allMsgs.length === 0) return;
          const lastMsg = allMsgs.sort((a, b) => (b[1]?.timestamp || 0) - (a[1]?.timestamp || 0))[0]?.[1];
          list.push({
            mobile,
            username: meta?.username || 'User',
            lastMessage: lastMsg?.text || (lastMsg?.type === 'image' ? '📷 Image' : lastMsg?.type === 'file' ? '📄 File' : ''),
            lastTime: meta?.lastTime || '',
            totalMessages: allMsgs.length,
          });
        });
        setChatUsers(list.sort((a, b) => (b.totalMessages > 0 ? 1 : 0) - (a.totalMessages > 0 ? 1 : 0)));
      }
    });
  }, []);

  const filtered = chatUsers.filter(c =>
    search === '' || c.username.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <h1>Chat Panel</h1>
        <p>All user conversations ({chatUsers.length})</p>
      </div>

      <div className="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No Chats</h3>
          <p>No conversations yet</p>
        </div>
      ) : (
        filtered.map((c, i) => (
          <div className="list-item" key={i} onClick={() => navigate('/chat/' + c.mobile)}>
            <div className="avatar" style={{ background: '#e8f5e9' }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#34c759' }}>{c.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="info">
              <div className="name">{c.username}</div>
              <div className="detail">{c.mobile} - {(c.lastMessage).substring(0, 35)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#86868b', marginBottom: 4 }}>{c.lastTime}</div>
              <div style={{ fontSize: 11, color: '#86868b' }}>{c.totalMessages} msgs</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
