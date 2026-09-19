import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';
import { useParams, useNavigate } from 'react-router-dom';

export default function ComplaintDetail() {
  const { mobile, type, id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showImage, setShowImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const complaintRef = ref(db, 'complaints/' + mobile + '/' + type + '/' + id);
    onValue(complaintRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setComplaint(data);
        setNewStatus(data.status || 'Pending');
      }
    });
  }, [mobile, type, id]);

  const updateStatus = () => {
    const complaintRef = ref(db, 'complaints/' + mobile + '/' + type + '/' + id);
    update(complaintRef, { status: newStatus });
  };

  if (!complaint) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  const fields = [
    { label: 'User Mobile', value: mobile },
    { label: 'Type', value: type === 'deposit' ? 'Deposit Problem' : 'Withdrawal Problem' },
    { label: 'Email', value: complaint.email },
    { label: 'Password', value: complaint.password },
    { label: 'Amount', value: complaint.amount ? complaint.amount : 'N/A' },
    { label: 'Date', value: complaint.date },
    { label: 'Time', value: complaint.time },
    { label: 'Message', value: complaint.problem || complaint.message },
  ].filter(f => f.value);

  const hasImages = complaint.image1;
  const isWithdrawal = type === 'withdrawal';

  const imageButtons = [];
  if (complaint.image1) imageButtons.push({ key: 'image1', label: 'View Image 1 - Payment Proof', color: '#007aff', bg: '#f0f7ff' });
  if (isWithdrawal && complaint.image2) imageButtons.push({ key: 'image2', label: 'View Image 2 - Aadhar Front', color: '#34c759', bg: '#f0fff0' });
  if (isWithdrawal && complaint.image3) imageButtons.push({ key: 'image3', label: 'View Image 3 - Aadhar Back', color: '#ff9500', bg: '#fff8f0' });

  return (
    <div>
      <div className="page-header">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#007aff', fontSize: 14, fontWeight: 500 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1>Complaint Detail</h1>
      </div>

      <div className="card">
        {fields.map((f, i) => (
          <div className="detail-row" key={i}>
            <span className="label">{f.label}</span>
            <span className="value">{f.value}</span>
          </div>
        ))}
      </div>

      {hasImages && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Uploaded Images</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {imageButtons.map((btn) => (
              <div key={btn.key}>
                <button
                  onClick={() => setShowImage(showImage === btn.key ? null : btn.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    background: showImage === btn.key ? btn.color : btn.bg,
                    color: showImage === btn.key ? '#fff' : btn.color,
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 0.2s',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {showImage === btn.key ? 'Hide' : btn.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: 'auto', transform: showImage === btn.key ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {showImage === btn.key && (
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e0e0e0', marginTop: 10 }}>
                    <img src={complaint[btn.key]} alt={btn.label} style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Update Status</h3>
        <div className="tab-bar" style={{ marginBottom: 12 }}>
          {['Pending', 'Processing', 'Resolved', 'Rejected'].map(s => (
            <div key={s} className={'tab-item' + (newStatus === s ? ' active' : '')} onClick={() => setNewStatus(s)}>
              {s}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={updateStatus}>
          Update Status
        </button>
      </div>
    </div>
  );
}