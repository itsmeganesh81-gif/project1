import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, KeyRound } from 'lucide-react';
import { BloodBridgeLogoIcon } from '../components/common/CustomIcons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
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
      {/* Smartphone Card Container (Screen 8 from Template) */}
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
        }}>
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
            Forgot Password?
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Enter your registered email to reset your credentials
          </p>
        </div>

        {/* Circular Key Icon Anchor */}
        <div style={{ textAlign: 'center', marginTop: -32, position: 'relative', zIndex: 10 }}>
          <div className="template-avatar-ring" style={{
            width: 68, height: 68, background: '#FFFFFF',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <KeyRound size={26} color="#C81E32" />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px 36px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#DCFCE7', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #BBF7D0'
              }}>
                <CheckCircle size={32} color="#15803D" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#172033', marginBottom: 8 }}>
                Check Your Inbox
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
                A password reset confirmation link has been dispatched to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="template-pill-btn" style={{ width: '100%', padding: '12px 24px' }}>
                <ArrowLeft size={16} /> Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="template-bio-box" style={{ padding: 14 }}>
                <p style={{ fontSize: 12, color: '#991B1B', margin: 0, lineHeight: 1.5 }}>
                  Did you forget your password? Enter your email address below to receive an authenticated reset link.
                </p>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  style={{ borderRadius: 9999, padding: '12px 20px', fontSize: 13 }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="template-pill-btn"
                style={{ width: '100%', padding: '13px 24px', fontSize: 14, marginTop: 8 }}
                disabled={loading}
              >
                {loading ? 'Sending Link...' : 'Submit Reset Request'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Link
                  to="/login"
                  style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
