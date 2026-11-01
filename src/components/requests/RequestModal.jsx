import { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { URGENCY_LEVELS } from '../../data/mockRequests';
import BloodGroupBadge from '../common/BloodGroupBadge';

export default function RequestModal({ donor, onClose }) {
  const { user } = useAuth();
  const { sendRequest } = useApp();
  const [form, setForm] = useState({
    urgency: 'medium',
    hospital: '',
    units: 1,
    requiredDate: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.hospital.trim()) errs.hospital = 'Hospital/blood bank name is required';
    if (!form.requiredDate) errs.requiredDate = 'Required date is needed';
    if (form.units < 1 || form.units > 10) errs.units = 'Units must be between 1 and 10';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    sendRequest({
      senderId: user?.id || 'guest',
      senderName: user?.name || 'Guest User',
      donorId: donor.id,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      ...form,
    });
    setSubmitted(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
        animation: 'scaleIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#172033' }}>Send Donation Request</h2>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>To: {donor.name}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BloodGroupBadge group={donor.bloodGroup} />
            <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ padding: 8 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {submitted ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#172033', marginBottom: 8 }}>Request Sent!</h3>
            <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your donation request has been sent to <strong>{donor.name}</strong>. They will be notified and will respond soon.
            </p>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: 14, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                  This is a simulated request for demo purposes. In a real scenario, contact the nearest blood bank directly for urgent needs.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 24 }}>
            {/* Urgency */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Urgency Level *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {URGENCY_LEVELS.map(u => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, urgency: u.value }))}
                    style={{
                      padding: '10px 12px', borderRadius: 10, border: `2px solid ${form.urgency === u.value ? u.color : '#e2e8f0'}`,
                      background: form.urgency === u.value ? `${u.color}15` : 'white',
                      color: form.urgency === u.value ? u.color : '#64748B',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hospital */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Hospital / Blood Bank Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Manipal Hospital, Whitefield"
                value={form.hospital}
                onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
              />
              {errors.hospital && <span className="form-error">{errors.hospital}</span>}
            </div>

            {/* Units & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Units Required *</label>
                <input
                  className="form-input"
                  type="number" min="1" max="10"
                  value={form.units}
                  onChange={e => setForm(f => ({ ...f, units: parseInt(e.target.value) || 1 }))}
                />
                {errors.units && <span className="form-error">{errors.units}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Required By *</label>
                <input
                  className="form-input"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.requiredDate}
                  onChange={e => setForm(f => ({ ...f, requiredDate: e.target.value }))}
                />
                {errors.requiredDate && <span className="form-error">{errors.requiredDate}</span>}
              </div>
            </div>

            {/* Message */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Message (Optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Briefly explain the situation..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Disclaimer */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 12, marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#0369a1', lineHeight: 1.6 }}>
                ℹ️ This is a simulated request. The donor's contact information will only be shared after acceptance. For critical emergencies, contact your nearest blood bank directly.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                <Send size={16} /> Send Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
