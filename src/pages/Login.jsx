import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BloodBridgeLogoIcon } from '../components/common/CustomIcons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 500));
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      const role = result.user.activeRole;
      if (role === 'hospital_admin') navigate('/hospital');
      else if (role === 'blood_bank_admin') navigate('/blood-bank');
      else if (role === 'donor') navigate('/donor-dashboard');
      else navigate('/receiver-dashboard');
    } else {
      setError(result.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const fillQuickRole = (email, pwd) => {
    setForm({ email, password: pwd });
    setError('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      background: 'linear-gradient(180deg, #FDF2F2 0%, #FFFFFF 100%)',
    }}>
      {/* Smartphone Card Container (Screen 6 from Template) */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: '#FFFFFF',
        borderRadius: 36,
        boxShadow: '0 20px 50px rgba(200, 30, 50, 0.12), 0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        border: '1px solid #FEE2E2',
      }}>
        {/* Curved Crimson Header (Template Exact) */}
        <div className="template-crimson-header" style={{
          padding: '36px 28px 48px',
          textAlign: 'center',
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          position: 'relative',
        }}>
          {/* Brand Logo & Stethoscope Motif */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
            border: '2px solid rgba(255, 255, 255, 0.35)',
          }}>
            <BloodBridgeLogoIcon size={30} color="#FFFFFF" />
          </div>

          <h1 style={{
            fontSize: 24, fontWeight: 900, color: '#FFFFFF',
            margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            Welcome Sign In
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Access clinical blood networks & patient donor matching
          </p>
        </div>

        {/* Circular Avatar / Badge Anchor */}
        <div style={{ textAlign: 'center', marginTop: -32, position: 'relative', zIndex: 10 }}>
          <div className="template-avatar-ring" style={{
            width: 68, height: 68, background: '#FFFFFF',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={28} color="#C81E32" />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px 28px 36px' }}>
          {error && (
            <div style={{
              background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 14,
              padding: '12px 14px', marginBottom: 20, fontSize: 12, color: '#991B1B', fontWeight: 600
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email Field */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                Email Address / Mobile
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ borderRadius: 9999, padding: '12px 20px', fontSize: 13 }}
                  placeholder="name@bloodbridge.in"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: 11, fontWeight: 700, color: '#C81E32', textDecoration: 'none' }}
                >
                  Forgot Password?
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  style={{ borderRadius: 9999, padding: '12px 48px 12px 20px', fontSize: 13 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8'
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Signature Crimson Pill CTA Button */}
            <button
              type="submit"
              className="template-pill-btn"
              style={{ width: '100%', padding: '13px 24px', fontSize: 14, marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to BloodBridge'}
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', textAlign: 'center', marginBottom: 10 }}>
              Quick 1-Click Demo Login
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: '🩸 Donor', email: 'donor@bloodbridge.in', pwd: 'donor123' },
                { label: '🏥 Hospital', email: 'hospital@bloodbridge.in', pwd: 'hospital123' },
                { label: '🏦 Blood Bank', email: 'bloodbank@bloodbridge.in', pwd: 'bloodbank123' },
                { label: '🛡️ Admin', email: 'admin@bloodbridge.in', pwd: 'admin123' },
              ].map(d => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => fillQuickRole(d.email, d.pwd)}
                  style={{
                    padding: '5px 12px', borderRadius: 9999,
                    border: '1px solid #FECDD3', background: '#FFF1F2',
                    fontSize: 11, fontWeight: 700, color: '#991B1B', cursor: 'pointer'
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Register Prompt */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>Don't have an account? </span>
            <Link to="/register" style={{ fontSize: 13, fontWeight: 800, color: '#C81E32', textDecoration: 'none' }}>
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
