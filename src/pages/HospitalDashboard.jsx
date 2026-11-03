import { useState } from 'react';
import { AlertOctagon, Plus, CheckCircle, X } from 'lucide-react';
import { HospitalClinicalIcon } from '../components/common/CustomIcons';
import BloodGroupBadge from '../components/common/BloodGroupBadge';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = [
  { id: 'prbc', label: 'PRBC (Packed Red Blood Cells)' },
  { id: 'platelets', label: 'Platelets (Single / Random Donor)' },
  { id: 'whole_blood', label: 'Whole Blood' },
  { id: 'ffp', label: 'Fresh Frozen Plasma (FFP)' },
  { id: 'cryoprecipitate', label: 'Cryoprecipitate' },
];

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState('requisitions'); // 'requisitions' | 'network_stock'
  const [showReqModal, setShowReqModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [requisitions, setRequisitions] = useState([
    {
      id: 'req-01',
      blood_bank_name: 'Indian Red Cross Blood Centre',
      patient_identifier: 'MRN-2026-CARD-049',
      blood_group: 'O+',
      component: 'prbc',
      units_requested: 2,
      units_allocated: 2,
      urgency: 'urgent',
      clinical_indication: 'Elective CABG cardiac bypass scheduled',
      cross_match_status: 'compatible',
      status: 'crossmatched',
      treating_physician: 'Dr. Sunita Rao',
      created_at: '2026-11-03 14:30',
    },
    {
      id: 'req-02',
      blood_bank_name: 'Indian Red Cross Blood Centre',
      patient_identifier: 'TOKEN-TRAUMA-ER-911',
      blood_group: 'O-',
      component: 'prbc',
      units_requested: 4,
      units_allocated: 0,
      urgency: 'emergency_mhp',
      clinical_indication: 'Severe polytrauma road accident with hemorrhagic shock',
      cross_match_status: 'emergency_uncrossmatched',
      status: 'submitted',
      treating_physician: 'Dr. Sunita Rao',
      created_at: '2026-11-03 18:15',
    }
  ]);

  const [networkBloodBanks, setNetworkBloodBanks] = useState([
    {
      id: 'inst-01',
      name: 'Indian Red Cross Society Blood Centre',
      locality: 'Race Course Road, Bengaluru Central',
      distance_km: 6.2,
      contact: '+91 80 2226 8435',
      emergency: '+91 80 2226 4205',
      stock_summary: { 'O+': 4, 'B+': 2, 'O-': 1, 'A+': 0, 'AB+': 0 },
      is_nabh: true,
      open_hours: '24/7 Service'
    },
    {
      id: 'inst-02',
      name: 'Victoria Hospital Regional Blood Centre',
      locality: 'K.R. Road, Kalasipalya',
      distance_km: 8.5,
      contact: '+91 80 2670 1150',
      emergency: '+91 80 2670 1152',
      stock_summary: { 'O+': 8, 'A+': 5, 'B+': 6, 'AB+': 2, 'O-': 0 },
      is_nabh: true,
      open_hours: '24/7 Service'
    },
    {
      id: 'inst-03',
      name: 'Bowring and Lady Curzon Hospital Blood Bank',
      locality: 'Shivajinagar, Bengaluru',
      distance_km: 4.8,
      contact: '+91 80 2559 1325',
      emergency: '+91 80 2559 1327',
      stock_summary: { 'A+': 3, 'B+': 4, 'O+': 2, 'AB-': 1, 'O-': 0 },
      is_nabh: false,
      open_hours: '24/7 Service'
    }
  ]);

  const [reqForm, setReqForm] = useState({
    blood_group: 'O+',
    component: 'prbc',
    units_requested: 2,
    urgency: 'urgent',
    patient_identifier: '',
    clinical_indication: '',
    treating_physician: 'Dr. Sunita Rao (Duty Consultant)',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateRequisition = (e) => {
    e.preventDefault();
    if (!reqForm.patient_identifier.trim()) {
      alert('Please enter a clinical MRN or anonymous patient token.');
      return;
    }

    const isMhp = reqForm.urgency === 'emergency_mhp';

    const newReq = {
      id: 'req-' + Date.now(),
      blood_bank_name: 'Indian Red Cross Blood Centre',
      patient_identifier: reqForm.patient_identifier,
      blood_group: reqForm.blood_group,
      component: reqForm.component,
      units_requested: parseInt(reqForm.units_requested, 10),
      units_allocated: 0,
      urgency: reqForm.urgency,
      clinical_indication: reqForm.clinical_indication,
      cross_match_status: isMhp ? 'emergency_uncrossmatched' : 'pending',
      status: 'submitted',
      treating_physician: reqForm.treating_physician,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setRequisitions([newReq, ...requisitions]);
    setShowReqModal(false);
    showToast(isMhp
      ? 'CRITICAL: Massive Hemorrhage Protocol activated! Emergency uncrossmatched units requested.'
      : 'Clinical blood requisition submitted to accredited blood bank network.'
    );
  };

  const handleMarkTransfused = (id) => {
    setRequisitions(requisitions.map(r => r.id === id ? { ...r, status: 'fulfilled' } : r));
    showToast('Transfusion completion recorded. Clinical audit log updated.');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Toast */}
        {toastMessage && (
          <div style={{
            position: 'fixed', top: 80, right: 24, zIndex: 1000,
            background: '#1e293b', color: 'white', padding: '14px 20px', borderRadius: 10,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14, fontWeight: 500, borderLeft: '4px solid #10b981'
          }}>
            <CheckCircle size={18} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '28px 32px',
          border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20,
          marginBottom: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700
              }}>
                <HospitalClinicalIcon size={16} color="#b91c1c" />
                <span>Accredited Hospital Partner</span>
              </div>
              <span style={{ fontSize: 13, color: '#64748b' }}>License: KA-BLR-HOSP-2021-049</span>
              <span style={{ fontSize: 12, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                NABH Verified
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Manipal Hospital Whitefield
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
              Department of Transfusion Medicine & Emergency Care • Whitefield, Bengaluru
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                setReqForm({ ...reqForm, urgency: 'emergency_mhp' });
                setShowReqModal(true);
              }}
              style={{
                background: '#ef4444', color: 'white', border: 'none', borderRadius: 8,
                padding: '10px 16px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(239,68,68,0.3)'
              }}
            >
              <AlertOctagon size={16} />
              Massive Hemorrhage SOS
            </button>
            <button
              onClick={() => {
                setReqForm({ ...reqForm, urgency: 'urgent' });
                setShowReqModal(true);
              }}
              style={{
                background: '#0f172a', color: 'white', border: 'none', borderRadius: 8,
                padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <Plus size={16} />
              New Requisition
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('requisitions')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'requisitions' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'requisitions' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Clinical Requisitions ({requisitions.length})
          </button>
          <button
            onClick={() => setActiveTab('network_stock')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'network_stock' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'network_stock' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Regional Blood Bank Stock ({networkBloodBanks.length} Hubs)
          </button>
        </div>

        {/* TAB 1: REQUISITIONS */}
        {activeTab === 'requisitions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {requisitions.map(req => {
              const isMhp = req.urgency === 'emergency_mhp';

              return (
                <div
                  key={req.id}
                  style={{
                    background: isMhp ? '#fff5f5' : 'white',
                    borderRadius: 12, padding: '24px',
                    border: isMhp ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                          Patient MRN: {req.patient_identifier}
                        </span>
                        {isMhp ? (
                          <span style={{ fontSize: 11, background: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>
                            MASSIVE HEMORRHAGE PROTOCOL
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                            URGENT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        Requested From: <strong>{req.blood_bank_name}</strong> • Attending: {req.treating_physician}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BloodGroupBadge bloodGroup={req.blood_group} size="sm" />
                        <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                          {req.units_requested} Units {req.component.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Crossmatch: <strong style={{ color: req.cross_match_status === 'compatible' ? '#16a34a' : '#d97706' }}>
                          {req.cross_match_status.toUpperCase()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, fontSize: 13, color: '#334155', marginBottom: 16 }}>
                    <strong>Clinical Indication:</strong> {req.clinical_indication}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Requisition Status: <strong style={{ color: req.status === 'fulfilled' ? '#16a34a' : '#2563eb', textTransform: 'uppercase' }}>{req.status}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      {req.status !== 'fulfilled' && (
                        <button
                          onClick={() => handleMarkTransfused(req.id)}
                          style={{
                            background: '#16a34a', color: 'white', border: 'none', borderRadius: 6,
                            padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6
                          }}
                        >
                          <CheckCircle size={14} /> Mark Transfusion Completed
                        </button>
                      )}
                      {req.status === 'fulfilled' && (
                        <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={16} /> Transfusion Completed & Logged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: NETWORK STOCK LOCATOR */}
        {activeTab === 'network_stock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid #e2e8f0', marginBottom: 4 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Live Blood Bank Network Stock Viewer
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                Locate verified blood units in real-time across accredited regional blood centres in Bengaluru.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
              {networkBloodBanks.map(bb => (
                <div key={bb.id} style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {bb.name}
                    </h4>
                    {bb.is_nabh && (
                      <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                        NABH
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                    {bb.locality} • <strong style={{ color: '#0f172a' }}>{bb.distance_km} km away</strong>
                  </p>

                  {/* Stock Pills */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      Available Verified Units:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(bb.stock_summary).map(([grp, qty]) => (
                        <div
                          key={grp}
                          style={{
                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                            background: qty > 0 ? '#f0fdf4' : '#f8fafc',
                            color: qty > 0 ? '#15803d' : '#94a3b8',
                            border: `1px solid ${qty > 0 ? '#bbf7d0' : '#e2e8f0'}`
                          }}
                        >
                          {grp}: {qty} units
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Helpline: <strong style={{ color: '#0f172a' }}>{bb.emergency}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setReqForm({ ...reqForm, urgency: 'urgent' });
                        setShowReqModal(true);
                      }}
                      style={{
                        background: '#D62839', color: 'white', border: 'none', borderRadius: 6,
                        padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      Request Blood
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: CREATE REQUISITION */}
        {showReqModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div style={{
              background: 'white', borderRadius: 16, width: '100%', maxWidth: 540,
              maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Hospital Blood Requisition
                </h3>
                <button
                  onClick={() => setShowReqModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateRequisition} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Clinical Urgency *
                  </label>
                  <select
                    value={reqForm.urgency}
                    onChange={e => setReqForm({ ...reqForm, urgency: e.target.value })}
                    style={{
                      width: '100%', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                      border: reqForm.urgency === 'emergency_mhp' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      color: reqForm.urgency === 'emergency_mhp' ? '#ef4444' : '#0f172a'
                    }}
                  >
                    <option value="routine">Routine Elective Surgery</option>
                    <option value="urgent">Urgent Clinical Requirement (&lt; 4 Hours)</option>
                    <option value="emergency_mhp">Massive Hemorrhage Protocol (MHP - Immediate)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Blood Group *
                    </label>
                    <select
                      value={reqForm.blood_group}
                      onChange={e => setReqForm({ ...reqForm, blood_group: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    >
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Component *
                    </label>
                    <select
                      value={reqForm.component}
                      onChange={e => setReqForm({ ...reqForm, component: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    >
                      {COMPONENTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Units Needed *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={reqForm.units_requested}
                      onChange={e => setReqForm({ ...reqForm, units_requested: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Patient MRN / Token *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MRN-2026-CARD-049"
                      value={reqForm.patient_identifier}
                      onChange={e => setReqForm({ ...reqForm, patient_identifier: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Clinical Indication *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Acute severe hemorrhage, post-partum bleeding, bypass support"
                    value={reqForm.clinical_indication}
                    onChange={e => setReqForm({ ...reqForm, clinical_indication: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowReqModal(false)}
                    style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#475569' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      background: reqForm.urgency === 'emergency_mhp' ? '#ef4444' : '#D62839',
                      color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {reqForm.urgency === 'emergency_mhp' ? 'Authorize MHP SOS' : 'Submit Requisition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
