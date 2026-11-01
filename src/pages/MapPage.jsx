import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Filter, List } from 'lucide-react';
import { mockDonors, BLOOD_GROUPS, BENGALURU_CENTER } from '../data/mockDonors';
import { filterDonors } from '../utils/filters';
import { formatDistance } from '../utils/distanceCalculator';
import BloodGroupBadge from '../components/common/BloodGroupBadge';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createDonorIcon = (available) => L.divIcon({
  className: '',
  html: `<div style="
    width: 36px; height: 36px; border-radius: 50%;
    background: ${available ? 'linear-gradient(135deg, #D62839, #8D1B2A)' : 'linear-gradient(135deg, #94a3b8, #64748B)'};
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    border: 3px solid white;
    font-size: 16px;
    cursor: pointer;
  ">🩸</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 20px; height: 20px; border-radius: 50%;
    background: #3B82F6; border: 3px solid white;
    box-shadow: 0 0 0 6px rgba(59,130,246,0.2);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const LOCALITY_COORDS = {
  'Koramangala': { lat: 12.9352, lng: 77.6245 },
  'Indiranagar': { lat: 12.9784, lng: 77.6408 },
  'Whitefield': { lat: 12.9698, lng: 77.7500 },
  'Electronic City': { lat: 12.8458, lng: 77.6723 },
  'Jayanagar': { lat: 12.9250, lng: 77.5938 },
};

export default function MapPage() {
  const [filters, setFilters] = useState({ bloodGroup: 'all', availableOnly: false, radius: 10, locality: 'Koramangala' });
  const [view, setView] = useState('map');

  const userLoc = LOCALITY_COORDS[filters.locality] || BENGALURU_CENTER;
  const donors = filterDonors(mockDonors, {
    bloodGroup: filters.bloodGroup === 'all' ? null : filters.bloodGroup,
    radius: filters.radius,
    availableOnly: filters.availableOnly,
  }, userLoc);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', color: '#172033', marginBottom: 4 }}>Donor Map 🗺️</h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>{donors.length} donors within {filters.radius} km of {filters.locality}</p>
        </div>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
          {[{ id: 'map', icon: <MapPin size={15} />, label: 'Map' }, { id: 'list', icon: <List size={15} />, label: 'List' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: view === v.id ? 'white' : 'transparent',
              color: view === v.id ? '#D62839' : '#64748B',
              boxShadow: view === v.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>
              {v.icon}{v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-input form-select" style={{ width: 'auto', flex: 1, minWidth: 130 }} value={filters.bloodGroup} onChange={e => setFilters(f => ({ ...f, bloodGroup: e.target.value }))}>
          <option value="all">All Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>
        <select className="form-input form-select" style={{ width: 'auto', flex: 1, minWidth: 160 }} value={filters.locality} onChange={e => setFilters(f => ({ ...f, locality: e.target.value }))}>
          {Object.keys(LOCALITY_COORDS).map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="form-input form-select" style={{ width: 'auto', flex: 1, minWidth: 120 }} value={filters.radius} onChange={e => setFilters(f => ({ ...f, radius: Number(e.target.value) }))}>
          {[2, 5, 10, 20, 50].map(r => <option key={r} value={r}>{r} km</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#172033', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={filters.availableOnly} onChange={e => setFilters(f => ({ ...f, availableOnly: e.target.checked }))} style={{ accentColor: '#D62839', width: 15, height: 15 }} />
          Available Only
        </label>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { color: '#D62839', label: 'Available Donor' },
          { color: '#94a3b8', label: 'Unavailable Donor' },
          { color: '#3B82F6', label: 'Your Location' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      {view === 'map' ? (
        <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <MapContainer
            center={[userLoc.lat, userLoc.lng]}
            zoom={12}
            style={{ height: '60vh', width: '100%' }}
            key={`${userLoc.lat}-${userLoc.lng}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location */}
            <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
              <Popup>
                <div style={{ padding: 8 }}>
                  <strong>📍 Your Location</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B' }}>{filters.locality}, Bengaluru</p>
                </div>
              </Popup>
            </Marker>

            {/* Radius circle */}
            <Circle
              center={[userLoc.lat, userLoc.lng]}
              radius={filters.radius * 1000}
              pathOptions={{ color: '#D62839', fillColor: '#D62839', fillOpacity: 0.04, weight: 1.5, dashArray: '6 4' }}
            />

            {/* Donor markers */}
            {donors.map(donor => (
              <Marker key={donor.id} position={[donor.lat, donor.lng]} icon={createDonorIcon(donor.available)}>
                <Popup>
                  <div style={{ padding: '12px', minWidth: 200, fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #fff0f1, #fee2e2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, color: '#D62839', fontSize: 14,
                      }}>{donor.initials}</div>
                      <div>
                        <strong style={{ fontSize: 14, display: 'block', color: '#172033' }}>{donor.name}</strong>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{donor.locality}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ background: 'linear-gradient(135deg, #D62839, #8D1B2A)', color: 'white', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>{donor.bloodGroup}</span>
                      <span style={{ background: donor.available ? '#d1fae5' : '#f1f5f9', color: donor.available ? '#065f46' : '#64748B', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
                        {donor.available ? '✓ Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                      🩸 {donor.totalDonations} donations · ⭐ {donor.points} pts · 📍 {formatDistance(donor.distance)}
                    </div>
                    <Link to={`/donor/${donor.id}`} style={{
                      display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #D62839, #8D1B2A)',
                      color: 'white', padding: '8px', borderRadius: 8, textDecoration: 'none',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      View Profile
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        // List view
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {donors.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60 }}>
              <p style={{ color: '#94a3b8' }}>No donors found. Try adjusting filters.</p>
            </div>
          ) : donors.map(donor => (
            <div key={donor.id} className="card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #fff0f1, #fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#D62839', flexShrink: 0 }}>{donor.initials}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#172033', margin: 0 }}>{donor.name}</p>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{donor.locality} · {formatDistance(donor.distance)}</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span style={{ background: 'linear-gradient(135deg, #D62839, #8D1B2A)', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 20 }}>{donor.bloodGroup}</span>
                  <span style={{ background: donor.available ? '#d1fae5' : '#f1f5f9', color: donor.available ? '#065f46' : '#64748B', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20 }}>{donor.available ? 'Available' : 'Busy'}</span>
                </div>
              </div>
              <Link to={`/donor/${donor.id}`} className="btn btn-secondary btn-sm">View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
