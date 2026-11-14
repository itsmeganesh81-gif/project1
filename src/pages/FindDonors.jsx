import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SortAsc, Map, List, X } from 'lucide-react';
import { ClinicalMatchIcon } from '../components/common/CustomIcons';
import { mockDonors, BLOOD_GROUPS, BANGALORE_LOCALITIES } from '../data/mockDonors';
import { filterDonors, sortDonors } from '../utils/filters';
import { RADIUS_OPTIONS } from '../utils/distanceCalculator';
import DonorCard from '../components/donors/DonorCard';
import SmartDonorMatcher from '../components/matching/SmartDonorMatcher';
import { useLanguage } from '../context/LanguageContext';

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

export default function FindDonors() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    bloodGroup: searchParams.get('blood') || 'all',
    locality: 'Koramangala',
    radius: 50,
    availableOnly: false,
    sortBy: 'distance',
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState('smart'); // 'smart' | 'standard'

  const loc = LOCALITY_COORDS[filters.locality] || LOCALITY_COORDS['Koramangala'];
  let donors = filterDonors(mockDonors, {
    bloodGroup: filters.bloodGroup === 'all' ? null : filters.bloodGroup,
    radius: filters.radius,
    availableOnly: filters.availableOnly,
  }, loc);

  if (search.trim()) {
    const q = search.toLowerCase();
    donors = donors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.locality.toLowerCase().includes(q) ||
      d.bloodGroup.toLowerCase().includes(q)
    );
  }

  donors = sortDonors(donors, filters.sortBy);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#172033', marginBottom: 6 }}>
            {t('findDonorsTitle')}
          </h1>
          <p style={{ color: '#64748B', fontSize: 15 }}>
            {t('findDonorsSubtitle')}
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, gap: 4 }}>
          <button
            onClick={() => setSearchMode('smart')}
            style={{
              padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              background: searchMode === 'smart' ? 'white' : 'transparent',
              color: searchMode === 'smart' ? '#7C3AED' : '#64748B',
              boxShadow: searchMode === 'smart' ? '0 2px 6px rgba(124,58,237,0.15)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <ClinicalMatchIcon size={16} color={searchMode === 'smart' ? '#7C3AED' : '#64748B'} />
            {t('modeClinicalMatcher')}
          </button>
          <button
            onClick={() => setSearchMode('standard')}
            style={{
              padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              background: searchMode === 'standard' ? 'white' : 'transparent',
              color: searchMode === 'standard' ? '#D62839' : '#64748B',
              boxShadow: searchMode === 'standard' ? '0 2px 6px rgba(214,40,57,0.15)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <List size={16} />
            {t('modeDirectorySearch')}
          </button>
        </div>
      </div>

      {/* Render AI Smart Matcher */}
      {searchMode === 'smart' ? (
        <SmartDonorMatcher
          initialBloodGroup={filters.bloodGroup === 'all' ? 'O+' : filters.bloodGroup}
          initialLocality={filters.locality}
        />
      ) : (
        <>
          {/* Search & Filters */}
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* Search bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="donor-search-input"
                  className="form-input"
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 38, paddingRight: search ? 36 : 14 }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Blood Group Quick filter */}
              <select
                className="form-input form-select"
                style={{ width: 'auto', minWidth: 150 }}
                value={filters.bloodGroup}
                onChange={e => setFilters(f => ({ ...f, bloodGroup: e.target.value }))}
              >
                <option value="all">{t('allBloodGroups')}</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>

              {/* Sort */}
              <select
                className="form-input form-select"
                style={{ width: 'auto', minWidth: 150 }}
                value={filters.sortBy}
                onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
              >
                <option value="distance">{t('sortByDistance')}</option>
                <option value="donations">{t('sortByDonations')}</option>
                <option value="points">{t('sortByPoints')}</option>
                <option value="name">{t('sortByName')}</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                <Filter size={16} /> {t('filtersBtn')}
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <div className="form-group">
                  <label className="form-label">{t('filterLocation')}</label>
                  <select className="form-input form-select" value={filters.locality} onChange={e => setFilters(f => ({ ...f, locality: e.target.value }))}>
                    {Object.keys(LOCALITY_COORDS).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('filterMaxRadius')}</label>
                  <select className="form-input form-select" value={filters.radius} onChange={e => setFilters(f => ({ ...f, radius: Number(e.target.value) }))}>
                    {RADIUS_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('filterAvailability')}</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10 }}>
                    <input type="checkbox" checked={filters.availableOnly} onChange={e => setFilters(f => ({ ...f, availableOnly: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#D62839' }} />
                    <span style={{ fontSize: 14, color: '#172033', fontWeight: 500 }}>{t('filterAvailableOnly')}</span>
                  </label>
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <label className="form-label">&nbsp;</label>
                  <button onClick={() => setFilters({ bloodGroup: 'all', locality: 'Koramangala', radius: 50, availableOnly: false, sortBy: 'distance' })} className="btn btn-ghost" style={{ height: 42 }}>
                    {t('resetFilters')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Blood Group pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {['all', ...BLOOD_GROUPS].map(bg => (
              <button
                key={bg}
                onClick={() => setFilters(f => ({ ...f, bloodGroup: bg }))}
                style={{
                  padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${filters.bloodGroup === bg ? '#D62839' : '#e2e8f0'}`,
                  background: filters.bloodGroup === bg ? '#D62839' : 'white',
                  color: filters.bloodGroup === bg ? 'white' : '#64748B',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {bg === 'all' ? t('allBloodGroups') : bg}
              </button>
            ))}
          </div>

          {/* Results header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>
              <strong style={{ color: '#172033' }}>{donors.length}</strong> {t('donorsFound')}
              {filters.bloodGroup !== 'all' && ` • ${filters.bloodGroup}`}
              {filters.availableOnly && ` • ${t('filterAvailableOnly')}`}
            </p>
          </div>

          {/* Grid */}
          {donors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#172033', marginBottom: 8 }}>{t('noDonorsMatch')}</h3>
              <p style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>{t('tryAdjustingFilters')}</p>
              <button onClick={() => { setFilters({ bloodGroup: 'all', locality: 'Koramangala', radius: 50, availableOnly: false, sortBy: 'distance' }); setSearch(''); }} className="btn btn-primary">
                {t('clearAllFilters')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {donors.map(donor => <DonorCard key={donor.id} donor={donor} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
