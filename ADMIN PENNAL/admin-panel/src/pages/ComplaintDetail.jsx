import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';
import { useParams, useNavigate } from 'react-router-dom';

export default function ComplaintDetail() {
  const { mobile, type, id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const complaintRef = ref(db, `complaints/${mobile}/${type}/${id}`);
    onValue(complaintRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setComplaint(data);
        setNewStatus(data.status || 'Pending');
      }
    });
  }, [mobile, type, id]);

  const updateStatus = () => {
    const complaintRef = ref(db, `complaints/${mobile}/${type}/${id}`);
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
    { label: 'Amount', value: complaint.amount ? `${complaint.amount}` : 'N/A' },
    { label: 'Date', value: complaint.date },
    { label: 'Time', value: complaint.time },
    { label: 'Message', value: complaint.message },
  ].filter(f => f.value);

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

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Update Status</h3>
        <div className="tab-bar" style={{ marginBottom: 12 }}>
          {['Pending', 'Processing', 'Resolved', 'Rejected'].map(s => (
            <div key={s} className={`tab-item ${newStatus === s ? 'active' : ''}`} onClick={() => setNewStatus(s)}>
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
