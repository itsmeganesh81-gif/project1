import { useState } from 'react';
import { ArrowRight, CheckCircle, X } from 'lucide-react';
import { SurplusExchangeIcon } from '../components/common/CustomIcons';
import BloodGroupBadge from '../components/common/BloodGroupBadge';

export default function SurplusBoard() {
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [claimUnits, setClaimUnits] = useState(1);

  const [surplusListings, setSurplusListings] = useState([
    {
      id: 'batch-surplus-01',
      blood_bank_name: 'Indian Red Cross Blood Centre',
      locality: 'Race Course Road, Bengaluru Central',
      blood_group: 'B+',
      component: 'platelets',
      units: 2,
      volume_ml: 70,
      hours_to_expiry: 22,
      expiry_date: '2026-11-04 18:00',
      storage_temp_celsius: 22.0,
      storage_location: 'Platelet Agitator Chamber 2',
      is_cleared: true,
      status: 'available_for_transfer'
    },
    {
      id: 'batch-surplus-02',
      blood_bank_name: 'Victoria Hospital Blood Bank',
      locality: 'K.R. Road, Kalasipalya',
      blood_group: 'AB+',
      component: 'platelets',
      units: 1,
      volume_ml: 70,
      hours_to_expiry: 34,
      expiry_date: '2026-11-05 06:00',
      storage_temp_celsius: 22.0,
      storage_location: 'Agitator Unit 1',
      is_cleared: true,
      status: 'available_for_transfer'
    },
    {
      id: 'batch-surplus-03',
      blood_bank_name: 'Indian Red Cross Blood Centre',
      locality: 'Race Course Road, Bengaluru Central',
      blood_group: 'O-',
      component: 'whole_blood',
      units: 1,
      volume_ml: 450,
      hours_to_expiry: 72,
      expiry_date: '2026-11-06 20:00',
      storage_temp_celsius: 4.0,
      storage_location: 'Emergency Vault 3',
      is_cleared: true,
      status: 'available_for_transfer'
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setSurplusListings(surplusListings.map(b => {
      if (b.id === selectedBatch.id) {
        const remaining = b.units - claimUnits;
        return {
          ...b,
          units: remaining,
          status: remaining === 0 ? 'claimed' : 'available_for_transfer'
        };
      }
      return b;
    }).filter(b => b.units > 0));

    setSelectedBatch(null);
    showToast(`Claim confirmed! ${claimUnits} unit(s) reserved. Rapid cold-chain ambulance dispatched.`);
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
                background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700
              }}>
                <SurplusExchangeIcon size={16} color="#b91c1c" />
                <span>Zero-Wastage Initiative</span>
              </div>
              <span style={{ fontSize: 12, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                Inter-Hospital Exchange
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Near-Expiry Blood Alerts & Surplus Board
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
              Preventing life-saving blood discards through rapid inter-facility surgical reallocation.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Wastage Prevention Rate</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>98.4% Rescued</div>
          </div>
        </div>

        {/* Impact Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Active Surplus Listings</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {surplusListings.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>batches</span>
            </div>
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>Urgent reallocation window</div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Platelets Available (&le; 48h)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#b45309', marginTop: 4 }}>
              {surplusListings.filter(s => s.component === 'platelets').reduce((a, b) => a + b.units, 0)} units
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Priority for ICU dengue / oncology</div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total Units Rescued This Month</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>14 units</div>
            <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>Transfused into elective surgeries</div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Rapid Cold Chain Response</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>35 min</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Average transit across Bengaluru</div>
          </div>
        </div>

        {/* Listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {surplusListings.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: '48px 24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <CheckCircle size={36} color="#16a34a" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Zero Near-Expiry Wastage Risk</h3>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>All blood batches across regional centres currently hold optimal shelf life.</p>
            </div>
          ) : (
            surplusListings.map(listing => (
              <div
                key={listing.id}
                style={{
                  background: 'white', borderRadius: 12, padding: '24px',
                  border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <BloodGroupBadge bloodGroup={listing.blood_group} size="sm" />
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        {listing.units} Units of {listing.component.toUpperCase()} ({listing.volume_ml} ml/unit)
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4,
                        background: listing.hours_to_expiry <= 24 ? '#fee2e2' : '#fef3c7',
                        color: listing.hours_to_expiry <= 24 ? '#b91c1c' : '#b45309'
                      }}>
                        ⏱ {listing.hours_to_expiry} HOURS UNTIL EXPIRY
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      Held by: <strong>{listing.blood_bank_name}</strong> • {listing.locality}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBatch(listing);
                      setClaimUnits(1);
                    }}
                    style={{
                      background: '#16a34a', color: 'white', border: 'none', borderRadius: 8,
                      padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 6px rgba(22,163,74,0.3)'
                    }}
                  >
                    Claim for Surgical Transfusion <ArrowRight size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12, color: '#475569' }}>
                  <div>🌡️ <strong>Storage:</strong> {listing.storage_location} ({listing.storage_temp_celsius}°C)</div>
                  <div>✅ <strong>Safety:</strong> 100% Negative for 5 TTI Screenings (HIV, HBV, HCV, Syphilis, Malaria)</div>
                  <div>📅 <strong>Expires:</strong> {listing.expiry_date}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Claim Modal */}
        {selectedBatch && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
            <div style={{
              background: 'white', borderRadius: 16, width: '100%', maxWidth: 480,
              padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Confirm Surplus Reallocation
                </h3>
                <button onClick={() => setSelectedBatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleClaimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 13 }}>
                  <div><strong>Component:</strong> {selectedBatch.blood_group} {selectedBatch.component.toUpperCase()}</div>
                  <div><strong>Source:</strong> {selectedBatch.blood_bank_name}</div>
                  <div><strong>Remaining Shelf Life:</strong> {selectedBatch.hours_to_expiry} hours</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Units to Claim *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedBatch.units}
                    value={claimUnits}
                    onChange={e => setClaimUnits(parseInt(e.target.value, 10))}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>

                <div style={{ fontSize: 12, color: '#64748b', background: '#eff6ff', padding: 10, borderRadius: 6 }}>
                  Transfers are coordinated in calibrated cold boxes via the Volunteer Rapid Transit Network to guarantee cold-chain integrity.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedBatch(null)}
                    style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 18px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Authorize Claim
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
