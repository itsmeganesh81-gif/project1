import { useState } from 'react';
import {
  Shield, AlertTriangle, Heart, CheckCircle, Plus, Info,
  Building, MapPin, Activity, Award, HelpCircle
} from 'lucide-react';
import { RarePhenotypeIcon } from '../components/common/CustomIcons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const RARE_PHENOTYPES = [
  { id: 'bombay_hh', name: 'Bombay Blood Group (hh)', incidence: '1 in 10,000 in India', desc: 'Lacks H-antigen. Produces anti-H antibodies and can strictly receive red cells only from other Bombay donors.' },
  { id: 'rh_null', name: 'Rh-Null ("Golden Blood")', incidence: '< 50 recorded globally', desc: 'Completely lacks all 61 antigens in the Rh system. Universal donor for Rh system, but can receive only Rh-null blood.' },
  { id: 'duffy_negative', name: 'Duffy-Negative Fy(a-b-)', incidence: 'Predominantly African & Indian subsets', desc: 'Negative for Fya and Fyb antigens. Highly susceptible to delayed hemolytic transfusion reactions if mismatched.' },
  { id: 'kell_negative', name: 'Kell-Negative (K-)', incidence: '91% of population', desc: 'Immunogenic antigen. Anti-K can cause severe hemolytic disease of fetus and newborn (HDFN).' },
  { id: 'ina_negative', name: 'Indian Antigen Negative In(a-)', incidence: 'Unique Indian subpopulation', desc: 'First discovered in India. High significance in multi-transfused thalassemia patients.' },
];

export default function RareBloodNetwork() {
  const { user } = useAuth();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'rare-req-01',
      phenotype: 'Bombay Blood Group (hh)',
      units: 1,
      hospital: 'Manipal Hospital Whitefield',
      locality: 'Whitefield, Bengaluru',
      urgency: 'Immediate Critical',
      doctor: 'Dr. Sunita Rao (Hematology)',
      summary: 'Emergency cardiac bypass surgery: patient confirmed Bombay blood group (anti-H antibodies present).',
      status: 'Active Coordination',
      patient_token: 'RARE-BOMB-091',
    },
  ]);

  const [registerForm, setRegisterForm] = useState({
    phenotype: 'bombay_hh',
    immunohematology_lab: 'Rotary TTK Blood Centre Immunohematology Reference Lab',
    lab_report_number: '',
    state_region: 'Karnataka',
    consent: true,
  });

  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [respondedAlert, setRespondedAlert] = useState(null);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterSuccess(true);
    setShowRegisterModal(false);
    setTimeout(() => setRegisterSuccess(false), 5000);
  };

  const handleRespondAlert = (id) => {
    setRespondedAlert(id);
    setActiveAlerts(activeAlerts.map(a =>
      a.id === id ? { ...a, status: 'Donor Accepted - Coordinating' } : a
    ));
    setTimeout(() => setRespondedAlert(null), 4000);
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        borderRadius: 20, padding: '40px 32px', color: 'white', marginBottom: 32, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 780 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 30, padding: '4px 14px', marginBottom: 16, fontSize: 12, fontWeight: 700
          }}>
            <RarePhenotypeIcon size={14} color="#FBBF24" />
            National Rare Blood Donor Registry • India
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 14px' }}>
            Rare Blood Phenotype Network
          </h1>
          <p style={{ fontSize: 16, color: '#C7D2FE', lineHeight: 1.6, margin: '0 0 24px' }}>
            When conventional blood banks face zero compatibility for rare phenotypes like Bombay ($hh$) or Rh-Null, every second counts. BloodBridge securely connects verified reference laboratories, hospitals and voluntary rare donors across India.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="btn btn-lg"
              style={{ background: '#F59E0B', color: '#1E1B4B', fontWeight: 800, border: 'none' }}
            >
              <Heart size={18} fill="#1E1B4B" /> Join as Rare Blood Donor
            </button>
            <a
              href="#phenotypes-info"
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}
            >
              Learn About Rare Phenotypes
            </a>
          </div>
        </div>
      </div>

      {/* DPDP Privacy Guarantee Banner */}
      <div style={{
        background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12,
        padding: '14px 18px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'center'
      }}>
        <Shield size={22} color="#16A34A" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: '#166534' }}>
          <strong>Maximum Privacy Protection (DPDP Act):</strong> Rare blood donors are protected under BloodBridge's highest security tier. Your residential address, full phone number, and identity are never exposed on public listings. During emergencies, coordination occurs strictly between verified treating hospitals and our encrypted alert relay.
        </span>
      </div>

      {/* Registration Success Notification */}
      {registerSuccess && (
        <div style={{
          background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12,
          padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center'
        }}>
          <CheckCircle size={20} color="#D97706" />
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 700 }}>
            Registration received! Your immunohematology reference lab report will be verified by an accredited institution. Thank you for standing by to save lives.
          </span>
        </div>
      )}

      {/* Network Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Registered Rare Donors', value: '42', icon: '🧬', color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Lab-Verified Donors', value: '38', icon: '✓', color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Active Critical SOS', value: '1', icon: '🚨', color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Successful Coordinations', value: '29', icon: '❤️', color: '#D97706', bg: '#FFFBEB' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ padding: '18px 20px', background: item.bg, border: `1px solid ${item.color}25` }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Active Critical Alerts Section */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#172033', margin: 0 }}>
              Active Emergency Rare Blood Requirements
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
              Verified hospital emergencies requiring rare phenotypes
            </p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: '#FEE2E2', color: '#DC2626' }}>
            CRITICAL SOS DISPATCH
          </span>
        </div>

        {respondedAlert && (
          <div style={{
            background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <CheckCircle size={18} color="#16A34A" />
            <span style={{ fontSize: 13, color: '#15803D', fontWeight: 700 }}>
              Your acceptance has been relayed to the hospital emergency coordinator. The blood bank staff will contact you directly.
            </span>
          </div>
        )}

        {activeAlerts.map(alert => (
          <div key={alert.id} className="card" style={{ padding: 24, borderLeft: '5px solid #DC2626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 13, fontWeight: 900, padding: '4px 12px', borderRadius: 20,
                    background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA'
                  }}>
                    🧬 {alert.phenotype}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#172033' }}>
                    {alert.units} Unit PRBC Required
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#EFF6FF', color: '#2563EB' }}>
                    Token: {alert.patient_token}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 10, flexWrap: 'wrap', fontSize: 13, color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building size={14} color="#D62839" />
                    <strong>{alert.hospital}</strong> ({alert.locality})
                  </div>
                  <div>
                    Physician: <strong>{alert.doctor}</strong>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#334155', background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, margin: '12px 0 0', border: '1px solid #E2E8F0' }}>
                  <strong>Clinical Case Note:</strong> {alert.summary}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 12,
                  background: alert.status.includes('Accepted') ? '#DCFCE7' : '#FEF3C7',
                  color: alert.status.includes('Accepted') ? '#15803D' : '#B45309'
                }}>
                  {alert.status}
                </span>

                <button
                  onClick={() => handleRespondAlert(alert.id)}
                  disabled={alert.status.includes('Accepted')}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Heart size={14} /> Respond to SOS
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Phenotypes Guide */}
      <div id="phenotypes-info" className="card" style={{ padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#172033', marginBottom: 6 }}>
          Immunohematology Guide: High-Risk Rare Phenotypes in India
        </h2>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
          Educational resource for voluntary donors and healthcare professionals
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {RARE_PHENOTYPES.map(p => (
            <div key={p.id} style={{
              background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '18px 20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>{p.name}</h4>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: '#E0E7FF', color: '#3730A3' }}>
                  {p.incidence}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Voluntary Registration Modal */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#172033', marginBottom: 6 }}>
              Join the Rare Blood Donor Registry
            </h3>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }}>
              Voluntary enrollment for individuals with confirmed immunohematology test reports.
            </p>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Confirmed Rare Phenotype</label>
                <select
                  className="form-input form-select"
                  value={registerForm.phenotype}
                  onChange={e => setRegisterForm({ ...registerForm, phenotype: e.target.value })}
                >
                  <option value="bombay_hh">Bombay Blood Group (hh)</option>
                  <option value="rh_null">Rh-Null ("Golden Blood")</option>
                  <option value="duffy_negative">Duffy-Negative Fy(a-b-)</option>
                  <option value="kell_negative">Kell-Negative (K-)</option>
                  <option value="ina_negative">Indian Antigen Negative In(a-)</option>
                  <option value="other_rare">Other Immunohematology Verified Phenotype</option>
                </select>
              </div>

              <div>
                <label className="form-label">Testing Reference Laboratory</label>
                <input
                  type="text"
                  className="form-input"
                  value={registerForm.immunohematology_lab}
                  onChange={e => setRegisterForm({ ...registerForm, immunohematology_lab: e.target.value })}
                  placeholder="e.g. Rotary TTK, NIMHANS, Narayana Health Lab"
                  required
                />
              </div>

              <div>
                <label className="form-label">Lab Test Report / Token Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={registerForm.lab_report_number}
                  onChange={e => setRegisterForm({ ...registerForm, lab_report_number: e.target.value })}
                  placeholder="e.g. TTK-REF-2024-091"
                  required
                />
              </div>

              <div>
                <label className="form-label">State / Region</label>
                <input
                  type="text"
                  className="form-input"
                  value={registerForm.state_region}
                  onChange={e => setRegisterForm({ ...registerForm, state_region: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="rare-consent"
                  checked={registerForm.consent}
                  onChange={e => setRegisterForm({ ...registerForm, consent: e.target.checked })}
                  style={{ marginTop: 3 }}
                  required
                />
                <label htmlFor="rare-consent" style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                  I consent to be notified exclusively by accredited hospitals in life-threatening rare blood emergencies. I understand my personal data is masked from public view.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

