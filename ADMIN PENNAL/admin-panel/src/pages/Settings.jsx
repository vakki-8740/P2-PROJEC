import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../config/firebase';

export default function Settings() {
  const [telegram, setTelegram] = useState({
    complaintBotToken: '',
    complaintChatId: '',
    chatBotToken: '',
    chatChatId: '',
  });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const tgRef = ref(db, 'settings/telegram');
    const unsub = onValue(tgRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setTelegram({
          complaintBotToken: data.complaintBotToken || '',
          complaintChatId: data.complaintChatId || '',
          chatBotToken: data.chatBotToken || '',
          chatChatId: data.chatChatId || '',
        });
      }
      setLoaded(true);
    }, (error) => {
      console.error('Firebase read error:', error);
      setErrorMsg('Failed to load from Firebase');
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  const handleTgSave = async () => {
    setStatus('saving');
    setErrorMsg('');
    try {
      const tgRef = ref(db, 'settings/telegram');
      await set(tgRef, {
        complaintBotToken: telegram.complaintBotToken.trim(),
        complaintChatId: telegram.complaintChatId.trim(),
        chatBotToken: telegram.chatBotToken.trim(),
        chatChatId: telegram.chatChatId.trim(),
      });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setErrorMsg('Save failed: ' + error.message);
      setStatus('error');
    }
  };

  const testBot = async (type) => {
    const botToken = type === 'complaint' ? telegram.complaintBotToken : telegram.chatBotToken;
    const chatId = type === 'complaint' ? telegram.complaintChatId : telegram.chatChatId;
    if (!botToken || !chatId) {
      setErrorMsg('Enter bot token and chat ID first!');
      return;
    }
    setStatus('testing');
    try {
      const msg = type === 'complaint'
        ? 'Test Alert - Complaint Bot OK!'
        : 'Test Alert - Chat Bot OK!';
      const res = await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg })
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('tested');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setErrorMsg('Test failed: ' + (data.description || 'Check token/ID'));
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg('Test failed: ' + err.message);
      setStatus('error');
    }
  };

  if (!loaded) {
    return <div style={{textAlign:'center',padding:60,color:'#86868b'}}>Loading settings...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage Telegram alerts</p>
      </div>

      {errorMsg && (
        <div style={{background:'#fff5f5',color:'#ff3b30',padding:12,borderRadius:12,fontSize:13,fontWeight:500,marginBottom:16}}>
          {errorMsg}
        </div>
      )}

      <div className="card">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0088cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 style={{fontSize:16,fontWeight:600}}>Telegram Alerts</h3>
        </div>

        <h4 style={{fontSize:14,fontWeight:600,color:'#1d1d1f',marginBottom:10,padding:'8px 12px',background:'#f0f7ff',borderRadius:8}}>
          Complaint Alert Bot
        </h4>

        <div style={{marginBottom:12}}>
          <label style={{fontSize:13,fontWeight:600,color:'#1d1d1f',marginBottom:6,display:'block'}}>Bot Token</label>
          <div className="input-wrapper" style={{background:'#f5f5f7'}}>
            <input placeholder="1234567890:ABC..." value={telegram.complaintBotToken}
              onChange={(e) => setTelegram(prev => ({...prev, complaintBotToken: e.target.value}))} style={{fontSize:14}} />
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{fontSize:13,fontWeight:600,color:'#1d1d1f',marginBottom:6,display:'block'}}>Chat ID</label>
          <div className="input-wrapper" style={{background:'#f5f5f7'}}>
            <input placeholder="-1001234567890" value={telegram.complaintChatId}
              onChange={(e) => setTelegram(prev => ({...prev, complaintChatId: e.target.value}))} style={{fontSize:14}} />
          </div>
        </div>

        <button className="btn btn-secondary" style={{width:'100%',fontSize:13,marginBottom:20}} onClick={() => testBot('complaint')}>
          Test Complaint Bot
        </button>

        <h4 style={{fontSize:14,fontWeight:600,color:'#1d1d1f',marginBottom:10,padding:'8px 12px',background:'#f0fff0',borderRadius:8}}>
          Chat Message Alert Bot
        </h4>

        <div style={{marginBottom:12}}>
          <label style={{fontSize:13,fontWeight:600,color:'#1d1d1f',marginBottom:6,display:'block'}}>Bot Token</label>
          <div className="input-wrapper" style={{background:'#f5f5f7'}}>
            <input placeholder="1234567890:ABC..." value={telegram.chatBotToken}
              onChange={(e) => setTelegram(prev => ({...prev, chatBotToken: e.target.value}))} style={{fontSize:14}} />
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{fontSize:13,fontWeight:600,color:'#1d1d1f',marginBottom:6,display:'block'}}>Chat ID</label>
          <div className="input-wrapper" style={{background:'#f5f5f7'}}>
            <input placeholder="-1001234567890" value={telegram.chatChatId}
              onChange={(e) => setTelegram(prev => ({...prev, chatChatId: e.target.value}))} style={{fontSize:14}} />
          </div>
        </div>

        <button className="btn btn-secondary" style={{width:'100%',fontSize:13,marginBottom:16}} onClick={() => testBot('chat')}>
          Test Chat Bot
        </button>

        <button className="btn btn-primary" style={{width:'100%'}} onClick={handleTgSave} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved Successfully!' : 'Save All Settings'}
        </button>
      </div>

      <div className="card">
        <h3 style={{fontSize:16,fontWeight:600,marginBottom:14}}>About</h3>
        <div className="detail-row"><span className="label">Version</span><span className="value">1.0.0</span></div>
        <div className="detail-row"><span className="label">Admin Panel</span><span className="value">React + Vite</span></div>
      </div>
    </div>
  );
}
