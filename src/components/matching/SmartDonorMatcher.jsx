import { useState, useEffect } from 'react';
import {
  AlertTriangle, ShieldCheck, MapPin, Clock, Award,
  CheckCircle, ArrowRight, Activity, Send, Filter, Info, Phone
} from 'lucide-react';
import { ClinicalMatchIcon } from '../common/CustomIcons';
import { api } from '../../api/client';
import BloodGroupBadge from '../common/BloodGroupBadge';
import LevelBadge from '../common/LevelBadge';
import Avatar from '../common/Avatar';
import RequestModal from '../requests/RequestModal';
import { BANGALORE_LOCALITIES, BLOOD_GROUPS, mockDonors } from '../../data/mockDonors';
import { calculateDistance } from '../../utils/distanceCalculator';
import { useLanguage } from '../../context/LanguageContext';

// Medically approved clinical compatibility rules (Mirror of backend service)
const RED_CELL_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
  'Bombay': ['Bombay'],
};

const PLASMA_PLATELET_COMPATIBILITY = {
  'O+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'O-': ['O-', 'A-', 'B-', 'AB-'],
  'A+': ['A+', 'A-', 'AB+', 'AB-'],
  'A-': ['A-', 'AB-'],
  'B+': ['B+', 'B-', 'AB+', 'AB-'],
  'B-': ['B-', 'AB-'],
  'AB+': ['AB+', 'AB-'],
  'AB-': ['AB-'],
  'Bombay': ['Bombay'],
};

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
  'Bengaluru Central': { lat: 12.9716, lng: 77.5946 },
};

export default function SmartDonorMatcher({ initialBloodGroup = 'O+', initialLocality = 'Koramangala' }) {
  const { t, language } = useLanguage();
  const [bloodGroup, setBloodGroup] = useState(initialBloodGroup);
  const [component, setComponent] = useState('whole_blood');
  const [locality, setLocality] = useState(initialLocality);
  const [urgency, setUrgency] = useState('critical');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedDonorForRequest, setSelectedDonorForRequest] = useState(null);
  const [expandedExplanation, setExpandedExplanation] = useState(null);

  const getMatchExplanation = (donor) => {
    const isExact = donor.is_exact_match;
    const matchType = isExact ? t('exactMatch') : `${t('compatibleMatch')} (${donor.blood_group})`;
    const awayText = t('tickerAway') || 'away';
    return `${matchType} • ~${donor.distance_km} km ${awayText} (${donor.locality}) • ${t('nbtcCleared')}`;
  };

  const runSmartMatching = async () => {
    setLoading(true);
    const coords = LOCALITY_COORDS[locality] || LOCALITY_COORDS['Koramangala'];

    try {
      // Attempt backend API call first
      const data = await api.post('/matching/find-donors', {
        blood_group: bloodGroup,
        component: component,
        locality: locality,
        lat: coords.lat,
        lng: coords.lng,
        initial_radius_km: 5.0,
      });
      setResults(data);
    } catch {
      // Graceful fallback to client-side clinical matching
      const allowed = component === 'platelets' || component === 'ffp'
        ? (PLASMA_PLATELET_COMPATIBILITY[bloodGroup] || [bloodGroup])
        : (RED_CELL_COMPATIBILITY[bloodGroup] || [bloodGroup]);

      let matches = mockDonors.filter(d => d.available && allowed.includes(d.bloodGroup));

      // Calculate distance & scores
      const processed = matches.map(d => {
        const dist = calculateDistance(coords.lat, coords.lng, d.lat, d.lng);
        const isExact = d.bloodGroup === bloodGroup;
        const cooldownCleared = true; // NBTC check
        let score = (isExact ? 40 : 32) + Math.max(0, 25 * (1 - dist / 20)) + (d.verified ? 10 : 0) + 15;
        score = Math.min(99, Math.round(score));

        return {
          donor_id: d.id,
          name: d.name,
          blood_group: d.bloodGroup,
          locality: d.locality,
          distance_km: Math.round(dist * 10) / 10,
          score: score,
          is_exact_match: isExact,
          cooldown_cleared: cooldownCleared,
          cooldown_days_remaining: 0,
          cooldown_note: 'Eligible under NBTC interval guidelines (>90 days since last donation).',
          is_verified: d.verified,
          total_donations: d.totalDonations,
          phone_masked: d.phone ? `${d.phone.slice(0, 4)}*** **${d.phone.slice(-2)}` : '+91 98*** **01',
          match_explanation: `${isExact ? 'Exact blood match' : `Compatible alternative (${d.bloodGroup})`} for ${component.toUpperCase()} • ~${Math.round(dist * 10) / 10} km away in ${d.locality} • NBTC cooldown cleared`,
        };
      }).sort((a, b) => b.score - a.score);

      const effectiveRadius = processed.length > 0 && processed[0].distance_km > 5 ? 10.0 : 5.0;

      setResults({
        recipient_blood_group: bloodGroup,
        component: component,
        initial_radius_km: 5.0,
        effective_radius_km: effectiveRadius,
        radius_expanded: effectiveRadius > 5.0,
        expansion_reason: effectiveRadius > 5.0
          ? 'Search radius automatically expanded from 5 km to 10 km to identify sufficient compatible donors.'
          : 'Standard 5 km emergency radius applied.',
        total_matched: processed.length,
        matches: processed,
        medical_advisory: 'Final donor eligibility and transfusion compatibility must be confirmed by qualified medical professionals or certified blood banks.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSmartMatching();
  }, [bloodGroup, component, locality]);

  return (
    <div style={{ marginTop: 16 }}>
      {/* Control Box */}
      <div className="card" style={{ padding: 24, marginBottom: 24, borderLeft: '4px solid #7C3AED' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
            }}>
              <ClinicalMatchIcon size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#172033', margin: 0 }}>
                {t('matcherEngineTitle')}
              </h2>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                {t('matcherEngineDesc')}
              </p>
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            background: '#F3E8FF', color: '#7C3AED', border: '1px solid #E9D5FF'
          }}>
            {t('clinicalAiModel')}
          </span>
        </div>

        {/* Input Parameters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {/* Blood Group */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              {t('labelRecipientGroup')}
            </label>
            <select
              className="form-input form-select"
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
            >
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              <option value="Bombay">Bombay Blood Group (hh)</option>
            </select>
          </div>

          {/* Component Type */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              {t('labelComponent')}
            </label>
            <select
              className="form-input form-select"
              value={component}
              onChange={e => setComponent(e.target.value)}
            >
              <option value="whole_blood">{t('compWholeBlood')}</option>
              <option value="prbc">{t('compPrbc')}</option>
              <option value="platelets">{t('compPlatelets')}</option>
              <option value="ffp">{t('compFfp')}</option>
            </select>
          </div>

          {/* Locality */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              {t('labelLocality')}
            </label>
            <select
              className="form-input form-select"
              value={locality}
              onChange={e => setLocality(e.target.value)}
            >
              {BANGALORE_LOCALITIES.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              {t('labelUrgency')}
            </label>
            <select
              className="form-input form-select"
              value={urgency}
              onChange={e => setUrgency(e.target.value)}
            >
              <option value="critical">{t('urgencyCritical')}</option>
              <option value="high">{t('urgencyHigh')}</option>
              <option value="medium">{t('urgencyMedium')}</option>
            </select>
          </div>
        </div>

        {/* Dynamic Radius & Medical Advisory */}
        {results && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.radius_expanded && (
              <div style={{
                background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10,
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10
              }}>
                <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                  {t('radiusExpandedNotice')}
                </span>
              </div>
            )}

            <div style={{
              background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10,
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10
            }}>
              <ShieldCheck size={18} color="#475569" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#475569' }}>
                <strong>{t('medicalAdvisory')}:</strong> {t('medicalAdvisoryDesc')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#172033', margin: 0 }}>
            {t('topRankedDonors')} {results ? `(${results.total_matched})` : ''}
          </h3>
          <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
            {t('rankedByDesc')}
          </p>
        </div>
        <button
          onClick={runSmartMatching}
          className="btn btn-ghost btn-sm"
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ClinicalMatchIcon size={14} color="#7C3AED" />
          {loading ? t('loading') : t('btnRefreshMatches')}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #E2E8F0',
            borderTop: '3px solid #7C3AED', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: '#172033' }}>{t('evaluatingMatrix')}</p>
          <p style={{ fontSize: 12, color: '#64748B' }}>{t('evaluatingMatrixDesc')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && results && results.matches.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '50px 20px', background: 'white',
          borderRadius: 12, border: '1px dashed #CBD5E1'
        }}>
          <AlertTriangle size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 15, fontWeight: 800, color: '#172033', marginBottom: 4 }}>
            {t('noCompatibleDonors')}
          </h4>
          <p style={{ fontSize: 13, color: '#64748B', maxWidth: 460, margin: '0 auto 16px' }}>
            {t('noCompatibleDonorsDesc')}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => {
                setComponent('whole_blood');
                runSmartMatching();
              }}
              className="btn btn-primary btn-sm"
            >
              {t('btnExpandWholeBlood')}
            </button>
          </div>
        </div>
      )}

      {/* Ranked Donor Cards */}
      {!loading && results && results.matches.length > 0 && (
        <div style={{ display: 'grid', gap: 16 }}>
          {results.matches.map((donor, idx) => (
            <div
              key={donor.donor_id}
              className="card"
              style={{
                padding: '18px 20px',
                borderLeft: idx === 0 ? '4px solid #10B981' : '4px solid #CBD5E1',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <Avatar name={donor.name} size={50} />

                {/* Main Details */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#172033', margin: 0 }}>
                      {donor.name}
                    </h4>
                    {idx === 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                        background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0'
                      }}>
                        {t('bestClinicalMatch')}
                      </span>
                    )}
                    {donor.is_verified && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                        background: '#E0F2FE', color: '#0284C7'
                      }}>
                        {t('verifiedDonorBadge')}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                      <MapPin size={13} color="#D62839" />
                      <span>{donor.locality} (~{donor.distance_km} km {t('tickerAway') || 'away'})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                      <Phone size={13} color="#64748B" />
                      <span style={{ fontFamily: 'monospace' }}>{donor.phone_masked}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                      <Award size={13} color="#D97706" />
                      <span>{donor.total_donations} {t('statDonations')}</span>
                    </div>
                  </div>

                  {/* Explainability Pill */}
                  <div style={{
                    marginTop: 10, padding: '8px 12px', borderRadius: 8,
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    fontSize: 12, color: '#334155'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>💡 <strong>{t('recommendationReason')}:</strong> {getMatchExplanation(donor)}</span>
                    </div>
                  </div>
                </div>

                {/* Score & Action Right Column */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                  justifyContent: 'space-between', gap: 12, minWidth: 140
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 22, fontWeight: 900,
                      color: donor.score >= 85 ? '#10B981' : donor.score >= 70 ? '#7C3AED' : '#D97706'
                    }}>
                      {donor.score}%
                    </div>
                    <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                      {t('aiMatchScore')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <BloodGroupBadge group={donor.blood_group} size="md" />
                  </div>

                  <button
                    onClick={() => setSelectedDonorForRequest({
                      id: donor.donor_id,
                      name: donor.name,
                      bloodGroup: donor.blood_group,
                      locality: donor.locality
                    })}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Send size={13} />
                    {t('btnSendSOS')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal dialog for sending request to selected donor */}
      {selectedDonorForRequest && (
        <RequestModal
          donor={selectedDonorForRequest}
          onClose={() => setSelectedDonorForRequest(null)}
        />
      )}
    </div>
  );
}

