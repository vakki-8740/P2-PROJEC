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
        const list = Object.entries(data).map(([mobile, messages]) => {
          const msgs = Object.values(messages);
          const lastMsg = msgs[msgs.length - 1];
          return {
            mobile,
            lastMessage: lastMsg?.text || '',
            lastTime: lastMsg?.time || '',
            sender: lastMsg?.sender || '',
            totalMessages: msgs.length,
          };
        });
        setChatUsers(list.reverse());
      }
    });
  }, []);

  const filtered = chatUsers.filter(c =>
    search === '' || c.mobile.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <h1>Chat Panel</h1>
        <p>All user conversations</p>
      </div>

      <div className="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input placeholder="Search by mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
          <div className="list-item" key={i} onClick={() => navigate(`/user/${c.mobile}`)}>
            <div className="avatar" style={{ background: '#e8f5e9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="info">
              <div className="name">{c.mobile}</div>
              <div className="detail">{(c.lastMessage).substring(0, 40)}</div>
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
