import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { db } from '../config/firebase';
import { useParams, useNavigate } from 'react-router-dom';

export default function ChatDetail() {
  const { mobile } = useParams();
  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState(null);
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [popupMsg, setPopupMsg] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const chatRef = ref(db, 'chats/' + mobile);
    onValue(chatRef, (snap) => {
      const data = snap.val();
      if (data) {
        setMeta(data._meta || null);
        setIsBlocked(data._meta?.blocked || false);
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

    if (editingMsg) {
      update(ref(db, 'chats/' + mobile + '/' + editingMsg.id), { text: text });
      setEditingMsg(null);
      setInputText('');
      return;
    }

    const msgData = {
      text: text,
      type: 'admin',
      sender: 'admin',
      timestamp: Date.now()
    };
    if (replyTo) {
      msgData.replyTo = replyTo.text;
      msgData.replyId = replyTo.id;
    }
    push(ref(db, 'chats/' + mobile), msgData);
    push(ref(db, 'chats/' + mobile + '/_meta'), {
      lastMessage: text,
      lastTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      lastTimestamp: Date.now()
    });
    setInputText('');
    setReplyTo(null);
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

  const deleteMessage = (msg) => {
    if (confirm('Delete this message?')) {
      remove(ref(db, 'chats/' + mobile + '/' + msg.id));
      setContextMenu(null);
    }
  };

  const editMessage = (msg) => {
    setEditingMsg(msg);
    setInputText(msg.text);
    setContextMenu(null);
  };

  const replyToMessage = (msg) => {
    setReplyTo(msg);
    setContextMenu(null);
    setInputText('');
  };

  const toggleBlock = () => {
    const newBlocked = !isBlocked;
    update(ref(db, 'chats/' + mobile + '/_meta'), { blocked: newBlocked });
    setIsBlocked(newBlocked);
  };

  const deleteUserChat = () => {
    if (confirm('Delete ALL chat messages for this user? This cannot be undone!')) {
      remove(ref(db, 'chats/' + mobile));
      navigate('/chat');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', marginTop: 60 }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => navigate('/chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#34c759' }}>{meta?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f' }}>{meta?.username || 'User'}</div>
          <div style={{ fontSize: 12, color: '#86868b' }}>{mobile}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleBlock} style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: isBlocked ? '#fff5f5' : '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={isBlocked ? 'Unblock User' : 'Block User'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isBlocked ? '#ff3b30' : '#86868b'} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
          </button>
          <button onClick={deleteUserChat} style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete All Messages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          </button>
        </div>
      </div>

      {isBlocked && (
        <div style={{ padding: '8px 16px', background: '#fff5f5', textAlign: 'center', fontSize: 13, color: '#ff3b30', fontWeight: 500 }}>
          User is BLOCKED - Messages cannot be sent
        </div>
      )}

      {/* Messages */}
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
            cursor: 'pointer',
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
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ msg, x: e.clientX, y: e.clientY }); }}>
              <div style={bubbleStyle} onClick={() => setPopupMsg(msg)}>
                {msg.replyTo && (
                  <div style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.1)', borderRadius: 8, fontSize: 11, marginBottom: 6, borderLeft: '3px solid rgba(0,0,0,0.2)' }}>
                    {msg.replyTo.substring(0, 50)}...
                  </div>
                )}
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

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setContextMenu(null)} />
          <div style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden', minWidth: 140 }}>
            <button onClick={() => replyToMessage(contextMenu.msg)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: 'none', background: 'none', width: '100%', cursor: 'pointer', fontSize: 14 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
              Reply
            </button>
            {contextMenu.msg.sender === 'admin' && (
              <button onClick={() => editMessage(contextMenu.msg)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: 'none', background: 'none', width: '100%', cursor: 'pointer', fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff9500" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit
              </button>
            )}
            <button onClick={() => deleteMessage(contextMenu.msg)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: 'none', background: 'none', width: '100%', cursor: 'pointer', fontSize: 14, color: '#ff3b30' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              Delete
            </button>
          </div>
        </>
      )}

      {/* Input Area */}
      <div style={{ padding: '10px 16px', background: '#fff', borderTop: '1px solid #eee', flexShrink: 0 }}>
        {replyTo && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f0f7ff', borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
            <span>Replying to: {replyTo.text?.substring(0, 40)}...</span>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007aff', fontWeight: 600 }}>X</button>
          </div>
        )}
        {editingMsg && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#fff8f0', borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
            <span>Editing: {editingMsg.text?.substring(0, 40)}...</span>
            <button onClick={() => { setEditingMsg(null); setInputText(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff9500', fontWeight: 600 }}>X</button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => fileInputRef.current?.click()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={sendImage} style={{ display: 'none' }} />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isBlocked ? 'User is blocked...' : editingMsg ? 'Edit message...' : replyTo ? 'Type reply...' : 'Type a message...'}
            disabled={isBlocked}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 14, outline: 'none', opacity: isBlocked ? 0.5 : 1 }}
          />
          <button onClick={sendMessage} disabled={isBlocked} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: isBlocked ? '#ccc' : '#007aff', cursor: isBlocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>

      {/* Message Popup Modal */}
      {popupMsg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setPopupMsg(null)}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 400, width: '100%', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Message Details</span>
              <button onClick={() => setPopupMsg(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>X</button>
            </div>
            <div style={{ padding: 16 }}>
              {popupMsg.type === 'image' ? (
                <img src={popupMsg.url} alt="Shared" style={{ width: '100%', borderRadius: 10, marginBottom: 10 }} />
              ) : (
                <div style={{ fontSize: 15, lineHeight: 1.5, wordBreak: 'break-word', marginBottom: 10 }}>{popupMsg.text}</div>
              )}
              <div style={{ fontSize: 12, color: '#888', borderTop: '1px solid #eee', paddingTop: 10 }}>
                <div>Date: {popupMsg.timestamp ? new Date(popupMsg.timestamp).toLocaleDateString() : 'N/A'}</div>
                <div>Time: {popupMsg.timestamp ? new Date(popupMsg.timestamp).toLocaleTimeString() : 'N/A'}</div>
                <div>Type: {popupMsg.sender === 'admin' ? 'Admin' : 'User'}</div>
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
              <button onClick={() => { replyToMessage(popupMsg); setPopupMsg(null); }} style={{ flex: 1, padding: 10, background: '#007aff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reply</button>
              {popupMsg.sender === 'admin' && (
                <button onClick={() => { editMessage(popupMsg); setPopupMsg(null); }} style={{ flex: 1, padding: 10, background: '#ff9500', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              )}
              <button onClick={() => { deleteMessage(popupMsg); setPopupMsg(null); }} style={{ flex: 1, padding: 10, background: '#ff3b30', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
