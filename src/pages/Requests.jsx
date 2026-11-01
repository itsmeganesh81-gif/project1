import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, AlertTriangle, CheckCircle, XCircle, Clock,
  Calendar, MapPin, Plus, Filter, Search, Phone, User, Droplets, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import BloodGroupBadge from '../components/common/BloodGroupBadge';
import { URGENCY_LEVELS } from '../data/mockRequests';
import { BLOOD_GROUPS, mockDonors } from '../data/mockDonors';

export default function Requests() {
  const { user, addPoints } = useAuth();
  const { requests, updateRequestStatus, cancelRequest, sendRequest, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'sent' | 'received'
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New emergency request form state
  const [newReq, setNewReq] = useState({
    bloodGroup: 'O+',
    urgency: 'critical',
    hospital: '',
    units: 1,
    requiredDate: new Date().toISOString().split('T')[0],
    message: '',
  });

  const getFilteredRequests = () => {
    return requests.filter(req => {
      // Tab filter
      if (activeTab === 'sent') {
        const isSent = req.senderId === user?.id || req.senderId === 'demo-receiver' || req.senderId === 'guest';
        if (!isSent) return false;
      } else if (activeTab === 'received') {
        const isReceived = req.donorId === user?.id || req.donorId === 'demo-donor' || req.donorId === 'demo-user';
        if (!isReceived) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;

      // Urgency filter
      if (urgencyFilter !== 'all' && req.urgency !== urgencyFilter) return false;

      return true;
    });
  };

  const handleCreateEmergencyRequest = (e) => {
    e.preventDefault();
    if (!newReq.hospital.trim()) {
      showToast('Please specify hospital/blood bank name', 'error');
      return;
    }

    sendRequest({
      senderId: user?.id || 'demo-receiver',
      senderName: user?.name || 'Emergency Receiver',
      donorId: 'broadcast',
      donorName: 'Open Community Request',
      ...newReq,
    });

    setShowCreateModal(false);
    setNewReq({
      bloodGroup: 'O+',
      urgency: 'critical',
      hospital: '',
      units: 1,
      requiredDate: new Date().toISOString().split('T')[0],
      message: '',
    });
    showToast('Emergency blood request broadcasted to donors!', 'success');
  };

  const handleAcceptRequest = (req) => {
    updateRequestStatus(req.id, 'accepted');
    if (addPoints) {
      addPoints(50, 'request_accepted', 'Accepted Donation Request');
    }
    showToast(`You accepted the request for ${req.bloodGroup}! +50 points awarded.`, 'success');
  };

  const handleCompleteRequest = (req) => {
    updateRequestStatus(req.id, 'completed');
    if (addPoints) {
      addPoints(100, 'blood_donation', 'Completed Blood Donation');
    }
    showToast('Donation verified! +100 points added to your balance.', 'success');
  };

  const filtered = getFilteredRequests();

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> CRITICAL</span>;
      case 'high':
        return <span style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>HIGH (48h)</span>;
      case 'medium':
        return <span style={{ background: '#fefce8', color: '#a16207', border: '1px solid #fef08a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>MEDIUM</span>;
      default:
        return <span style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>LOW (PLANNED)</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={12} /> ACCEPTED</span>;
      case 'completed':
        return <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> COMPLETED</span>;
      case 'cancelled':
        return <span style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> CANCELLED</span>;
      default:
        return <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> PENDING</span>;
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <ClipboardList size={24} color="#D62839" />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172033', margin: 0 }}>
              Blood Donation Requests
            </h1>
          </div>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
            Manage incoming donor requests, coordinate transfusions, and track urgent patient inquiries.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            borderRadius: 12, fontSize: 14, fontWeight: 700,
          }}
        >
          <Plus size={18} /> Post Emergency Request
        </button>
      </div>

      {/* Top Filter Bar */}
      <div style={{
        background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0',
        marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
        justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {/* Main Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'sent', label: 'Sent by Me' },
            { id: 'received', label: 'Received as Donor' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#D62839' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white', color: '#1e293b' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white', color: '#1e293b' }}
            >
              <option value="all">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 20px', background: 'white',
          borderRadius: 16, border: '1px solid #e2e8f0',
        }}>
          <ClipboardList size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#172033', marginBottom: 6 }}>
            No Requests Found
          </h3>
          <p style={{ color: '#64748B', fontSize: 14, maxWidth: 420, margin: '0 auto 20px' }}>
            There are no blood requests matching your current tab or filter selections.
          </p>
          <button
            onClick={() => { setActiveTab('all'); setStatusFilter('all'); setUrgencyFilter('all'); }}
            style={{
              padding: '8px 18px', borderRadius: 8, border: '1px solid #cbd5e1',
              background: 'white', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(req => {
            const isUserDonor = req.donorId === user?.id || req.donorId === 'demo-donor' || req.donorId === 'demo-user';
            const isUserSender = req.senderId === user?.id || req.senderId === 'demo-receiver' || req.senderId === 'guest';

            return (
              <div
                key={req.id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  border: req.urgency === 'critical' ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  padding: 24,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <BloodGroupBadge bloodGroup={req.bloodGroup} size="lg" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#172033', margin: 0 }}>
                          {req.units} Unit{req.units > 1 ? 's' : ''} {req.bloodGroup} Required
                        </h3>
                        {getUrgencyBadge(req.urgency)}
                        {getStatusBadge(req.status)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4, fontSize: 13, color: '#64748B' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={14} color="#D62839" /> {req.hospital}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={14} /> Needed by: {req.requiredDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: 12, color: '#94a3b8' }}>
                    Created {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Message */}
                {req.message && (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 13,
                    color: '#334155',
                    marginBottom: 16,
                    borderLeft: '3px solid #cbd5e1',
                    lineHeight: 1.5,
                  }}>
                    "{req.message}"
                  </div>
                )}

                {/* Parties info and Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  paddingTop: 12,
                  borderTop: '1px solid #f1f5f9',
                }}>
                  <div style={{ fontSize: 13, color: '#64748B', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>
                      Requested by: <strong style={{ color: '#1e293b' }}>{req.senderName}</strong>
                    </span>
                    <span>
                      Recipient Donor: <strong style={{ color: '#1e293b' }}>{req.donorName}</strong>
                    </span>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Simulated call button */}
                    <a
                      href="tel:+919876543210"
                      onClick={(e) => { e.preventDefault(); showToast('Simulating call to coordinator: +91 98765 43210', 'info'); }}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                        background: 'white', color: '#475569', fontSize: 12, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                      }}
                    >
                      <Phone size={13} /> Call Coordinator
                    </a>

                    {/* Donor Pending Actions */}
                    {req.status === 'pending' && isUserDonor && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'cancelled')}
                          style={{
                            padding: '6px 14px', borderRadius: 8, border: '1px solid #fca5a5',
                            background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(req)}
                          style={{
                            padding: '6px 14px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          Accept (+50 pts)
                        </button>
                      </>
                    )}

                    {/* Donor Accepted -> Complete Action */}
                    {req.status === 'accepted' && (
                      <button
                        onClick={() => handleCompleteRequest(req)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none',
                          background: 'linear-gradient(135deg, #D62839, #b91c1c)', color: 'white',
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Verify & Complete (+100 pts)
                      </button>
                    )}

                    {/* Sender Pending Action */}
                    {req.status === 'pending' && !isUserDonor && (
                      <button
                        onClick={() => cancelRequest(req.id)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                          background: 'white', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Emergency Request Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 20, maxWidth: 520, width: '100%',
            padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D62839' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#172033', margin: 0 }}>
                    Emergency Blood Request
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                    Broadcast urgent blood requirement to voluntary donors
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmergencyRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Blood Group Needed
                  </label>
                  <select
                    value={newReq.bloodGroup}
                    onChange={e => setNewReq({ ...newReq, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 600 }}
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Units Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newReq.units}
                    onChange={e => setNewReq({ ...newReq, units: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Urgency Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {URGENCY_LEVELS.map(lvl => (
                    <button
                      type="button"
                      key={lvl.value}
                      onClick={() => setNewReq({ ...newReq, urgency: lvl.value })}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: newReq.urgency === lvl.value ? `2px solid ${lvl.color}` : '1px solid #cbd5e1',
                        background: newReq.urgency === lvl.value ? '#fef2f2' : 'white',
                        color: newReq.urgency === lvl.value ? lvl.color : '#475569',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Hospital / Blood Bank Name & City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manipal Hospital, HAL Airport Road, Bengaluru"
                  value={newReq.hospital}
                  onChange={e => setNewReq({ ...newReq, hospital: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Required By Date
                </label>
                <input
                  type="date"
                  value={newReq.requiredDate}
                  onChange={e => setNewReq({ ...newReq, requiredDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Patient Condition & Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Patient undergoing emergency cardiac surgery. Attender contact: 9876543210"
                  value={newReq.message}
                  onChange={e => setNewReq({ ...newReq, message: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #D62839, #b91c1c)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  Broadcast Emergency Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
