import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, #F8FAFC 0%, #fff5f6 100%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #D62839, #8D1B2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(214,40,57,0.3)' }}>
            <Droplets size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#172033' }}>Reset Password</h1>
          <p style={{ color: '#64748B', fontSize: 15, marginTop: 6 }}>We'll send you a reset link</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#172033', marginBottom: 8 }}>Check Your Email</h3>
              <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                We've sent a password reset link to <strong>{email}</strong>.<br />
                (This is a demo — no email is actually sent)
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 10, padding: 14, background: '#f0f9ff', borderRadius: 10, marginBottom: 20, alignItems: 'flex-start' }}>
                <Mail size={16} color="#0369a1" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#0369a1', lineHeight: 1.6 }}>
                  Enter your registered email address. We'll send you a secure link to reset your password.
                </p>
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#64748B', fontSize: 13, textDecoration: 'none', marginTop: 16 }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
