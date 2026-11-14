import { useState, useEffect } from 'react';
import { AlertOctagon, Heart, Share2, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function EmergencyBroadcastBanner({ onOpenDrawer }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);

  // Active top critical alert
  const topAlert = {
    id: 'alert-mhp-901',
    hospital: 'Manipal Hospital Whitefield',
    blood_group: 'O-',
    units: 2,
    urgency: 'CRITICAL MHP',
    distance_km: 3.8,
  };

  if (!visible) return null;

  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 2000,
          background: 'linear-gradient(135deg, #DC2626, #991B1B)',
          color: 'white',
          borderRadius: 9999,
          padding: '10px 18px',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'pulse-red 2s infinite',
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FDE047' }} />
        <span style={{ fontSize: 13, fontWeight: 900 }}>🚨 {t('tickerLiveAlertActive')} (O-)</span>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      width: 'calc(100% - 32px)',
      maxWidth: 680,
      background: 'rgba(15, 23, 42, 0.94)',
      backdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(239, 68, 68, 0.5)',
      borderRadius: 24,
      padding: '14px 20px',
      boxShadow: '0 20px 45px rgba(220, 38, 38, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      animation: 'slideIn 0.3s ease-out',
    }}>
      {/* Left: Pulsing Icon & Urgency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(239,68,68,0.6)',
          flexShrink: 0,
        }}>
          <AlertOctagon size={24} color="#FFFFFF" className="animate-pulse" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: '#DC2626',
              color: 'white',
              fontSize: 10,
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: 9999,
              letterSpacing: '0.5px',
            }}>
              {t('tickerCodeRed')}
            </span>
            <span style={{ color: '#FCA5A5', fontSize: 12, fontWeight: 700 }}>
              {topAlert.blood_group} ({topAlert.units} {t('tickerUnitsNeeded')})
            </span>
          </div>

          <p style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 800, margin: '2px 0 0' }}>
            {topAlert.hospital} • <span style={{ color: '#94A3B8', fontWeight: 500 }}>{topAlert.distance_km} km {t('tickerAway')}</span>
          </p>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onOpenDrawer}
          className="template-pill-btn"
          style={{ padding: '8px 18px', fontSize: 12 }}
        >
          <Heart size={14} /> {t('tickerRespondBtn')}
        </button>

        <button
          onClick={() => setMinimized(true)}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94A3B8',
          }}
          title="Minimize"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

