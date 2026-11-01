import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, ArrowRight, Droplets, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { mockDonors, BLOOD_GROUPS } from '../data/mockDonors';
import { filterDonors } from '../utils/filters';
import { RADIUS_OPTIONS } from '../utils/distanceCalculator';
import DonorCard from '../components/donors/DonorCard';

const LOCALITIES = ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'Jayanagar', 'Rajajinagar', 'Hebbal', 'Yelahanka', 'Malleshwaram', 'Marathahalli'];
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
  const [filters, setFilters] = useState({ bloodGroup: 'all', locality: 'Koramangala', radius: 10, availableOnly: false });
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    setSearching(true);
    await new Promise(r => setTimeout(r, 600));
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

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#172033', marginBottom: 6 }}>
          Find Blood Donors 🔍
        </h1>
        <p style={{ color: '#64748B', fontSize: 15 }}>
          Search for available blood donors near your location in Bengaluru
        </p>
      </div>

      {/* Emergency Search Panel */}
      <div className="card" style={{ padding: 28, marginBottom: 32, borderLeft: '4px solid #D62839' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D62839', animation: 'pulse-red 2s infinite' }} />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#172033' }}>Emergency Blood Search</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* Blood Group */}
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select
              id="search-blood-group"
              className="form-input form-select"
              value={filters.bloodGroup}
              onChange={e => setFilters(f => ({ ...f, bloodGroup: e.target.value }))}
            >
              <option value="all">All Blood Groups</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Your Location</label>
            <select
              id="search-location"
              className="form-input form-select"
              value={filters.locality}
              onChange={e => setFilters(f => ({ ...f, locality: e.target.value }))}
            >
              {LOCALITIES.map(l => <option key={l} value={l}>{l}, Bengaluru</option>)}
            </select>
          </div>

          {/* Radius */}
          <div className="form-group">
            <label className="form-label">Search Radius</label>
            <select
              id="search-radius"
              className="form-input form-select"
              value={filters.radius}
              onChange={e => setFilters(f => ({ ...f, radius: Number(e.target.value) }))}
            >
              {RADIUS_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Availability */}
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">Availability</label>
            <button
              id="availability-toggle"
              onClick={() => setFilters(f => ({ ...f, availableOnly: !f.availableOnly }))}
              style={{
                padding: '11px 14px', borderRadius: 10,
                border: `1.5px solid ${filters.availableOnly ? '#10B981' : '#e2e8f0'}`,
                background: filters.availableOnly ? '#d1fae5' : 'white',
                cursor: 'pointer', fontSize: 14, fontWeight: 600,
                color: filters.availableOnly ? '#065f46' : '#64748B',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: filters.availableOnly ? '#10B981' : '#94a3b8' }} />
              {filters.availableOnly ? 'Available Only' : 'All Donors'}
            </button>
          </div>
        </div>

        <button
          id="search-donors-btn"
          onClick={handleSearch}
          className="btn btn-primary btn-lg"
          disabled={searching}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {searching ? (
            <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Searching...</>
          ) : (
            <><Search size={20} /> Search Donors</>
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
          <strong>Important:</strong> BloodBridge connects you with voluntary donors. For life-threatening emergencies, contact your nearest blood bank or dial 104 (Karnataka Blood Bank Helpline) immediately. Donor availability and eligibility must be confirmed before donation.
        </p>
      </div>

      {/* Results */}
      {searched && (
        <div className="animate-fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#172033' }}>
                {results.length} Donor{results.length !== 1 ? 's' : ''} Found
              </h2>
              <p style={{ fontSize: 13, color: '#64748B' }}>
                Within {filters.radius} km of {filters.locality}
                {filters.bloodGroup !== 'all' && ` • Blood Group: ${filters.bloodGroup}`}
              </p>
            </div>
            <Link to="/map" className="btn btn-secondary btn-sm">
              <MapPin size={14} /> View on Map
            </Link>
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#172033', marginBottom: 8 }}>No Donors Found</h3>
              <p style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>
                Try expanding your search radius or selecting a different blood group.
              </p>
              <button onClick={() => setFilters(f => ({ ...f, radius: 50, bloodGroup: 'all', availableOnly: false }))} className="btn btn-primary">
                Expand Search
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {results.map(donor => <DonorCard key={donor.id} donor={donor} />)}
            </div>
          )}
        </div>
      )}

      {/* Quick stats when not searched */}
      {!searched && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { icon: '🩸', label: 'Registered Donors', value: mockDonors.length, color: '#D62839' },
            { icon: '✅', label: 'Available Now', value: mockDonors.filter(d => d.available).length, color: '#10B981' },
            { icon: '💎', label: 'Platinum Donors', value: mockDonors.filter(d => d.level === 'Platinum').length, color: '#7C3AED' },
            { icon: '🏙️', label: 'Areas Covered', value: 10, color: '#F59E0B' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: 'Plus Jakarta Sans' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
