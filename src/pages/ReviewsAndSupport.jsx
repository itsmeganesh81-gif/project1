import { useState } from 'react';
import {
  Star, ShieldCheck, CheckCircle, Send
} from 'lucide-react';
import { GrievanceSupportIcon } from '../components/common/CustomIcons';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'emergency_delay', label: 'Emergency: Requisition Delay / Crossmatch Issue' },
  { id: 'commercial_middleman_complaint', label: 'Critical: Middleman Demanding Payment (Tout Alert)' },
  { id: 'donor_unavailability', label: 'Donor: No-Show or Late for Emergency' },
  { id: 'blood_bank_issue', label: 'Facility: Blood Bank Service / Storage Grievance' },
  { id: 'technical_issue', label: 'Technical: App Navigation or Matching Glitch' },
  { id: 'general_feedback', label: 'Appreciation: Positive Experience / Praise' },
];

export default function ReviewsAndSupport() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'my_tickets' | 'public_reviews'
  const [toastMessage, setToastMessage] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    category: 'emergency_delay',
    severity: 'urgent',
    rating: 5,
    subject: '',
    description: '',
    facility_name: 'Manipal Hospital Whitefield',
    consent_public_display: false,
  });

  // Tracked submitted problem tickets
  const [myTickets, setMyTickets] = useState([
    {
      id: 'TKT-2026-901',
      category: 'commercial_middleman_complaint',
      severity: 'critical_emergency',
      subject: 'Suspicious middleman asking cash for blood outside ICU',
      description: 'An individual claiming to arrange replacement donors approached us demanding ₹4,000 cash near the casualty gate.',
      facility_name: 'Bowring Hospital',
      status: 'resolved',
      created_at: '2026-11-02 11:20',
      resolved_at: '2026-11-02 12:45',
      admin_response: 'Immediate security intervention completed. The tout was apprehended by hospital security and local police. BloodBridge remains 100% voluntary and free of charge.'
    },
    {
      id: 'TKT-2026-904',
      category: 'emergency_delay',
      severity: 'urgent',
      subject: 'Crossmatch sample delay during cardiac surgery',
      description: 'The pre-transfusion sample took over 45 minutes to reach the reference lab.',
      facility_name: 'Manipal Hospital Whitefield',
      status: 'under_review',
      created_at: '2026-11-03 16:10',
      resolved_at: null,
      admin_response: 'Duty medical coordinator has assigned a dedicated volunteer rapid courier for this corridor. Investigating transit checkpoint.'
    }
  ]);

  // Verified public community reviews (strictly consented)
  const [publicReviews, setPublicReviews] = useState([
    {
      id: 'rev-01',
      name: 'Ramesh V.',
      rating: 5,
      subject: 'Saved my daughter during emergency dengue thrombocytopenia',
      description: 'When her platelet count plummeted below 15,000, BloodBridge matched 2 voluntary apheresis donors within 30 minutes in Bengaluru. Life-saving coordination.',
      facility_name: 'Indian Red Cross Blood Centre',
      created_at: '2026-10-29'
    },
    {
      id: 'rev-02',
      name: 'Dr. Sunita Rao',
      rating: 5,
      subject: 'Exceptional Massive Hemorrhage Protocol coordination',
      description: 'The automated uncrossmatched emergency release protocol enabled our trauma surgical team to receive 4 units of O- negative red cells in under 20 minutes.',
      facility_name: 'Manipal Hospital Whitefield',
      created_at: '2026-10-25'
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmitProblem = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      alert('Please provide a subject and detailed description of the problem.');
      return;
    }

    const newTicket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      category: form.category,
      severity: form.severity,
      subject: form.subject,
      description: form.description,
      facility_name: form.facility_name,
      status: 'submitted',
      created_at: 'Just now',
      resolved_at: null,
      admin_response: 'Your grievance has been acknowledged and assigned to our duty medical coordination team for immediate resolution.'
    };

    setMyTickets([newTicket, ...myTickets]);

    if (form.consent_public_display && form.rating >= 4) {
      setPublicReviews([{
        id: `rev-${Date.now()}`,
        name: form.name || 'Anonymous Patient',
        rating: form.rating,
        subject: form.subject,
        description: form.description,
        facility_name: form.facility_name,
        created_at: 'Today'
      }, ...publicReviews]);
    }

    // Reset form
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      category: 'emergency_delay',
      severity: 'urgent',
      rating: 5,
      subject: '',
      description: '',
      facility_name: 'Manipal Hospital Whitefield',
      consent_public_display: false,
    });

    setActiveTab('my_tickets');
    showToast('Your problem ticket has been received. Our medical coordination team has been notified.');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Toast */}
        {toastMessage && (
          <div style={{
            position: 'fixed', top: 80, right: 24, zIndex: 1000,
            background: '#1e293b', color: 'white', padding: '14px 20px', borderRadius: 10,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14, fontWeight: 500, borderLeft: '4px solid #10b981'
          }}>
            <CheckCircle size={18} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '28px 32px',
          border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20,
          marginBottom: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700
              }}>
                <GrievanceSupportIcon size={16} color="#b91c1c" />
                <span>Customer Care & Grievance Redressal</span>
              </div>
              <span style={{ fontSize: 12, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                NBTC & DPDP Compliant
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Reviews & Problem Resolution Center
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
              Express your problems, report hospital issues, or share your blood donation experience directly with our coordinators.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Grievance Resolution Rate</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>96.8% Resolved</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('submit')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'submit' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'submit' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Express a Problem / Submit Review
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'my_tickets' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'my_tickets' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            My Problem Tickets ({myTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('public_reviews')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'public_reviews' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'public_reviews' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Community Experiences ({publicReviews.length})
          </button>
        </div>

        {/* TAB 1: SUBMIT FORM */}
        {activeTab === 'submit' && (
          <div style={{ background: 'white', borderRadius: 16, padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Tell Us What Happened
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                Every report is reviewed directly by our medical coordination desk. Your contact information is kept private under India's DPDP Act.
              </p>
            </div>

            <form onSubmit={handleSubmitProblem} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Star Rating Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Overall Rating
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <Star
                        size={28}
                        color={star <= form.rating ? '#eab308' : '#cbd5e1'}
                        fill={star <= form.rating ? '#eab308' : 'none'}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8 }}>
                    ({form.rating} out of 5 stars)
                  </span>
                </div>
              </div>

              {/* Category & Severity Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Problem Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Urgency Level *
                  </label>
                  <select
                    value={form.severity}
                    onChange={e => setForm({ ...form, severity: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                      border: form.severity === 'critical_emergency' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      color: form.severity === 'critical_emergency' ? '#ef4444' : '#0f172a'
                    }}
                  >
                    <option value="critical_emergency">Critical Emergency (Immediate Intervention Required)</option>
                    <option value="urgent">Urgent (&lt; 2 Hours)</option>
                    <option value="normal">Normal Problem Resolution</option>
                    <option value="feedback">General Feedback / Review</option>
                  </select>
                </div>
              </div>

              {/* Personal Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. name@example.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Phone Number (Masked under DPDP)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Hospital, Blood Bank or Facility Involved
                </label>
                <input
                  type="text"
                  value={form.facility_name}
                  onChange={e => setForm({ ...form, facility_name: e.target.value })}
                  placeholder="e.g. Manipal Hospital, Victoria Blood Centre, Red Cross"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Subject / Summary of Problem *
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Delayed release of PRBC units during bypass surgery"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Detailed Description of Problem / Grievance *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Please describe exactly what happened, including any specific names, timings, or demands..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              {/* DPDP Consent */}
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={form.consent_public_display}
                    onChange={e => setForm({ ...form, consent_public_display: e.target.checked })}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    <strong>DPDP Consent:</strong> Allow this review to be displayed on our Community Feedback board to guide other patients. (Personal phone numbers and sensitive medical history are always kept confidential).
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="submit"
                  style={{
                    background: form.severity === 'critical_emergency' ? '#ef4444' : '#D62839',
                    color: 'white', border: 'none', borderRadius: 8,
                    padding: '12px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(214,40,57,0.3)'
                  }}
                >
                  <Send size={16} /> Submit Problem Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: MY TICKETS & RESOLUTION STATUS */}
        {activeTab === 'my_tickets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myTickets.map(ticket => {
              const isResolved = ticket.status === 'resolved';

              return (
                <div
                  key={ticket.id}
                  style={{
                    background: 'white', borderRadius: 12, padding: '24px',
                    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#475569', fontSize: 13 }}>
                          {ticket.id}
                        </span>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {ticket.subject}
                        </h3>
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        Facility: <strong>{ticket.facility_name}</strong> • Submitted: {ticket.created_at}
                      </div>
                    </div>

                    <span style={{
                      fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                      padding: '4px 10px', borderRadius: 6,
                      background: isResolved ? '#dcfce7' : '#fef3c7',
                      color: isResolved ? '#15803d' : '#b45309'
                    }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p style={{ fontSize: 14, color: '#334155', margin: '0 0 16px', lineHeight: 1.5 }}>
                    "{ticket.description}"
                  </p>

                  {/* Official Response Box */}
                  <div style={{
                    background: isResolved ? '#f0fdf4' : '#f8fafc',
                    borderRadius: 10, padding: '14px 18px',
                    borderLeft: `4px solid ${isResolved ? '#16a34a' : '#0284c7'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: isResolved ? '#166534' : '#0369a1', marginBottom: 4 }}>
                      <ShieldCheck size={16} /> Official Medical Desk Response:
                    </div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                      {ticket.admin_response}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: COMMUNITY REVIEWS */}
        {activeTab === 'public_reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Verified Community Experiences
                </h3>
                <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                  Authentic feedback from families, hospitals, and voluntary donors across India.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={22} color="#eab308" fill="#eab308" />
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>4.9</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>/ 5.0 Rating</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {publicReviews.map(rev => (
                <div key={rev.id} style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={16} color="#eab308" fill="#eab308" />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{rev.created_at}</span>
                  </div>

                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                    {rev.subject}
                  </h4>

                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
                    "{rev.description}"
                  </p>

                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{rev.name}</span>
                    <span>{rev.facility_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

