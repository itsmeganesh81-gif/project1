import { useState, useEffect } from 'react';
import {
  X, Bell, AlertTriangle, CheckCircle, ExternalLink, Share2,
  Phone, MessageSquare, MapPin, Radio, Shield, Clock, Heart, Check
} from 'lucide-react';
import {
  HospitalClinicalIcon, BloodBankVaultIcon, RarePhenotypeIcon,
  RecurringTransfusionIcon, BloodBridgeLogoIcon
} from './CustomIcons';
import { useLanguage } from '../../context/LanguageContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([
    {
      id: 'alert-mhp-901',
      type: 'massive_hemorrhage',
      title: 'MHP Protocol Activated: O- Universal PRBC Needed',
      hospital: 'Manipal Hospital Whitefield',
      locality: 'Whitefield, Bengaluru',
      blood_group: 'O-',
      units: 4,
      urgency: 'CRITICAL_CODE_RED',
      distance_km: 3.8,
      patient_token: 'MRN-TRAUMA-911',
      timeAgo: 'Just now',
      whatsapp_text: '🚨 CRITICAL BLOOD SOS: O- needed at Manipal Hospital Whitefield for trauma surgery. Tap to accept: https://bloodbridge.in/sos/mhp-901'
    },
    {
      id: 'alert-rare-702',
      type: 'rare_phenotype',
      title: 'Rare Bombay Phenotype (hh) Urgent SOS',
      hospital: 'Victoria Hospital Regional Blood Centre',
      locality: 'K.R. Road, Bengaluru',
      blood_group: 'Bombay (hh)',
      units: 1,
      urgency: 'EXTREMELY_RARE',
      distance_km: 6.2,
      patient_token: 'TOKEN-BOMBAY-042',
      timeAgo: '12m ago',
      whatsapp_text: '🚨 RARE BLOOD SOS: Bombay hh phenotype needed at Victoria Hospital. Tap to respond: https://bloodbridge.in/sos/rare-702'
    },
    {
      id: 'alert-thal-403',
      type: 'thalassemia_cycle',
      title: 'Thalassemia Cycle Pledge Needed: B+ PRBC',
      hospital: 'Narayana Health, HSR Layout',
      locality: 'HSR Layout, Bengaluru',
      blood_group: 'B+',
      units: 1,
      urgency: 'SCHEDULED_LIFELINE',
      distance_km: 4.5,
      patient_token: 'PEDIATRIC-THAL-09',
      timeAgo: '45m ago',
      whatsapp_text: '🩸 Thalassemia Support Circle: 11yo patient needs B+ PRBC cycle transfusion at Narayana Health. Tap to pledge: https://bloodbridge.in/sos/thal-403'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [acceptedAlerts, setAcceptedAlerts] = useState({});
  const [whatsAppModalData, setWhatsAppModalData] = useState(null);

  // WebSocket Live Listener (Connects to /api/broadcast/ws/emergency when available)
  useEffect(() => {
    let socket;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}/api/broadcast/ws/emergency`);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_EMERGENCY_SOS' && data.alert) {
            setAlerts((prev) => [data.alert, ...prev]);
          }
        } catch (e) {
          // Fallback ignore
        }
      };
    } catch (err) {
      // Offline fallback
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'critical') return a.urgency.includes('CRITICAL');
    if (activeFilter === 'rare') return a.type === 'rare_phenotype';
    if (activeFilter === 'thalassemia') return a.type === 'thalassemia_cycle';
    return true;
  });

  const handleAcceptAlert = (alertId) => {
    setAcceptedAlerts(prev => ({ ...prev, [alertId]: true }));
  };

  const handleOpenWhatsAppShare = (alert) => {
    const encoded = encodeURIComponent(alert.whatsapp_text);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    setWhatsAppModalData({
      alert,
      waUrl,
      text: alert.whatsapp_text,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2500,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      {/* Slide-out Drawer Panel */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#FFFFFF',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.25)',
        animation: 'slideIn 0.3s ease-out',
        position: 'relative',
      }}>
        {/* Drawer Header (Crimson Gradient) */}
        <div className="template-crimson-header" style={{
          padding: '24px 20px 20px',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          boxShadow: '0 6px 20px rgba(200, 30, 50, 0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Radio size={20} color="#FFFFFF" className="animate-pulse" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#FFFFFF', margin: 0, fontFamily: 'Plus Jakarta Sans' }}>
                  {t('drawerTitle')}
                </h3>
                <span style={{ fontSize: 11, color: '#FECDD3', fontWeight: 600 }}>
                  {t('drawerSubtitle')}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)', border: 'none', color: '#FFFFFF',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Radar Status Pill */}
          <div style={{
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(8px)',
            borderRadius: 9999,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            fontWeight: 700,
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
              {t('tickerLiveAlertActive')}
            </span>
            <span>{alerts.length} Active</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '14px 18px 8px',
          overflowX: 'auto',
          borderBottom: '1px solid #F1F5F9',
        }}>
          {[
            { id: 'all', label: `${t('tabAll')} (${alerts.length})` },
            { id: 'critical', label: t('tabCritical') },
            { id: 'rare', label: t('tabRare') },
            { id: 'thalassemia', label: t('tabThalassemia') },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: activeFilter === tab.id ? '#C81E32' : '#F1F5F9',
                color: activeFilter === tab.id ? '#FFFFFF' : '#64748B',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: '#94A3B8' }}>
              <CheckCircle size={40} color="#10B981" style={{ marginBottom: 10 }} />
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#172033', margin: 0 }}>All Clear on Radar</h4>
              <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                No active emergencies in this category right now.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isAccepted = acceptedAlerts[alert.id];
              const isMhp = alert.urgency.includes('CRITICAL');

              return (
                <div
                  key={alert.id}
                  className="template-card"
                  style={{
                    padding: 16,
                    border: isMhp ? '1.5px solid #FECACA' : '1px solid #F1F5F9',
                    background: isMhp ? '#FFF5F5' : '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        background: isMhp ? '#DC2626' : '#2563EB',
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        letterSpacing: '0.4px',
                      }}>
                        {alert.urgency}
                      </span>
                      <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                        {alert.timeAgo}
                      </span>
                    </div>

                    <span style={{
                      background: '#FFF1F2',
                      color: '#C81E32',
                      fontSize: 12,
                      fontWeight: 900,
                      padding: '2px 10px',
                      borderRadius: 9999,
                      border: '1px solid #FECDD3',
                    }}>
                      🩸 {alert.blood_group} ({alert.units} U)
                    </span>
                  </div>

                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#172033', margin: '4px 0 6px', lineHeight: 1.4 }}>
                    {alert.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                    <MapPin size={13} color="#C81E32" />
                    <span><strong>{alert.hospital}</strong> ({alert.distance_km} km away)</span>
                  </div>

                  {/* Action Buttons: 1-Click Accept & WhatsApp Share */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                    {isAccepted ? (
                      <div style={{
                        flex: 1, padding: '8px 12px', background: '#DCFCE7', color: '#166534',
                        borderRadius: 9999, fontSize: 12, fontWeight: 800, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: 6
                      }}>
                        <Check size={14} /> {t('btnAccepted')}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcceptAlert(alert.id)}
                        className="template-pill-btn"
                        style={{ flex: 1, padding: '8px 14px', fontSize: 12 }}
                      >
                        <Heart size={13} /> {t('btnAcceptSOS')}
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenWhatsAppShare(alert)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 9999,
                        border: '1px solid #25D366',
                        background: '#F0FDF4',
                        color: '#15803D',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                      title="Share to WhatsApp Donor Network"
                    >
                      <Share2 size={13} color="#25D366" /> {t('btnWhatsAppDispatch')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '12px 18px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          fontSize: 11,
          color: '#64748B',
          textAlign: 'center',
        }}>
          DPDP 2023 Compliant • Emergency broadcasts dispatched securely across authorized facilities
        </div>
      </div>

      {/* WhatsApp Dispatch Mobile Preview Modal */}
      {whatsAppModalData && (
        <div
          onClick={() => setWhatsAppModalData(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              maxWidth: 420,
              width: '100%',
              padding: 24,
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Share2 size={16} color="white" />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 900, color: '#172033', margin: 0 }}>
                    WhatsApp Broadcast Dispatch
                  </h4>
                  <span style={{ fontSize: 11, color: '#64748B' }}>Indian Healthcare Message Format</span>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Bubble Preview */}
            <div style={{
              background: '#DCF8C6',
              borderRadius: 14,
              padding: '14px 16px',
              fontSize: 13,
              color: '#111827',
              lineHeight: 1.6,
              marginBottom: 18,
              border: '1px solid #C4EAA2',
              whiteSpace: 'pre-wrap',
              fontFamily: 'Inter, sans-serif',
            }}>
              {whatsAppModalData.text}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href={whatsAppModalData.waUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: 'white',
                  borderRadius: 9999,
                  padding: '11px 18px',
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                }}
              >
                <ExternalLink size={15} /> {t('btnOpenWhatsApp')}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(whatsAppModalData.text);
                  alert('Emergency SOS message copied to clipboard!');
                }}
                className="template-pill-btn-outline"
                style={{ padding: '10px 16px', fontSize: 12 }}
              >
                {t('btnCopyMessage')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

