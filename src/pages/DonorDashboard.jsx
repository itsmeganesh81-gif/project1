import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Phone, Calendar, Clock, MapPin, CheckCircle, AlertTriangle,
  Bell, ChevronRight, Award, Shield, User, Search, Activity, Sparkles,
  Smartphone, Monitor, FileText, Check, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { achievements } from '../data/achievements';
import { getDonorLevel, getLevelProgress, getNextLevel } from '../utils/pointsCalculator';
import Avatar from '../components/common/Avatar';
import BloodGroupBadge from '../components/common/BloodGroupBadge';
import LevelBadge from '../components/common/LevelBadge';
import {
  BloodBridgeLogoIcon,
  HospitalClinicalIcon,
  BloodBankVaultIcon,
  SurplusExchangeIcon,
  ClinicalMatchIcon,
  RecurringTransfusionIcon,
  RarePhenotypeIcon,
  VolunteerCourierIcon,
  GrievanceSupportIcon
} from '../components/common/CustomIcons';

export default function DonorDashboard() {
  const { user, toggleAvailability, addPoints } = useAuth();
  const { requests, updateRequestStatus, showToast } = useApp();
  const navigate = useNavigate();

  // Mode: 'mobile' (mockup phone chassis matching the template) or 'desktop' (expanded responsive view)
  const [viewMode, setViewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'appointments' | 'history' | 'achievements'
  const [confirmedModalData, setConfirmedModalData] = useState(null);

  if (!user) return null;

  const level = getDonorLevel(user.points);
  const nextLevel = getNextLevel(user.points);
  const progress = getLevelProgress(user.points);

  // Incoming requests for this donor
  const incomingRequests = requests.filter(r => r.donorId === user.id && r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.donorId === user.id && r.status === 'accepted');

  const earnedAchievements = achievements.filter(a => (user.achievements || []).includes(a.id));
  const lockedAchievements = achievements.filter(a => !(user.achievements || []).includes(a.id));

  // Handle acceptance with the template's Thank You modal
  const handleAcceptRequest = (req) => {
    updateRequestStatus(req.id, 'accepted');
    if (addPoints) addPoints(50);
    setConfirmedModalData({
      title: 'Donation Confirmed!',
      subtitle: `Your commitment to donate ${req.bloodGroup} blood has been registered.`,
      patientName: req.senderName || 'Emergency Patient',
      hospital: req.hospital || 'Manipal Hospital, Whitefield',
      date: req.requiredDate || new Date().toISOString().split('T')[0],
      time: '10:30 AM',
      referenceToken: `BB-CONF-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  const handleDeclineRequest = (reqId) => {
    updateRequestStatus(reqId, 'rejected');
    if (showToast) showToast('Request declined', 'info');
  };

  // The Dashboard Content Render (Shared between Mobile Frame and Desktop Responsive View)
  const renderDashboardContent = (isMobileFrame = false) => (
    <div style={{
      background: '#FAF9F9',
      minHeight: isMobileFrame ? '760px' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* 1. HERO CRIMSON CURVED HEADER (Matching Template Screen 3 Center) */}
      <div className="template-crimson-header" style={{
        padding: isMobileFrame ? '20px 20px 32px' : '36px 32px 48px',
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        boxShadow: '0 12px 30px rgba(200, 30, 50, 0.22)',
      }}>
        {/* Top Mini Bar with Medical Emblem and Notification Bell */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BloodBridgeLogoIcon size={26} color="#FFFFFF" />
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.5px', color: '#FFFFFF' }}>
              Dr.Consult <span style={{ opacity: 0.85, fontWeight: 500 }}>| BloodBridge</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Availability Pill */}
            <button
              onClick={toggleAvailability}
              style={{
                background: user.available ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 9999,
                padding: '4px 12px',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              title="Click to toggle availability"
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: user.available ? '#34D399' : '#FCA5A5',
                display: 'inline-block'
              }} />
              {user.available ? 'Available' : 'Paused'}
            </button>

            {/* Notification Bell */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', cursor: 'pointer'
            }}>
              <Bell size={17} color="#FFFFFF" />
              {incomingRequests.length > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#FDE047', border: '1.5px solid #C81E32'
                }} />
              )}
            </div>
          </div>
        </div>

        {/* Center Profile Section with White-Ring Avatar */}
        <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
          <div className="template-avatar-ring">
            <Avatar
              name={user.name}
              initials={user.initials}
              avatar={user.avatar}
              size={isMobileFrame ? 84 : 96}
            />
          </div>

          <h2 style={{
            fontSize: isMobileFrame ? 22 : 26,
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '12px 0 4px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            letterSpacing: '-0.3px',
          }}>
            {user.name}
          </h2>

          {/* Translucent Contact & Blood Badge Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(10px)',
            borderRadius: 9999,
            padding: '6px 18px',
            marginTop: 4,
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>
              <Phone size={13} color="#FFFFFF" />
              {user.phone_masked || '+91 98*** **78'}
            </span>
            <span style={{ opacity: 0.4, color: '#FFFFFF' }}>•</span>
            <span style={{
              background: '#FFFFFF',
              color: '#C81E32',
              fontSize: 11,
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              🩸 {user.bloodGroup || 'O+'}
            </span>
            <span style={{ opacity: 0.4, color: '#FFFFFF' }}>•</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', opacity: 0.9 }}>
              {user.locality || 'Koramangala'}
            </span>
          </div>
        </div>

        {/* 3-Column Stats Row (Matching "Consultations (12) / Patients (150+) / Rating (4.9)" in Template) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: 'rgba(255, 255, 255, 0.14)',
          backdropFilter: 'blur(8px)',
          borderRadius: 20,
          padding: '14px 10px',
          marginTop: 18,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
        }}>
          <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.2)', padding: '0 6px' }}>
            <div style={{ fontSize: isMobileFrame ? 18 : 22, fontWeight: 900, color: '#FFFFFF' }}>
              {user.totalDonations || 0}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
              Donations
            </div>
          </div>

          <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.2)', padding: '0 6px' }}>
            <div style={{ fontSize: isMobileFrame ? 18 : 22, fontWeight: 900, color: '#FFFFFF' }}>
              {(user.totalDonations || 0) * 3}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
              Lives Saved
            </div>
          </div>

          <div style={{ padding: '0 6px' }}>
            <div style={{ fontSize: isMobileFrame ? 18 : 22, fontWeight: 900, color: '#FFFFFF' }}>
              {user.points || 0}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
              {level.name} Level
            </div>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT SECTION */}
      <div style={{
        padding: isMobileFrame ? '20px 16px 80px' : '28px 24px 32px',
        flex: 1,
        maxWidth: isMobileFrame ? '100%' : '1100px',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Soft Blush Bio & Clinical Readiness Card (Matching Template Bio Section) */}
        <div className="template-bio-box" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <RecurringTransfusionIcon size={20} color="#C81E32" />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#991B1B', margin: 0 }}>
                  NBTC Clinical Donation Readiness
                </h4>
                <p style={{ fontSize: 12, color: '#7F1D1D', margin: '2px 0 0', fontWeight: 500 }}>
                  National Blood Transfusion Council protocol • 90-day whole blood interval
                </p>
              </div>
            </div>

            <span style={{
              background: '#DCFCE7', color: '#166534',
              fontSize: 11, fontWeight: 800, padding: '4px 10px',
              borderRadius: 9999, border: '1px solid #BBF7D0'
            }}>
              ✓ Clinically Eligible
            </span>
          </div>

          <p style={{ fontSize: 12, color: '#4B5563', margin: '12px 0 0', lineHeight: 1.5 }}>
            You are currently verified for voluntary whole blood and apheresis platelet donations. Your next scheduled cycle interval will be tracked automatically upon hospital confirmation.
          </p>
        </div>

        {/* Actionable Tabs (Matching the Specialty/Appointment header in Template) */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 20,
          scrollbarWidth: 'none',
        }}>
          {[
            { id: 'requests', label: `Urgent Requisitions (${incomingRequests.length})`, icon: <Activity size={14} /> },
            { id: 'appointments', label: `Confirmed (${acceptedRequests.length})`, icon: <Calendar size={14} /> },
            { id: 'history', label: 'Transfusion History', icon: <FileText size={14} /> },
            { id: 'achievements', label: 'Badges & Perks', icon: <Award size={14} /> },
            { id: 'services', label: 'Ecosystem Directory', icon: <HospitalClinicalIcon size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                background: activeTab === tab.id ? '#C81E32' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(200, 30, 50, 0.28)' : '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: URGENT REQUISITIONS (Matching Doctor list with Crimson Pill Buttons in Template) */}
        {activeTab === 'requests' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#172033', margin: 0 }}>
                Matched Patient Emergencies
              </h3>
              <Link to="/requests" style={{ fontSize: 12, fontWeight: 700, color: '#C81E32', textDecoration: 'none' }}>
                View All Needs →
              </Link>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="template-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#FFF1F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12
                }}>
                  <ClinicalMatchIcon size={28} color="#C81E32" />
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#172033', margin: 0 }}>
                  No Pending Patient Requests
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '6px 0 16px' }}>
                  You are active on the Bengaluru emergency matching radar. When hospitals or thalassemia patients need your blood group ({user.bloodGroup}), you will receive an instant SOS dispatch.
                </p>
                <Link to="/find-donors" className="template-pill-btn">
                  <Search size={14} /> Browse Regional Needs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {incomingRequests.map(req => (
                  <div key={req.id} className="template-card" style={{ padding: '16px 18px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12
                    }}>
                      {/* Left: Avatar & Hospital Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 14,
                          background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, border: '1px solid #FFE4E6'
                        }}>
                          <HospitalClinicalIcon size={24} color="#C81E32" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#172033', margin: 0 }}>
                              {req.senderName}
                            </h4>
                            <span style={{
                              background: '#FEE2E2', color: '#991B1B',
                              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999
                            }}>
                              Urgent {req.bloodGroup}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} color="#C81E32" /> {req.hospital}
                          </p>
                          <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                            Required: <strong>{req.units || 1} Unit(s)</strong> • Date: {req.requiredDate || 'Immediate'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Signature Crimson Pill Button (Template Exact) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleAcceptRequest(req)}
                          className="template-pill-btn"
                        >
                          <Check size={14} /> Accept Request
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="template-pill-btn-outline"
                          style={{ padding: '8px 14px' }}
                          title="Decline"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONFIRMED APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#172033', margin: 0 }}>
                Scheduled Donation Appointments
              </h3>
            </div>

            {acceptedRequests.length === 0 ? (
              <div className="template-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <Calendar size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: '#64748B' }}>No scheduled appointments. Accept an emergency requisition to book your slot.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {acceptedRequests.map(req => (
                  <div key={req.id} className="template-card" style={{ padding: '16px 18px', borderLeft: '4px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#172033' }}>{req.hospital}</span>
                          <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999 }}>
                            Confirmed Slot
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
                          Recipient: {req.senderName} • Component: {req.bloodGroup} PRBC
                        </p>
                        <p style={{ fontSize: 11, color: '#059669', margin: '2px 0 0', fontWeight: 600 }}>
                          ⏰ Due on {req.requiredDate || 'Upcoming Schedule'} at 10:30 AM
                        </p>
                      </div>

                      <button
                        onClick={() => setConfirmedModalData({
                          title: 'Appointment Details',
                          subtitle: `Confirmed for ${req.bloodGroup} Whole Blood Donation.`,
                          patientName: req.senderName,
                          hospital: req.hospital,
                          date: req.requiredDate || '2026-11-25',
                          time: '10:30 AM',
                          referenceToken: `BB-SLOT-${req.id.slice(0, 6)}`,
                        })}
                        className="template-pill-btn-outline"
                      >
                        View Pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRANSFUSION HISTORY */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#172033', margin: 0 }}>
                Verified Donation Records
              </h3>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {(user.donationHistory && user.donationHistory.length > 0 ? user.donationHistory : [
                { id: 'dh-1', hospital: 'Manipal Hospital Whitefield', date: '2026-08-14', units: 1, component: 'Whole Blood' },
                { id: 'dh-2', hospital: 'Apollo Hospital Bannerghatta', date: '2026-05-10', units: 1, component: 'Platelets SDP' },
                { id: 'dh-3', hospital: 'Narayana Health HSR Layout', date: '2026-01-22', units: 1, component: 'Whole Blood' },
              ]).map(item => (
                <div key={item.id} className="template-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      🩸
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: '#172033', margin: 0 }}>
                        {item.hospital}
                      </h4>
                      <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>
                        {item.date} • {item.component || 'Whole Blood (350ml)'}
                      </p>
                    </div>
                  </div>

                  <span style={{
                    background: '#DCFCE7', color: '#15803D',
                    fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 9999
                  }}>
                    ✓ Verified Transfusion
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ACHIEVEMENTS & MILESTONES */}
        {activeTab === 'achievements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#172033', margin: 0 }}>
                Donor Milestones & Rewards
              </h3>
              <Link to="/rewards" style={{ fontSize: 12, fontWeight: 700, color: '#C81E32', textDecoration: 'none' }}>
                Redeem Points ({user.points}) →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobileFrame ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {achievements.map(ach => {
                const isEarned = (user.achievements || []).includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className="template-card"
                    style={{
                      padding: 16,
                      textAlign: 'center',
                      background: isEarned ? '#FFFFFF' : '#FAFAFA',
                      opacity: isEarned ? 1 : 0.6,
                      border: isEarned ? '1.5px solid #FECDD3' : '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{ach.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: isEarned ? '#991B1B' : '#64748B' }}>
                      {ach.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                      {ach.description}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: 8,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      background: isEarned ? '#DCFCE7' : '#F1F5F9',
                      color: isEarned ? '#166534' : '#94A3B8',
                    }}>
                      {isEarned ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: ORGANIZED ECOSYSTEM DIRECTORY */}
        {activeTab === 'services' && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#172033', margin: 0 }}>
                Platform Healthcare Services Directory
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
                All BloodBridge clinical modules categorized for instant access
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Category 1: Clinical Network */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#C81E32', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                  1. Clinical & Hospital Network
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: isMobileFrame ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                  {[
                    { to: '/blood-bank', title: 'Blood Bank Cryo-Vault', desc: 'Component storage, TTI clearances & cold storage', icon: <BloodBankVaultIcon size={20} color="#C81E32" /> },
                    { to: '/hospital', title: 'Hospital Emergency Desk', desc: 'Acute blood requisitions & Massive Hemorrhage Protocol', icon: <HospitalClinicalIcon size={20} color="#C81E32" /> },
                    { to: '/surplus-board', title: 'Zero-Wastage Surplus Board', desc: 'Exchange near-expiry units within 48h to prevent discard', icon: <SurplusExchangeIcon size={20} color="#C81E32" /> },
                  ].map((s, i) => (
                    <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
                      <div className="template-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {s.icon}
                        </div>
                        <div>
                          <h4 style={{ fontSize: 13, fontWeight: 800, color: '#172033', margin: 0 }}>{s.title}</h4>
                          <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{s.desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Category 2: Specialized Care */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#C81E32', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                  2. Specialized Patient Lifeline
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: isMobileFrame ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                  {[
                    { to: '/recurring-transfusions', title: 'Thalassemia Patient Circles', desc: 'Pediatric care loops, scheduled cycles & pledge circles', icon: <RecurringTransfusionIcon size={20} color="#C81E32" /> },
                    { to: '/rare-network', title: 'Rare Blood Group SOS', desc: 'Bombay Phenotype (hh) & Rh-Null verified registry', icon: <RarePhenotypeIcon size={20} color="#C81E32" /> },
                    { to: '/volunteers', title: 'Volunteer Courier Network', desc: 'Emergency temperature-controlled bio-box couriers', icon: <VolunteerCourierIcon size={20} color="#C81E32" /> },
                  ].map((s, i) => (
                    <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
                      <div className="template-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {s.icon}
                        </div>
                        <div>
                          <h4 style={{ fontSize: 13, fontWeight: 800, color: '#172033', margin: 0 }}>{s.title}</h4>
                          <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{s.desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Category 3: Community & Support */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#C81E32', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                  3. Community Support & Grievances
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: isMobileFrame ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                  {[
                    { to: '/reviews', title: 'Problems & Review System', desc: 'Report any issue & track resolution with official response', icon: <GrievanceSupportIcon size={20} color="#C81E32" /> },
                    { to: '/find-donors', title: 'AI Smart Donor Match', desc: 'Haversine radial search & ABO/Rh matrix compatibility', icon: <ClinicalMatchIcon size={20} color="#C81E32" /> },
                    { to: '/map', title: 'Live Radar Perimeter Map', desc: 'Visual donor and hospital distribution across Bengaluru', icon: <MapPin size={20} color="#C81E32" /> },
                  ].map((s, i) => (
                    <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
                      <div className="template-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {s.icon}
                        </div>
                        <div>
                          <h4 style={{ fontSize: 13, fontWeight: 800, color: '#172033', margin: 0 }}>{s.title}</h4>
                          <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{s.desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. DOCKED BOTTOM NAVIGATION (Matching Template Screen 3 & 5 Bottom Bar) */}
      <div className="template-bottom-nav" style={{
        position: isMobileFrame ? 'sticky' : 'relative',
        bottom: 0,
        zIndex: 50,
        borderTop: '1px solid #F1F5F9',
        background: '#FFFFFF',
      }}>
        {[
          { label: 'Home', icon: <Heart size={18} />, active: true, to: '/donor-dashboard' },
          { label: 'Search', icon: <Search size={18} />, active: false, to: '/find-donors' },
          { label: 'Requests', icon: <Activity size={18} />, active: false, to: '/requests' },
          { label: 'Rewards', icon: <Award size={18} />, active: false, to: '/rewards' },
          { label: 'Profile', icon: <User size={18} />, active: false, to: '/profile' },
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              gap: 3,
              cursor: 'pointer',
              color: item.active ? '#C81E32' : '#94A3B8',
            }}
          >
            <div style={{
              width: item.active ? 34 : 28,
              height: item.active ? 34 : 28,
              borderRadius: '50%',
              background: item.active ? '#FFF1F2' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.active ? '#C81E32' : '#94A3B8',
              transition: 'all 0.2s',
            }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: item.active ? 800 : 500 }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 48px' }}>
      {/* View Switcher Controls at Top */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '1px', color: '#C81E32', background: '#FFF1F2',
            padding: '3px 10px', borderRadius: 9999, border: '1px solid #FFE4E6'
          }}>
            Medical Design System
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#172033', margin: '4px 0 0' }}>
            Voluntary Donor Hub
          </h1>
        </div>

        {/* Toggle between Desktop Expanded & Mobile App Frame */}
        <div style={{
          display: 'flex',
          background: '#F1F5F9',
          borderRadius: 9999,
          padding: 4,
          border: '1px solid #E2E8F0',
        }}>
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              padding: '6px 16px',
              borderRadius: 9999,
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: viewMode === 'desktop' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'desktop' ? '#C81E32' : '#64748B',
              boxShadow: viewMode === 'desktop' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Monitor size={14} /> Desktop Expanded
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              padding: '6px 16px',
              borderRadius: 9999,
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: viewMode === 'mobile' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'mobile' ? '#C81E32' : '#64748B',
              boxShadow: viewMode === 'mobile' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Smartphone size={14} /> Mobile Mockup Frame
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {viewMode === 'mobile' ? (
        <div style={{ padding: '20px 0 40px' }}>
          {/* Smartphone Frame (Matching exact design of the uploaded mobile screens) */}
          <div className="template-phone-mockup">
            {/* Top Phone Speaker Notch & Status Bar */}
            <div style={{
              background: '#C81E32',
              padding: '8px 16px 4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 700,
            }}>
              <span>09:41 AM</span>
              <div className="template-notch">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569' }} />
                <span style={{ width: 40, height: 4, borderRadius: 2, background: '#475569' }} />
              </div>
              <span>5G • 100%</span>
            </div>

            {/* Mobile App Screen Content */}
            {renderDashboardContent(true)}
          </div>
        </div>
      ) : (
        /* Full Desktop Responsive Layout */
        <div style={{
          background: '#FFFFFF',
          borderRadius: 32,
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          border: '1px solid #F1F5F9',
        }}>
          {renderDashboardContent(false)}
        </div>
      )}

      {/* 4. CONFIRMATION MODAL / ACTION SHEET (Screen 9 in bottom right of Template) */}
      {confirmedModalData && (
        <div className="template-modal-backdrop" onClick={() => setConfirmedModalData(null)}>
          <div className="template-modal-card" onClick={e => e.stopPropagation()}>
            {/* Green Circular Checkmark Icon with White Outline */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#10B981', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              border: '4px solid #ECFDF5',
            }}>
              <Check size={36} color="#FFFFFF" strokeWidth={3} />
            </div>

            <h3 style={{
              fontSize: 22, fontWeight: 900, color: '#172033', margin: '0 0 6px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              {confirmedModalData.title}
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px', lineHeight: 1.5 }}>
              {confirmedModalData.subtitle}
            </p>

            {/* Details Box */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: 18,
              padding: '16px 18px',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Scheduled Date</span>
                <strong style={{ fontSize: 13, color: '#1E293B' }}>{confirmedModalData.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Arrival Time</span>
                <strong style={{ fontSize: 13, color: '#C81E32' }}>{confirmedModalData.time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Clinical Facility</span>
                <strong style={{ fontSize: 13, color: '#1E293B' }}>{confirmedModalData.hospital}</strong>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                paddingTop: 10, borderTop: '1px dashed #CBD5E1'
              }}>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Reference Token</span>
                <code style={{ fontSize: 12, color: '#059669', fontWeight: 800 }}>{confirmedModalData.referenceToken}</code>
              </div>
            </div>

            {/* Full Width Crimson Pill CTA */}
            <button
              onClick={() => {
                setConfirmedModalData(null);
                if (showToast) showToast('Donation appointment registered on calendar!', 'success');
              }}
              className="template-pill-btn"
              style={{ width: '100%', padding: '13px 24px', fontSize: 14 }}
            >
              Done & Add to Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
