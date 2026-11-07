import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Filter, ArrowRight, Droplets, Users, AlertTriangle,
  Smartphone, Monitor, CheckCircle, Heart, Phone, Bell, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { mockDonors, BLOOD_GROUPS } from '../data/mockDonors';
import { filterDonors } from '../utils/filters';
import { RADIUS_OPTIONS } from '../utils/distanceCalculator';
import DonorCard from '../components/donors/DonorCard';
import { BloodBridgeLogoIcon, ClinicalMatchIcon } from '../components/common/CustomIcons';

const LOCALITIES = [
  'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City',
  'Jayanagar', 'Rajajinagar', 'Hebbal', 'Yelahanka', 'Malleshwaram', 'Marathahalli'
];

const LOCALITY_COORDS = {
  'Koramangala': { lat: 12.9352, lng: 77.6245 },
  'Indiranagar': { lat: 12.9784, lng: 77.6408 },
  'Whitefield': { lat: 12.9698, lng: 77.7500 },
  'Electronic City': { lat: 12.8458, lng: 77.6723 },
  'Jayanagar': { lat: 12.9250, lng: 77.5938 },
  'Rajajinagar': { lat: 12.9876, lng: 77.5540 },
  'Hebbal': { lat: 13.0358, lng: 77.5970 },
  'Yelahanka': { lat: 13.1007, lng: 77.5963 },
  'Malleshwaram': { lat: 13.0035, lng: 77.5697 },
  'Marathahalli': { lat: 12.9591, lng: 77.6974 },
};

export default function ReceiverDashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('desktop');
  const [filters, setFilters] = useState({
    bloodGroup: 'all',
    locality: 'Koramangala',
    radius: 10,
    availableOnly: false
  });
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    setSearching(true);
    await new Promise(r => setTimeout(r, 500));
    const loc = LOCALITY_COORDS[filters.locality] || LOCALITY_COORDS['Koramangala'];
    const filtered = filterDonors(mockDonors, {
      bloodGroup: filters.bloodGroup === 'all' ? null : filters.bloodGroup,
      radius: filters.radius,
      availableOnly: filters.availableOnly,
    }, loc);
    setResults(filtered);
    setSearched(true);
    setSearching(false);
  };

  const renderContent = (isMobile = false) => (
    <div style={{ background: '#FAF9F9', minHeight: isMobile ? '760px' : 'auto' }}>
      {/* 1. CRIMSON CURVED HERO HEADER (Screen 5 in Template) */}
      <div className="template-crimson-header" style={{
        padding: isMobile ? '20px 20px 32px' : '36px 32px 48px',
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        boxShadow: '0 12px 30px rgba(200, 30, 50, 0.22)',
      }}>
        {/* Top Branding & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BloodBridgeLogoIcon size={26} color="#FFFFFF" />
            <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
              Dr.Consult <span style={{ opacity: 0.85, fontWeight: 500 }}>| Emergency Radar</span>
            </span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.18)', borderRadius: 9999,
            padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#FFFFFF'
          }}>
            Bengaluru Central
          </div>
        </div>

        <div style={{ textAlign: isMobile ? 'center' : 'left', maxWidth: 650 }}>
          <h2 style={{
            fontSize: isMobile ? 22 : 28,
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 8px',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            Find Blood Donors Rapidly
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.5 }}>
            Direct algorithmic matching with verified voluntary donors within your hospital perimeter.
          </p>
        </div>

        {/* Search Filter Box with Crimson Pill Actions */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 24,
          padding: isMobile ? '18px 16px' : '24px 24px',
          marginTop: 24,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          color: '#172033',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            marginBottom: 16
          }}>
            {/* Blood Group */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Target Blood Group
              </label>
              <select
                className="form-input form-select"
                style={{ borderRadius: 9999, padding: '9px 16px', fontSize: 13 }}
                value={filters.bloodGroup}
                onChange={e => setFilters(f => ({ ...f, bloodGroup: e.target.value }))}
              >
                <option value="all">All Blood Groups</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            {/* Location */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Search Locality
              </label>
              <select
                className="form-input form-select"
                style={{ borderRadius: 9999, padding: '9px 16px', fontSize: 13 }}
                value={filters.locality}
                onChange={e => setFilters(f => ({ ...f, locality: e.target.value }))}
              >
                {LOCALITIES.map(l => <option key={l} value={l}>{l}, Bengaluru</option>)}
              </select>
            </div>

            {/* Radius */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Radar Perimeter
              </label>
              <select
                className="form-input form-select"
                style={{ borderRadius: 9999, padding: '9px 16px', fontSize: 13 }}
                value={filters.radius}
                onChange={e => setFilters(f => ({ ...f, radius: Number(e.target.value) }))}
              >
                {RADIUS_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Status Filter
              </label>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, availableOnly: !f.availableOnly }))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: 9999,
                  border: `1.5px solid ${filters.availableOnly ? '#10B981' : '#E2E8F0'}`,
                  background: filters.availableOnly ? '#DCFCE7' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  color: filters.availableOnly ? '#166534' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: filters.availableOnly ? '#16A34A' : '#94A3B8'
                }} />
                {filters.availableOnly ? 'Available Donors Only' : 'All Donors'}
              </button>
            </div>
          </div>

          {/* Search Button (Crimson Pill) */}
          <button
            onClick={handleSearch}
            className="template-pill-btn"
            style={{ width: '100%', padding: '12px 24px', fontSize: 14 }}
            disabled={searching}
          >
            {searching ? (
              <span>Locating Active Donors...</span>
            ) : (
              <>
                <ClinicalMatchIcon size={18} color="#FFFFFF" /> Find Matching Donors
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div style={{
        padding: isMobile ? '20px 16px 80px' : '28px 24px 32px',
        maxWidth: isMobile ? '100%' : '1100px',
        margin: '0 auto',
      }}>
        {/* Medical Notice */}
        <div className="template-bio-box" style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Shield size={20} color="#C81E32" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>
            <strong>DPDP Privacy & Clinical Safety:</strong> Donor contact numbers are protected with masked dialing tokens. All donor matches comply with NBTC cooldown rules and clinical red-cell compatibility standards.
          </span>
        </div>

        {/* Results */}
        {searched ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#172033', margin: 0 }}>
                  {results.length} Verified Donor{results.length !== 1 ? 's' : ''} in Perimeter
                </h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0' }}>
                  Within {filters.radius} km of {filters.locality}
                </p>
              </div>
              <Link to="/map" className="template-pill-btn-outline" style={{ fontSize: 12 }}>
                <MapPin size={13} /> View Radar Map
              </Link>
            </div>

            {results.length === 0 ? (
              <div className="template-card" style={{ padding: 48, textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#172033', marginBottom: 8 }}>
                  No voluntary donors currently available in this immediate radius.
                </p>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 18 }}>
                  Try expanding the search perimeter to 25 km or triggering an AI Smart Match dispatch.
                </p>
                <button
                  onClick={() => setFilters(f => ({ ...f, radius: 30, bloodGroup: 'all' }))}
                  className="template-pill-btn"
                >
                  Expand Search Perimeter
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
                {results.map(donor => (
                  <DonorCard key={donor.id} donor={donor} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Stats Grid when not searched */
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#172033', marginBottom: 14 }}>
              Active Voluntary Blood Network
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14
            }}>
              {[
                { label: 'Registered Donors', val: mockDonors.length, icon: '🩸', sub: 'Verified NBTC Donors' },
                { label: 'Immediate Availability', val: mockDonors.filter(d => d.available).length, icon: '⚡', sub: 'Ready on Standby' },
                { label: 'Platinum Responders', val: mockDonors.filter(d => d.level === 'Platinum').length, icon: '🏆', sub: '10+ Donations' },
                { label: 'Active Zones', val: 10, icon: '📍', sub: 'Bengaluru Districts' },
              ].map((s, i) => (
                <div key={i} className="template-card" style={{ padding: 18, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#C81E32' }}>{s.val}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Docked Bottom Bar */}
      <div className="template-bottom-nav" style={{ position: isMobile ? 'sticky' : 'relative', bottom: 0 }}>
        {[
          { label: 'Search', icon: <Search size={18} />, active: true, to: '/receiver-dashboard' },
          { label: 'Find Donors', icon: <Users size={18} />, active: false, to: '/find-donors' },
          { label: 'Radar Map', icon: <MapPin size={18} />, active: false, to: '/map' },
          { label: 'Thalassemia', icon: <Heart size={18} />, active: false, to: '/recurring-transfusions' },
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textDecoration: 'none', gap: 3, color: item.active ? '#C81E32' : '#94A3B8'
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: item.active ? '#FFF1F2' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: item.active ? 800 : 500 }}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 48px' }}>
      {/* View Switcher Controls at Top */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, flexWrap: 'wrap', gap: 16
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
            Recipient & Patient Emergency Desk
          </h1>
        </div>

        <div style={{
          display: 'flex', background: '#F1F5F9', borderRadius: 9999,
          padding: 4, border: '1px solid #E2E8F0'
        }}>
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              padding: '6px 16px', borderRadius: 9999, border: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
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
              padding: '6px 16px', borderRadius: 9999, border: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
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

      {viewMode === 'mobile' ? (
        <div style={{ padding: '20px 0 40px' }}>
          <div className="template-phone-mockup">
            <div style={{
              background: '#C81E32', padding: '8px 16px 4px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              color: '#FFFFFF', fontSize: 11, fontWeight: 700
            }}>
              <span>09:41 AM</span>
              <div className="template-notch">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569' }} />
                <span style={{ width: 40, height: 4, borderRadius: 2, background: '#475569' }} />
              </div>
              <span>5G • 100%</span>
            </div>
            {renderContent(true)}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#FFFFFF', borderRadius: 32,
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          overflow: 'hidden', border: '1px solid #F1F5F9'
        }}>
          {renderContent(false)}
        </div>
      )}
    </div>
  );
}
