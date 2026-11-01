import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Droplets, Star, CheckCircle, Clock, Send, Eye } from 'lucide-react';
import Avatar from '../common/Avatar';
import BloodGroupBadge from '../common/BloodGroupBadge';
import LevelBadge from '../common/LevelBadge';
import { formatDistance } from '../../utils/distanceCalculator';
import RequestModal from '../requests/RequestModal';

export default function DonorCard({ donor, showDistance = true }) {
  const [showRequest, setShowRequest] = useState(false);

  return (
    <>
      <div className="donor-card animate-fadeIn">
        {/* Header */}
        <div style={{ padding: '18px 18px 14px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar name={donor.name} initials={donor.initials} avatar={donor.avatar} size={52} />
            {donor.verified && (
              <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'white', borderRadius: '50%', padding: 1 }}>
                <CheckCircle size={16} color="#10B981" fill="#10B981" />
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#172033', margin: 0 }}>{donor.name}</h3>
              <LevelBadge points={donor.points} compact />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <MapPin size={12} color="#64748B" />
              <span style={{ fontSize: 12, color: '#64748B' }}>{donor.locality}, Bengaluru</span>
            </div>
            {showDistance && donor.distance != null && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4,
                fontSize: 11, fontWeight: 600, color: '#D62839',
                background: '#fff0f1', padding: '2px 8px', borderRadius: 6,
              }}>
                📍 {formatDistance(donor.distance)} away
              </span>
            )}
          </div>
          <BloodGroupBadge group={donor.bloodGroup} />
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
        }}>
          {[
            { label: 'Donations', value: donor.totalDonations, icon: '🩸' },
            { label: 'Points', value: `${donor.points}`, icon: '⭐' },
            { label: 'Status', value: donor.available ? 'Available' : 'Unavailable', icon: donor.available ? '✅' : '⏸️' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '10px 8px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
            }}>
              <div style={{ fontSize: 16 }}>{stat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#172033', lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Availability indicator */}
        <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: donor.available ? '#10B981' : '#94a3b8',
              boxShadow: donor.available ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
            }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: donor.available ? '#10B981' : '#94a3b8' }}>
              {donor.available ? 'Available to donate' : 'Currently unavailable'}
            </span>
          </div>
          {!donor.verified && (
            <span style={{ fontSize: 10, color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
              Unverified
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '0 18px 16px', display: 'flex', gap: 8 }}>
          <Link to={`/donor/${donor.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            <Eye size={14} /> View Profile
          </Link>
          <button
            onClick={() => setShowRequest(true)}
            className={`btn btn-sm ${donor.available ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={!donor.available}
          >
            <Send size={14} /> Send Request
          </button>
        </div>
      </div>

      {showRequest && (
        <RequestModal donor={donor} onClose={() => setShowRequest(false)} />
      )}
    </>
  );
}
