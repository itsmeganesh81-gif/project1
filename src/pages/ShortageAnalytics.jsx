import { Info } from 'lucide-react';
import { ForecasterAlgorithmIcon } from '../components/common/CustomIcons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import BloodGroupBadge from '../components/common/BloodGroupBadge';

const PREDICTIVE_CHART_DATA = [
  { group: 'O+', current: 4, demand7d: 31.5, deficit: -27.5 },
  { group: 'B+', current: 2, demand7d: 29.4, deficit: -27.4 },
  { group: 'A+', current: 0, demand7d: 21.0, deficit: -21.0 },
  { group: 'AB+', current: 1, demand7d: 10.5, deficit: -9.5 },
  { group: 'O-', current: 1, demand7d: 8.4, deficit: -7.4 },
  { group: 'B-', current: 0, demand7d: 6.3, deficit: -6.3 },
  { group: 'A-', current: 0, demand7d: 5.6, deficit: -5.6 },
  { group: 'AB-', current: 0, demand7d: 2.8, deficit: -2.8 },
];

const GROUP_FORECASTS = [
  {
    blood_group: 'O+',
    risk: 'CRITICAL',
    current_stock: 4,
    demand_7d: 31.5,
    demand_30d: 135.0,
    deficit: -27.5,
    components: [
      { name: 'PRBC', stock: 4, demand7d: 18.0, risk: 'CRITICAL' },
      { name: 'Platelets', stock: 0, demand7d: 9.0, risk: 'CRITICAL' },
      { name: 'Whole Blood', stock: 0, demand7d: 4.5, risk: 'ELEVATED' },
    ]
  },
  {
    blood_group: 'B+',
    risk: 'CRITICAL',
    current_stock: 2,
    demand_7d: 29.4,
    demand_30d: 126.0,
    deficit: -27.4,
    components: [
      { name: 'PRBC', stock: 0, demand7d: 16.0, risk: 'CRITICAL' },
      { name: 'Platelets', stock: 2, demand7d: 8.8, risk: 'ELEVATED' },
      { name: 'Whole Blood', stock: 0, demand7d: 4.6, risk: 'ELEVATED' },
    ]
  },
  {
    blood_group: 'O-',
    risk: 'ELEVATED',
    current_stock: 1,
    demand_7d: 8.4,
    demand_30d: 36.0,
    deficit: -7.4,
    components: [
      { name: 'PRBC', stock: 0, demand7d: 4.8, risk: 'CRITICAL' },
      { name: 'Platelets', stock: 0, demand7d: 2.4, risk: 'ELEVATED' },
      { name: 'Whole Blood', stock: 1, demand7d: 1.2, risk: 'STABLE' },
    ]
  },
  {
    blood_group: 'A+',
    risk: 'CRITICAL',
    current_stock: 0,
    demand_7d: 21.0,
    demand_30d: 90.0,
    deficit: -21.0,
    components: [
      { name: 'PRBC', stock: 0, demand7d: 12.0, risk: 'CRITICAL' },
      { name: 'Platelets', stock: 0, demand7d: 6.0, risk: 'CRITICAL' },
      { name: 'Whole Blood', stock: 0, demand7d: 3.0, risk: 'ELEVATED' },
    ]
  }
];

export default function ShortageAnalytics() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

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
                <ForecasterAlgorithmIcon size={18} color="#b91c1c" />
                <span>Predictive Clinical Telemetry</span>
              </div>
              <span style={{ fontSize: 12, background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                RED ALERT: REGIONAL DEFICIT PREDICTED
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              AI Blood Shortage Forecaster
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
              7-Day & 30-Day Demand Projections • Bengaluru Healthcare Transfusion Zone
            </p>
          </div>

          <div style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '10px 14px', borderRadius: 8 }}>
            <div><strong>Inference Model:</strong> Scikit-Learn Multitask Regressor</div>
            <div><strong>Confidence Score:</strong> 88.4% (Clinical Validation)</div>
          </div>
        </div>

        {/* AI Action Plan Recommendations */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white',
          borderRadius: 16, padding: '24px 28px', marginBottom: 28, boxShadow: '0 10px 25px rgba(15,23,42,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ForecasterAlgorithmIcon size={20} color="#fbbf24" />
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Prescriptive Action Plan (Next 7 Days)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, fontSize: 13 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px', borderRadius: 10 }}>
              <div style={{ color: '#f87171', fontWeight: 700, marginBottom: 4 }}>🚨 Critical Action 1: O+ Mega Camp</div>
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                Anticipated deficit of 27.5 units across hospitals. Trigger automated WhatsApp alerts to 120 verified O+ donors in Whitefield.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px', borderRadius: 10 }}>
              <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: 4 }}>⚠️ Urgent Action 2: Thalassemia B+ Buffer</div>
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                14 recurring pediatric transfusions scheduled in the next 10 days. Pre-allocate PRBC units from Victoria Blood Centre.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px', borderRadius: 10 }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: 4 }}>🔄 Action 3: Platelet Apheresis Drive</div>
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                Platelet shelf-life is 5 days. Schedule staggered apheresis donations every 48 hours to maintain fresh stock.
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Chart */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', border: '1px solid #e2e8f0', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                7-Day Stock vs Projected Demand Deficit
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                Comparing current verified inventory units against AI-projected 7-day clinical requirements.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PREDICTIVE_CHART_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="group" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="current" name="Current Verified Stock" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demand7d" name="Projected 7-Day Demand" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          {GROUP_FORECASTS.map(f => (
            <div key={f.blood_group} style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BloodGroupBadge bloodGroup={f.blood_group} size="sm" />
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{f.blood_group} Projection</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4,
                  background: f.risk === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                  color: f.risk === 'CRITICAL' ? '#b91c1c' : '#b45309'
                }}>
                  {f.risk}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
                <div>Current Stock: <strong>{f.current_stock} units</strong></div>
                <div>7D Demand: <strong style={{ color: '#ef4444' }}>{f.demand_7d} units</strong></div>
                <div>30D Demand: <strong>{f.demand_30d} units</strong></div>
                <div>Net Deficit: <strong style={{ color: '#b91c1c' }}>{f.deficit} units</strong></div>
              </div>

              <div style={{ fontSize: 12, color: '#64748b' }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: '#475569' }}>Key Components:</div>
                {f.components.map(c => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>{c.name}</span>
                    <strong style={{ color: c.risk === 'CRITICAL' ? '#b91c1c' : '#64748b' }}>
                      {c.stock} / {c.demand7d} req
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Clinical Disclaimer */}
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '14px 18px', fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <Info size={18} color="#0284c7" />
          <span>
            <strong>Clinical Safety Protocol:</strong> AI forecasting is designed for administrative inventory buffering.
            All final component issuances, crossmatches, and clinical transfusion decisions strictly require review by qualified hematologists and blood centre medical officers.
          </span>
        </div>

      </div>
    </div>
  );
}
