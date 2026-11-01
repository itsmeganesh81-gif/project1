import { Link } from 'react-router-dom';
import { Droplets, Heart, Mail, Phone } from 'lucide-react';

export default function Footer() {
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
                <Droplets size={20} color="white" fill="white" />
              </div>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, color: 'white' }}>
                Blood<span style={{ color: '#D62839' }}>Bridge</span>
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
              Connecting voluntary blood donors with those in need. Every donation matters, every life counts.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <span style={{ background: '#D62839', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                🚀 MVP Demo
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Quick Links</h4>
            {[
              { to: '/find-donors', label: 'Find Donors' },
              { to: '/map', label: 'Donor Map' },
              { to: '/leaderboard', label: 'Leaderboard' },
              { to: '/rewards', label: 'Rewards' },
              { to: '/requests', label: 'Requests' },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{ display: 'block', color: '#94a3b8', fontSize: 13, textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#D62839'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Info */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Information</h4>
            {[
              'About BloodBridge',
              'How It Works',
              'Blood Group Compatibility',
              'Donation Eligibility',
              'Privacy Policy',
            ].map(item => (
              <p key={item} style={{ fontSize: 13, marginBottom: 8, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#D62839'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}
              >
                {item}
              </p>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Mail size={14} color="#D62839" /> support@bloodbridge.in
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Phone size={14} color="#D62839" /> 1800-BLOOD-BB (Demo)
              </div>
            </div>
            <div style={{ marginTop: 20, padding: 14, background: 'rgba(214,40,57,0.1)', borderRadius: 10, border: '1px solid rgba(214,40,57,0.2)' }}>
              <p style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.6 }}>
                ⚠️ This is a frontend prototype. All data is simulated for demonstration purposes. Consult a qualified blood bank for medical needs.
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12 }}>© 2024 BloodBridge. Built with <Heart size={12} color="#D62839" style={{ display: 'inline' }} /> for humanity.</p>
          <p style={{ fontSize: 12 }}>Frontend Prototype — No real data is stored.</p>
        </div>
      </div>
    </footer>
  );
}
