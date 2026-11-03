import { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, Plus, CheckCircle,
  Truck, Thermometer, Check, X
} from 'lucide-react';
import { BloodBankVaultIcon } from '../components/common/CustomIcons';
import BloodGroupBadge from '../components/common/BloodGroupBadge';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = [
  { id: 'prbc', label: 'PRBC (Red Cells)', shelfLife: '42 Days', storage: '2°C to 6°C' },
  { id: 'platelets', label: 'Platelets (RDP/SDP)', shelfLife: '5 Days', storage: '20°C to 24°C Agitated' },
  { id: 'whole_blood', label: 'Whole Blood', shelfLife: '35 Days', storage: '2°C to 6°C' },
  { id: 'ffp', label: 'Fresh Frozen Plasma', shelfLife: '1 Year', storage: '≤ -30°C' },
  { id: 'cryoprecipitate', label: 'Cryoprecipitate', shelfLife: '1 Year', storage: '≤ -30°C' },
];

export default function BloodBankDashboard() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'requisitions' | 'camps'

  // Batches state
  const [batches, setBatches] = useState([
    {
      id: 'batch-01',
      batch_number: 'BB-OP-7782A',
      blood_group: 'O+',
      component: 'prbc',
      units: 4,
      volume_ml: 350,
      expiry_date: '2026-11-28',
      days_to_expiry: 25,
      storage_location: 'Refrigerated Vault A-1 (4°C)',
      storage_temp_celsius: 4.1,
      is_cleared: true,
      technician_name: 'Lab Tech Ramesh',
      status: 'available',
    },
    {
      id: 'batch-02',
      batch_number: 'BB-BP-1190K',
      blood_group: 'B+',
      component: 'platelets',
      units: 2,
      volume_ml: 70,
      expiry_date: '2026-11-06',
      days_to_expiry: 3,
      storage_location: 'Platelet Agitator Chamber 2 (22°C)',
      storage_temp_celsius: 22.0,
      is_cleared: true,
      technician_name: 'Lab Tech Priya',
      status: 'available',
    },
    {
      id: 'batch-03',
      batch_number: 'BB-ON-9902X',
      blood_group: 'O-',
      component: 'whole_blood',
      units: 1,
      volume_ml: 450,
      expiry_date: '2026-11-20',
      days_to_expiry: 17,
      storage_location: 'Emergency Reserve Unit (4°C)',
      storage_temp_celsius: 3.9,
      is_cleared: true,
      technician_name: 'Dr. Suresh (Duty Pathologist)',
      status: 'available',
    }
  ]);

  // Requisitions state
  const [requisitions, setRequisitions] = useState([
    {
      id: 'req-01',
      hospital_name: 'Manipal Hospital Whitefield',
      patient_identifier: 'TOKEN-BLR-CARD-049',
      blood_group: 'O+',
      component: 'prbc',
      units_requested: 2,
      units_allocated: 2,
      urgency: 'urgent',
      clinical_indication: 'Elective CABG cardiac bypass scheduled',
      cross_match_status: 'compatible',
      status: 'crossmatched',
      treating_physician: 'Dr. Sunita Rao',
      created_at: '2026-11-03T14:30:00Z',
    },
    {
      id: 'req-02',
      hospital_name: 'Apollo Hospital Bannerghatta',
      patient_identifier: 'TOKEN-TRAUMA-ER-911',
      blood_group: 'O-',
      component: 'prbc',
      units_requested: 4,
      units_allocated: 0,
      urgency: 'emergency_mhp',
      clinical_indication: 'Severe polytrauma road accident with hemorrhagic shock',
      cross_match_status: 'emergency_uncrossmatched',
      status: 'submitted',
      treating_physician: 'Dr. K. Sharma',
      created_at: '2026-11-03T18:15:00Z',
    }
  ]);

  // Donation camps state
  const [camps] = useState([
    {
      id: 'camp-01',
      camp_name: 'Bengaluru IT Corridor Mega Blood Drive',
      venue: 'Manyata Tech Park, Outer Ring Road, Bengaluru',
      locality: 'Nagavara',
      start_date: '2026-11-10 09:00',
      end_date: '2026-11-10 17:00',
      target_units: 150,
      units_collected: 0,
      status: 'scheduled',
      contact_person: 'David K (Camp Officer)',
      contact_phone: '+91 98450 11223'
    }
  ]);

  // Batch registration modal state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    blood_group: 'A+',
    component: 'prbc',
    units: 1,
    volume_ml: 350,
    storage_location: 'Refrigerated Vault A-2 (4°C)',
    storage_temp_celsius: 4.0,
    expiry_days: 42,
    tested_hiv: true,
    tested_hbv: true,
    tested_hcv: true,
    tested_syphilis: true,
    tested_malaria: true,
    technician_name: 'Quality Assurance Technologist',
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRegisterBatch = (e) => {
    e.preventDefault();
    const allCleared = (
      batchForm.tested_hiv &&
      batchForm.tested_hbv &&
      batchForm.tested_hcv &&
      batchForm.tested_syphilis &&
      batchForm.tested_malaria
    );

    const newBatch = {
      id: 'batch-' + Date.now(),
      batch_number: `BB-${batchForm.blood_group.replace('+', 'P').replace('-', 'N')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      blood_group: batchForm.blood_group,
      component: batchForm.component,
      units: parseInt(batchForm.units, 10),
      volume_ml: parseInt(batchForm.volume_ml, 10),
      expiry_date: new Date(Date.now() + batchForm.expiry_days * 86400000).toISOString().split('T')[0],
      days_to_expiry: batchForm.expiry_days,
      storage_location: batchForm.storage_location,
      storage_temp_celsius: parseFloat(batchForm.storage_temp_celsius),
      is_cleared: allCleared,
      technician_name: batchForm.technician_name,
      status: allCleared ? 'available' : 'quarantined',
    };

    setBatches([newBatch, ...batches]);
    setShowBatchModal(false);
    showToast(allCleared ? 'New blood component batch registered and released to inventory!' : 'Warning: Batch has uncleared TTI tests and has been quarantined.');
  };

  const handleUpdateReqStatus = (reqId, newStatus, newCrossMatch = null) => {
    setRequisitions(requisitions.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: newStatus,
          cross_match_status: newCrossMatch || r.cross_match_status,
          units_allocated: newStatus === 'dispatched' ? r.units_requested : r.units_allocated,
        };
      }
      return r;
    }));
    showToast(`Requisition #${reqId} status updated to ${newStatus}`);
  };

  // Inventory matrix calculation
  const stockMatrix = {};
  BLOOD_GROUPS.forEach(bg => {
    stockMatrix[bg] = { prbc: 0, platelets: 0, whole_blood: 0, ffp: 0, cryoprecipitate: 0, total: 0 };
  });

  batches.filter(b => b.status === 'available').forEach(b => {
    if (stockMatrix[b.blood_group]) {
      stockMatrix[b.blood_group][b.component] = (stockMatrix[b.blood_group][b.component] || 0) + b.units;
      stockMatrix[b.blood_group].total += b.units;
    }
  });

  const totalAvailableUnits = batches.filter(b => b.status === 'available').reduce((acc, b) => acc + b.units, 0);
  const nearExpiryUnits = batches.filter(b => b.status === 'available' && b.days_to_expiry <= 3).reduce((acc, b) => acc + b.units, 0);

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Toast Alert */}
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
                <BloodBankVaultIcon size={16} color="#b91c1c" />
                <span>Verified Blood Centre</span>
              </div>
              <span style={{ fontSize: 13, color: '#64748b' }}>License: KA-BLR-BB-28C-0012</span>
              <span style={{ fontSize: 12, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                NABH Accredited
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Indian Red Cross Society Blood Centre
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
              Central Blood Bank Network Hub • Race Course Road, Bengaluru
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowBatchModal(true)}
              style={{
                background: '#D62839', color: 'white', border: 'none', borderRadius: 8,
                padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 6px rgba(214,40,57,0.3)'
              }}
            >
              <Plus size={16} />
              Register Blood Batch
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Available Cleared Units</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {totalAvailableUnits} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>units</span>
            </div>
            <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={14} /> 100% Verified TTI Negative
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Near Expiry Alert (&le; 3 Days)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: nearExpiryUnits > 0 ? '#b91c1c' : '#0f172a', marginTop: 4 }}>
              {nearExpiryUnits} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>units</span>
            </div>
            <div style={{ fontSize: 12, color: nearExpiryUnits > 0 ? '#b91c1c' : '#64748b', marginTop: 4 }}>
              {nearExpiryUnits > 0 ? 'Requires priority hospital allocation' : 'Optimal shelf life'}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Incoming Hospital Requisitions</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {requisitions.filter(r => r.status !== 'fulfilled').length}
            </div>
            <div style={{ fontSize: 12, color: '#d97706', marginTop: 4 }}>
              {requisitions.filter(r => r.urgency === 'emergency_mhp').length} Massive Hemorrhage (MHP)
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Upcoming Mega Drives</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {camps.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>camps</span>
            </div>
            <div style={{ fontSize: 12, color: '#2563eb', marginTop: 4 }}>
              Target: {camps.reduce((a, c) => a + c.target_units, 0)} voluntary units
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'inventory' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'inventory' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Real-Time Inventory ({batches.length} Batches)
          </button>
          <button
            onClick={() => setActiveTab('requisitions')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'requisitions' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'requisitions' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Hospital Requisitions ({requisitions.length})
          </button>
          <button
            onClick={() => setActiveTab('camps')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'camps' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'camps' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Donation Camps ({camps.length})
          </button>
        </div>

        {/* TAB 1: INVENTORY & STOCK MATRIX */}
        {activeTab === 'inventory' && (
          <div>
            {/* Stock Matrix Grid */}
            <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Verified Component Matrix
                  </h3>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                    Strictly displays verified, TTI-cleared stock currently held in cold chain storage.
                  </p>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: 6 }}>
                  NBTC Cold-Chain Monitored
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Blood Group</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>PRBC (Units)</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Platelets (Units)</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Whole Blood (Units)</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>FFP / Cryo (Units)</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Total Available</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Reserve Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BLOOD_GROUPS.map(bg => {
                      const row = stockMatrix[bg];
                      const isLow = row.total <= 1;
                      const isZero = row.total === 0;

                      return (
                        <tr key={bg} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                            <BloodGroupBadge bloodGroup={bg} size="sm" />
                          </td>
                          <td style={{ padding: '12px 14px', color: row.prbc === 0 ? '#94a3b8' : '#0f172a', fontWeight: row.prbc > 0 ? 600 : 400 }}>
                            {row.prbc}
                          </td>
                          <td style={{ padding: '12px 14px', color: row.platelets === 0 ? '#94a3b8' : '#0f172a', fontWeight: row.platelets > 0 ? 600 : 400 }}>
                            {row.platelets}
                          </td>
                          <td style={{ padding: '12px 14px', color: row.whole_blood === 0 ? '#94a3b8' : '#0f172a', fontWeight: row.whole_blood > 0 ? 600 : 400 }}>
                            {row.whole_blood}
                          </td>
                          <td style={{ padding: '12px 14px', color: (row.ffp + row.cryoprecipitate) === 0 ? '#94a3b8' : '#0f172a', fontWeight: (row.ffp + row.cryoprecipitate) > 0 ? 600 : 400 }}>
                            {row.ffp + row.cryoprecipitate}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                            {row.total} units
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isZero ? (
                              <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                                CRITICAL DEFICIT
                              </span>
                            ) : isLow ? (
                              <span style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                                LOW RESERVE
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                                SUFFICIENT
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Batches Table */}
            <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Active Inventory Batches
                  </h3>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                    Component shelf-life countdown and cold storage temperature compliance.
                  </p>
                </div>
              </div>

              {batches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <p style={{ fontWeight: 600 }}>No active inventory batches recorded.</p>
                  <p style={{ fontSize: 13 }}>Click "Register Blood Batch" above to record collected donor units.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Batch ID</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Group & Component</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Units / Vol</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Storage Vault</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Shelf Life</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>TTI Clearance</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                            {b.batch_number}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <BloodGroupBadge bloodGroup={b.blood_group} size="sm" />
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{b.component.toUpperCase()}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>
                            {b.units} units ({b.volume_ml} ml/unit)
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Thermometer size={14} color="#0284c7" />
                              <span>{b.storage_location}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {b.days_to_expiry <= 3 ? (
                              <span style={{ color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <AlertTriangle size={14} /> {b.days_to_expiry} days left
                              </span>
                            ) : (
                              <span style={{ color: '#16a34a', fontWeight: 600 }}>
                                {b.days_to_expiry} days left
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {b.is_cleared ? (
                              <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 4, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Check size={12} /> 5/5 Screened
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: 4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <X size={12} /> Quarantined
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                              padding: '3px 8px', borderRadius: 4,
                              background: b.status === 'available' ? '#f0fdf4' : '#fef2f2',
                              color: b.status === 'available' ? '#16a34a' : '#dc2626'
                            }}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: HOSPITAL REQUISITIONS */}
        {activeTab === 'requisitions' && (
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Incoming Hospital Requisitions
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                Review clinical requisitions, crossmatch availability, and dispatch cold-chain units.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {requisitions.map(req => {
                const isMhp = req.urgency === 'emergency_mhp';

                return (
                  <div
                    key={req.id}
                    style={{
                      border: isMhp ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: 12, padding: '20px',
                      background: isMhp ? '#fff5f5' : '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{req.hospital_name}</span>
                          {isMhp ? (
                            <span style={{ fontSize: 11, background: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>
                              EMERGENCY MHP (MASSIVE HEMORRHAGE)
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                              URGENT CLINICAL
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>
                          Patient Token: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>{req.patient_identifier}</span> • Doctor: {req.treating_physician}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <BloodGroupBadge bloodGroup={req.blood_group} size="sm" />
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                            {req.units_requested} Units {req.component.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          Crossmatch: <strong style={{ color: req.cross_match_status === 'compatible' ? '#16a34a' : '#d97706' }}>{req.cross_match_status.toUpperCase()}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, fontSize: 13, color: '#334155', marginBottom: 16 }}>
                      <strong>Indication:</strong> {req.clinical_indication}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Status: <strong style={{ color: req.status === 'dispatched' ? '#16a34a' : '#2563eb', textTransform: 'uppercase' }}>{req.status}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        {req.status === 'submitted' && (
                          <button
                            onClick={() => handleUpdateReqStatus(req.id, 'crossmatched', 'compatible')}
                            style={{
                              background: '#2563eb', color: 'white', border: 'none', borderRadius: 6,
                              padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            Mark Crossmatch Compatible
                          </button>
                        )}
                        {req.status !== 'dispatched' && req.status !== 'fulfilled' && (
                          <button
                            onClick={() => handleUpdateReqStatus(req.id, 'dispatched')}
                            style={{
                              background: '#16a34a', color: 'white', border: 'none', borderRadius: 6,
                              padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 6
                            }}
                          >
                            <Truck size={14} /> Dispatch Cold-Chain Box
                          </button>
                        )}
                        {req.status === 'dispatched' && (
                          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={16} /> Units Dispatched in Cold-Chain Box
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DONATION CAMPS */}
        {activeTab === 'camps' && (
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Scheduled Voluntary Donation Camps
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                Accredited blood donation drives organized in collaboration with corporate and community partners.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {camps.map(camp => (
                <div key={camp.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {camp.camp_name}
                    </h4>
                    <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                      {camp.status}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 10px' }}>
                    <strong>Venue:</strong> {camp.venue}
                  </p>

                  <div style={{ fontSize: 13, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    <div>📅 <strong>Schedule:</strong> {camp.start_date} to {camp.end_date.split(' ')[1]}</div>
                    <div>🎯 <strong>Target:</strong> {camp.target_units} voluntary units</div>
                    <div>📞 <strong>Contact:</strong> {camp.contact_person} ({camp.contact_phone})</div>
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '8px 12px', borderRadius: 6 }}>
                    NBTC Mobile Collection Team & Emergency Life-Support Ambulance Assigned
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: REGISTER BLOOD BATCH */}
        {showBatchModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div style={{
              background: 'white', borderRadius: 16, width: '100%', maxWidth: 560,
              maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Register Verified Blood Batch
                </h3>
                <button
                  onClick={() => setShowBatchModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRegisterBatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Blood Group *
                    </label>
                    <select
                      value={batchForm.blood_group}
                      onChange={e => setBatchForm({ ...batchForm, blood_group: e.target.value })}
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
                      value={batchForm.component}
                      onChange={e => {
                        const comp = e.target.value;
                        let expDays = 42;
                        if (comp === 'platelets') expDays = 5;
                        if (comp === 'whole_blood') expDays = 35;
                        if (comp === 'ffp' || comp === 'cryoprecipitate') expDays = 365;
                        setBatchForm({ ...batchForm, component: comp, expiry_days: expDays });
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    >
                      {COMPONENTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Units Collected *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={batchForm.units}
                      onChange={e => setBatchForm({ ...batchForm, units: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Volume (ml per unit) *
                    </label>
                    <input
                      type="number"
                      value={batchForm.volume_ml}
                      onChange={e => setBatchForm({ ...batchForm, volume_ml: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Storage Vault & Temperature Target
                  </label>
                  <input
                    type="text"
                    value={batchForm.storage_location}
                    onChange={e => setBatchForm({ ...batchForm, storage_location: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>

                {/* Mandatory TTI Screening Checkboxes */}
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={16} color="#16a34a" />
                    Mandatory TTI Screening Clearance (Drugs & Cosmetics Act)
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>
                    All 5 Transfusion-Transmitted Infection tests must be confirmed negative prior to clinical release.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={batchForm.tested_hiv}
                        onChange={e => setBatchForm({ ...batchForm, tested_hiv: e.target.checked })}
                      />
                      <span>HIV I & II (Non-Reactive)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={batchForm.tested_hbv}
                        onChange={e => setBatchForm({ ...batchForm, tested_hbv: e.target.checked })}
                      />
                      <span>Hepatitis B HBsAg (Negative)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={batchForm.tested_hcv}
                        onChange={e => setBatchForm({ ...batchForm, tested_hcv: e.target.checked })}
                      />
                      <span>Hepatitis C HCV (Negative)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={batchForm.tested_syphilis}
                        onChange={e => setBatchForm({ ...batchForm, tested_syphilis: e.target.checked })}
                      />
                      <span>Syphilis VDRL (Non-Reactive)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={batchForm.tested_malaria}
                        onChange={e => setBatchForm({ ...batchForm, tested_malaria: e.target.checked })}
                      />
                      <span>Malaria Parasite (Negative)</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#475569' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 20px', background: '#D62839', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Confirm & Store Batch
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
