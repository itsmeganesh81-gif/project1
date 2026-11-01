import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Droplets, Star, CheckCircle, Calendar, ArrowLeft, Send, Heart } from 'lucide-react';
import { mockDonors } from '../data/mockDonors';
import { achievements } from '../data/achievements';
import LevelBadge from '../components/common/LevelBadge';
import BloodGroupBadge from '../components/common/BloodGroupBadge';
import RequestModal from '../components/requests/RequestModal';
import Avatar from '../components/common/Avatar';

export default function DonorProfile() {
  const { id } = useParams();
  const [showRequest, setShowRequest] = useState(false);

  const donor = mockDonors.find(d => d.id === id);

  if (!donor) {
    return (
      <div style={{ maxWidth: 700, margin: '60px auto', padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#172033', marginBottom: 8 }}>Donor Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: 24 }}>This donor profile doesn't exist or may have been removed.</p>
        <Link to="/find-donors" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Donors
        </Link>
      </div>
    );
  }

  const earnedBadges = achievements.filter(a => donor.achievements.includes(a.id));
  const lockedBadges = achievements.filter(a => !donor.achievements.includes(a.id));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
      <Link to="/find-donors" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Donors
      </Link>

      {/* Profile Header */}
      <div className="card" style={{ padding: 32, marginBottom: 24, background: 'linear-gradient(135deg, #fff 0%, #fff5f6 100%)' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={donor.name} initials={donor.initials} avatar={donor.avatar} size={96} />
            {donor.verified && (
              <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'white', borderRadius: '50%', padding: 2 }}>
                <CheckCircle size={22} color="#10B981" fill="#10B981" />
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#172033', margin: 0 }}>{donor.name}</h1>
              <BloodGroupBadge group={donor.bloodGroup} />
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: '#64748B' }}>
                <MapPin size={14} color="#D62839" /> {donor.locality}, Bengaluru
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: '#64748B' }}>
                <Calendar size={14} color="#D62839" /> Donor since {new Date(donor.joinedDate).getFullYear()}
              </div>
            </div>

            <LevelBadge points={donor.points} compact />

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 8,
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: donor.available ? '#d1fae5' : '#f1f5f9',
              color: donor.available ? '#065f46' : '#64748B',
              border: `1px solid ${donor.available ? '#a7f3d0' : '#e2e8f0'}`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: donor.available ? '#10B981' : '#94a3b8' }} />
              {donor.available ? 'Available to Donate' : 'Currently Unavailable'}
            </div>

            {donor.bio && (
              <p style={{ marginTop: 14, fontSize: 14, color: '#64748B', lineHeight: 1.7, maxWidth: 500 }}>{donor.bio}</p>
            )}
          </div>

          {/* Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160 }}>
            <button
              onClick={() => setShowRequest(true)}
              className="btn btn-primary"
              disabled={!donor.available}
              style={{ justifyContent: 'center' }}
            >
              <Send size={16} /> Send Request
            </button>
            {!donor.available && (
              <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>Donor is currently unavailable</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '🩸', label: 'Total Donations', value: donor.totalDonations },
          { icon: '❤️', label: 'Lives Impacted', value: donor.totalDonations * 3 },
          { icon: '⭐', label: 'Points Earned', value: donor.points },
          { icon: donor.verified ? '✅' : '⏳', label: 'Verification', value: donor.verified ? 'Verified' : 'Pending' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#172033', fontFamily: 'Plus Jakarta Sans' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Achievements */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#172033', marginBottom: 16 }}>Achievements</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {earnedBadges.map(badge => (
              <div key={badge.id} title={badge.description} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '12px', borderRadius: 12, background: '#fff5f6',
                border: '1.5px solid rgba(214,40,57,0.2)', minWidth: 70, textAlign: 'center',
              }}>
                <span style={{ fontSize: 24 }}>{badge.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#D62839' }}>{badge.name}</span>
              </div>
            ))}
            {lockedBadges.map(badge => (
              <div key={badge.id} title={badge.description} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '12px', borderRadius: 12, background: '#f8fafc',
                border: '1.5px solid #e2e8f0', minWidth: 70, textAlign: 'center', opacity: 0.4,
                filter: 'grayscale(1)',
              }}>
                <span style={{ fontSize: 24 }}>{badge.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donation History */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#172033', marginBottom: 16 }}>Donation History</h2>
          {donor.donationHistory.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No recorded donations</p>
          ) : (
            donor.donationHistory.map(d => (
              <div key={d.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🩸</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#172033', margin: 0 }}>{d.hospital}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className="status-badge status-completed">Done</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Privacy note */}
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: 14 }}>
        <p style={{ fontSize: 13, color: '#0369a1', lineHeight: 1.7 }}>
          🔒 <strong>Privacy Notice:</strong> Personal contact details (phone, email, home address) are never publicly displayed. To connect with this donor, send a request through BloodBridge. Contact details are only shared after mutual acceptance.
        </p>
      </div>

      {showRequest && (
        <RequestModal donor={donor} onClose={() => setShowRequest(false)} />
      )}
    </div>
  );
}
