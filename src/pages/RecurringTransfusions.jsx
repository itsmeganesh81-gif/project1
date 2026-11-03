import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Heart, Shield, Plus, CheckCircle, AlertTriangle,
  User, Building, Activity, ArrowRight, Droplets, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import BloodGroupBadge from '../components/common/BloodGroupBadge';
import { RecurringTransfusionIcon } from '../components/common/CustomIcons';

export default function RecurringTransfusions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'donor_circle'
  const [loading, setLoading] = useState(false);

  // Patient & Attendant state
  const [patientProfile, setPatientProfile] = useState({
    patient_name: 'Rahul Varma (Age 11)',
    condition_type: 'thalassemia_major',
    blood_group: 'B+',
    hospital_name: 'Manipal Hospital Whitefield',
    treating_physician: 'Dr. Sunita Rao (Pediatric Hematology)',
    hospital_patient_id: 'CR-2024-THAL-091',
  });

  const [activeSchedule, setActiveSchedule] = useState({
    id: 'sched-001',
    frequency_days: 21,
    component: 'PRBC (Packed Red Cells)',
    units_per_cycle: 1,
    last_transfusion_date: '2026-10-18',
    next_due_date: '2026-11-08',
    days_until_due: 5,
    hospital_name: 'Manipal Hospital Whitefield',
    status: 'active',
  });

  const [transfusionHistory, setTransfusionHistory] = useState([
    {
      id: 'th-01',
      date: '2026-10-18',
      units: 1,
      hospital: 'Manipal Hospital Whitefield',
      pre_hb: 7.8,
      post_hb: 10.4,
      status: 'Completed',
    },
    {
      id: 'th-02',
      date: '2026-09-27',
      units: 1,
      hospital: 'Manipal Hospital Whitefield',
      pre_hb: 7.5,
      post_hb: 10.2,
      status: 'Completed',
    },
    {
      id: 'th-03',
      date: '2026-09-06',
      units: 1,
      hospital: 'Manipal Hospital Whitefield',
      pre_hb: 7.9,
      post_hb: 10.6,
      status: 'Completed',
    },
  ]);

  // Donor circle public needs (anonymized)
  const [publicNeeds, setPublicNeeds] = useState([
    {
      schedule_id: 'pn-01',
      blood_group: 'B+',
      component: 'PRBC',
      units: 1,
      hospital_name: 'Manipal Hospital Whitefield',
      next_due_date: '2026-11-08',
      days_left: 5,
      pledged_donors: 2,
    },
    {
      schedule_id: 'pn-02',
      blood_group: 'O+',
      component: 'PRBC',
      units: 2,
      hospital_name: 'Narayana Health, HSR Layout',
      next_due_date: '2026-11-12',
      days_left: 9,
      pledged_donors: 1,
    },
    {
      schedule_id: 'pn-03',
      blood_group: 'A-',
      component: 'Platelets (SDP)',
      units: 1,
      hospital_name: 'Apollo Hospital Bannerghatta',
      next_due_date: '2026-11-15',
      days_left: 12,
      pledged_donors: 0,
    },
  ]);

  const [showLogModal, setShowLogModal] = useState(false);
  const [newTransfusion, setNewTransfusion] = useState({
    date: new Date().toISOString().split('T')[0],
    units: 1,
    hospital: 'Manipal Hospital Whitefield',
    pre_hb: 7.6,
    post_hb: 10.5,
    notes: '',
  });

  const [pledgedSuccess, setPledgedSuccess] = useState(null);

  const handleLogTransfusion = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `th-${Date.now()}`,
      date: newTransfusion.date,
      units: Number(newTransfusion.units),
      hospital: newTransfusion.hospital,
      pre_hb: Number(newTransfusion.pre_hb),
      post_hb: Number(newTransfusion.post_hb),
      status: 'Completed',
    };

    setTransfusionHistory([newEntry, ...transfusionHistory]);

    // Advance schedule by 21 days
    const nextDate = new Date(newTransfusion.date);
    nextDate.setDate(nextDate.getDate() + activeSchedule.frequency_days);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    setActiveSchedule({
      ...activeSchedule,
      last_transfusion_date: newTransfusion.date,
      next_due_date: nextDateStr,
      days_until_due: activeSchedule.frequency_days,
    });

    setShowLogModal(false);
  };

  const handlePledgeSupport = (need) => {
    setPledgedSuccess(need.schedule_id);
    setPublicNeeds(publicNeeds.map(n =>
      n.schedule_id === need.schedule_id ? { ...n, pledged_donors: n.pledged_donors + 1 } : n
    ));
    setTimeout(() => setPledgedSuccess(null), 4000);
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 20, padding: '4px 12px', marginBottom: 8 }}>
            <RecurringTransfusionIcon size={16} color="#2563EB" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8' }}>Thalassemia & Sickle Cell Patient Support</span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#172033', margin: 0, fontWeight: 900 }}>
            Recurring Transfusion Coordination
          </h1>
          <p style={{ color: '#64748B', fontSize: 14, margin: '6px 0 0' }}>
            Empowering patients, families and committed donor support circles for predictable, life-saving transfusions
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, gap: 4 }}>
          <button
            onClick={() => setActiveTab('patient')}
            style={{
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              background: activeTab === 'patient' ? 'white' : 'transparent',
              color: activeTab === 'patient' ? '#2563EB' : '#64748B',
              boxShadow: activeTab === 'patient' ? '0 2px 6px rgba(37,99,235,0.15)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <User size={15} />
            Patient & Attendant Hub
          </button>
          <button
            onClick={() => setActiveTab('donor_circle')}
            style={{
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              background: activeTab === 'donor_circle' ? 'white' : 'transparent',
              color: activeTab === 'donor_circle' ? '#D62839' : '#64748B',
              boxShadow: activeTab === 'donor_circle' ? '0 2px 6px rgba(214,40,57,0.15)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Heart size={15} />
            Community Donor Circles
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner (DPDP Act Compliance) */}
      <div style={{
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12,
        padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center'
      }}>
        <Shield size={20} color="#059669" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: '#334155' }}>
          <strong>Medical Privacy Guarantee:</strong> In strict compliance with India's DPDP Act, clinical diagnoses (e.g., Thalassemia Major) and personal identities are kept confidential and are never shared with voluntary donors. Donors only see the required blood component and hospital location.
        </span>
      </div>

      {activeTab === 'patient' ? (
        <div>
          {/* Active Schedule Overview Card */}
          <div className="card" style={{ padding: 24, marginBottom: 24, borderLeft: '4px solid #2563EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#172033', margin: 0 }}>
                    {patientProfile.patient_name}
                  </h2>
                  <BloodGroupBadge group={patientProfile.blood_group} size="sm" />
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: '#FEF3C7', color: '#B45309' }}>
                    Thalassemia Major Protocol
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                  Hospital: <strong>{patientProfile.hospital_name}</strong> • MRN: <code>{patientProfile.hospital_patient_id}</code>
                </p>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                  Treating Physician: {patientProfile.treating_physician}
                </p>
              </div>

              {/* Countdown Pill */}
              <div style={{
                background: activeSchedule.days_until_due <= 5 ? '#FEF2F2' : '#EFF6FF',
                border: `1px solid ${activeSchedule.days_until_due <= 5 ? '#FECACA' : '#BFDBFE'}`,
                borderRadius: 12, padding: '12px 18px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: activeSchedule.days_until_due <= 5 ? '#DC2626' : '#2563EB' }}>
                  {activeSchedule.days_until_due} Days
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Until Next Transfusion
                </span>
              </div>
            </div>

            {/* Cycle Details Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1F5F9'
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, display: 'block' }}>CYCLE FREQUENCY</span>
                <strong style={{ fontSize: 14, color: '#1E293B' }}>Every {activeSchedule.frequency_days} Days</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, display: 'block' }}>COMPONENT REQUIRED</span>
                <strong style={{ fontSize: 14, color: '#1E293B' }}>{activeSchedule.component}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, display: 'block' }}>TARGET UNITS</span>
                <strong style={{ fontSize: 14, color: '#1E293B' }}>{activeSchedule.units_per_cycle} Unit(s) Leuko-reduced</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, display: 'block' }}>NEXT DUE DATE</span>
                <strong style={{ fontSize: 14, color: '#2563EB' }}>{activeSchedule.next_due_date}</strong>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowLogModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} /> Log Completed Transfusion
              </button>
              <button
                onClick={() => setActiveTab('donor_circle')}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Heart size={14} color="#D62839" /> View Committed Donors
              </button>
            </div>
          </div>

          {/* Transfusion History Log */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#172033', margin: 0 }}>
                  Clinical Transfusion History & Hemoglobin Log
                </h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                  Tracking pre-transfusion nadir Hb and post-transfusion increment
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>
                {transfusionHistory.length} Cycles Recorded
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>DATE</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>UNITS</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>PRE-HB (g/dL)</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>POST-HB (g/dL)</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>INCREMENT</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>HOSPITAL</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {transfusionHistory.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', background: index % 2 === 0 ? 'white' : '#FAFAFA' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B' }}>{item.date}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{item.units} Unit PRBC</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#DC2626' }}>{item.pre_hb} g/dL</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#16A34A' }}>{item.post_hb} g/dL</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563EB' }}>
                        +{(item.post_hb - item.pre_hb).toFixed(1)} g/dL
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748B' }}>{item.hospital}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: '#DCFCE7', color: '#15803D' }}>
                          ✓ {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Donor Circle View */
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#172033', margin: 0 }}>
              Community Donor Support Circles
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
              Pledge voluntary blood support for patients requiring regular lifelong transfusions. One pledge brings certainty and hope.
            </p>
          </div>

          {pledgedSuccess && (
            <div style={{
              background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: 10,
              padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <CheckCircle size={18} color="#16A34A" />
              <span style={{ fontSize: 13, color: '#15803D', fontWeight: 700 }}>
                Thank you! Your pledge has been registered for this upcoming transfusion date. You will receive a coordination reminder 3 days prior.
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gap: 16 }}>
            {publicNeeds.map(need => (
              <div key={need.schedule_id} className="card" style={{ padding: 20, borderLeft: '4px solid #D62839' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BloodGroupBadge group={need.blood_group} size="md" />
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#172033' }}>
                        {need.units} Unit {need.component} Needed
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#EFF6FF', color: '#2563EB' }}>
                        Recurring Schedule
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8, flexWrap: 'wrap', fontSize: 13, color: '#64748B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building size={14} color="#D62839" />
                        <span>{need.hospital_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={14} color="#2563EB" />
                        <span>Due Date: <strong>{need.next_due_date}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Heart size={14} color="#D62839" />
                        <span>{need.pledged_donors} Pledged Volunteer(s)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: need.days_left <= 5 ? '#DC2626' : '#2563EB' }}>
                        {need.days_left} Days
                      </span>
                      <span style={{ display: 'block', fontSize: 10, color: '#64748B', fontWeight: 600 }}>REMAINING</span>
                    </div>

                    <button
                      onClick={() => handlePledgeSupport(need)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Heart size={14} /> Pledge Regular Support
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Completed Transfusion Modal */}
      {showLogModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#172033', marginBottom: 6 }}>
              Log Completed Transfusion
            </h3>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }}>
              Records will update the patient's schedule and roll forward to the next cycle.
            </p>

            <form onSubmit={handleLogTransfusion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Transfusion Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newTransfusion.date}
                  onChange={e => setNewTransfusion({ ...newTransfusion, date: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Pre-Transfusion Hb (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={newTransfusion.pre_hb}
                    onChange={e => setNewTransfusion({ ...newTransfusion, pre_hb: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Post-Transfusion Hb (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={newTransfusion.post_hb}
                    onChange={e => setNewTransfusion({ ...newTransfusion, post_hb: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Administered Hospital</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTransfusion.hospital}
                  onChange={e => setNewTransfusion({ ...newTransfusion, hospital: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save & Advance Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

