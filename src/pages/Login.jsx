import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Droplets, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate(result.user.activeRole === 'donor' ? '/donor-dashboard' : '/receiver-dashboard');
    } else {
      setError(result.error);
    }
  };

  const fillDemo = () => setForm({ email: 'demo@bloodbridge.in', password: 'demo1234' });

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, #F8FAFC 0%, #fff5f6 100%)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #D62839, #8D1B2A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(214,40,57,0.3)',
          }}>
            <Droplets size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#172033' }}>Welcome Back</h1>
          <p style={{ color: '#64748B', fontSize: 15, marginTop: 6 }}>Sign in to your BloodBridge account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ display: 'flex', gap: 8, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <AlertCircle size={16} color="#D62839" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: '#991b1b' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#D62839', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: 15 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
            <div style={{ height: 1, background: '#e2e8f0', position: 'absolute', top: '50%', width: '100%' }} />
            <span style={{ background: 'white', padding: '0 12px', color: '#94a3b8', fontSize: 13, position: 'relative' }}>or</span>
          </div>

          {/* Demo account */}
          <button
            onClick={fillDemo}
            className="btn btn-ghost"
            id="demo-login"
            style={{ width: '100%', justifyContent: 'center', background: '#f8fafc' }}
          >
            🚀 Use Demo Account
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#D62839', fontWeight: 700, textDecoration: 'none' }}>Create one →</Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            Demo: demo@bloodbridge.in / demo1234
          </p>
        </div>
      </div>
    </div>
  );
}
