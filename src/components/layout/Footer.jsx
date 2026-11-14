import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, ShieldCheck } from 'lucide-react';
import { BloodBridgeLogoIcon, GrievanceSupportIcon } from '../common/CustomIcons';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{ background: '#172033', color: '#94a3b8', padding: '48px 20px 24px', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #D62839, #8D1B2A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BloodBridgeLogoIcon size={24} color="white" />
              </div>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, color: 'white' }}>
                Blood<span style={{ color: '#D62839' }}>Bridge</span>
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
              {t('footerTagline')}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <span style={{ background: '#059669', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} /> {t('footerCompliance')}
              </span>
            </div>
          </div>

          {/* Clinical & Community Network */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{t('footerClinicalHeader')}</h4>
            {[
              { to: '/find-donors', label: t('navFindDonors') },
              { to: '/recurring-transfusions', label: t('linkRecurring') },
              { to: '/rare-network', label: t('linkRare') },
              { to: '/surplus-board', label: t('linkSurplus') },
              { to: '/volunteers', label: t('linkVolunteer') },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{ display: 'block', color: '#94a3b8', fontSize: 13, textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#D62839'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Support & Grievances */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{t('footerSupportHeader')}</h4>
            {[
              { to: '/reviews', label: t('navSupportReviews') },
              { to: '/blood-bank', label: t('linkBloodBank') },
              { to: '/hospital', label: t('linkHospital') },
              { to: '/rewards', label: t('navRewards') },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{ display: 'block', color: '#94a3b8', fontSize: 13, textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#D62839'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Grievance Officer & Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Mail size={14} color="#D62839" /> grievance@bloodbridge.in
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Phone size={14} color="#D62839" /> 1800-BLOOD-BB (National Helpline)
              </div>
            </div>
            <div style={{ marginTop: 20, padding: 14, background: 'rgba(214,40,57,0.1)', borderRadius: 10, border: '1px solid rgba(214,40,57,0.2)' }}>
              <p style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.6 }}>
                NBTC clinical guidelines enforced. Eligibility requires verification by a qualified medical professional.
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12 }}>© 2026 BloodBridge India. Built with <Heart size={12} color="#D62839" style={{ display: 'inline' }} /> for humanity.</p>
          <p style={{ fontSize: 12 }}>{t('footerRights')}</p>
        </div>
      </div>
    </footer>
  );
}
