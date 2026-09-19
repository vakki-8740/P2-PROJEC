import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { db } from '../config/firebase';
import { useParams, useNavigate } from 'react-router-dom';

export default function ChatDetail() {
  const { mobile } = useParams();
  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState(null);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const chatRef = ref(db, 'chats/' + mobile);
    onValue(chatRef, (snap) => {
      const data = snap.val();
      if (data) {
        setMeta(data._meta || null);
        const msgs = Object.entries(data)
          .filter(([k]) => k !== '_meta')
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(msgs);
      } else {
        setMessages([]);
        setMeta(null);
      }
    });
  }, [mobile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    push(ref(db, 'chats/' + mobile), {
      text: text,
      type: 'admin',
      sender: 'admin',
      timestamp: Date.now()
    });
    push(ref(db, 'chats/' + mobile + '/_meta'), {
      lastMessage: text,
      lastTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      lastTimestamp: Date.now()
    });
    setInputText('');
  };

  const sendImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) {
      alert('Image too large! Select image under 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      push(ref(db, 'chats/' + mobile), {
        url: event.target.result,
        type: 'image',
        sender: 'admin',
        timestamp: Date.now()
      });
      push(ref(db, 'chats/' + mobile + '/_meta'), {
        lastMessage: '📷 Image',
        lastTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        lastTimestamp: Date.now()
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', marginTop: 60 }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => navigate('/chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#34c759' }}>{meta?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f' }}>{meta?.username || 'User'}</div>
          <div style={{ fontSize: 12, color: '#86868b' }}>{mobile}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f5f5f7', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#86868b' }}>
            <p>No messages yet</p>
          </div>
        )}

        {messages.map((msg) => {
          const isAdmin = msg.type === 'admin' || msg.sender === 'admin';
          const isImage = msg.type === 'image';

          let bubbleStyle = {
            maxWidth: '75%',
            padding: '10px 14px',
            borderRadius: 16,
            fontSize: 14,
            lineHeight: 1.4,
            wordBreak: 'break-word',
          };

          if (isAdmin) {
            bubbleStyle.background = '#007aff';
            bubbleStyle.color = '#fff';
            bubbleStyle.alignSelf = 'flex-end';
            bubbleStyle.borderBottomRightRadius = 4;
          } else {
            bubbleStyle.background = '#fff';
            bubbleStyle.color = '#1d1d1f';
            bubbleStyle.alignSelf = 'flex-start';
            bubbleStyle.borderBottomLeftRadius = 4;
            bubbleStyle.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
          }

          if (isImage) {
            bubbleStyle.padding = 4;
            bubbleStyle.overflow = 'hidden';
          }

          const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
              <div style={bubbleStyle}>
                {isImage ? (
                  <img src={msg.url} alt="Shared" style={{ width: '100%', maxWidth: 280, borderRadius: 12, display: 'block' }} />
                ) : (
                  <div>{msg.text}</div>
                )}
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{timeStr}</div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: '10px 16px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button onClick={() => fileInputRef.current?.click()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={sendImage} style={{ display: 'none' }} />
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 14, outline: 'none' }}
        />
        <button onClick={sendMessage} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#007aff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  );
}
