import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, Camera, Upload, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, BANGALORE_LOCALITIES, SAMPLE_AVATARS } from '../data/mockDonors';
import { BloodBridgeLogoIcon } from '../components/common/CustomIcons';

const steps = ['Account & Photo', 'Personal Info', 'Location'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '', // Base64 data URL or preset URL
    phone: '',
    bloodGroup: '',
    city: 'Bengaluru',
    locality: '',
  });

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        update('avatar', loadEvent.target.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return 'Full name is required';
      if (!form.email.includes('@')) return 'Valid email is required';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
    }
    if (step === 1) {
      if (!form.phone || form.phone.length < 10) return 'Valid phone number is required';
      if (!form.bloodGroup) return 'Please select your blood group';
    }
    if (step === 2) {
      if (!form.locality) return 'Please select your locality';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    if (step < 2) { setStep(s => s + 1); return; }
    // Final step - register
    handleRegister();
  };

  const handleRegister = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // If no avatar was chosen, assign a random one from SAMPLE_AVATARS
    const submissionForm = {
      ...form,
      avatar: form.avatar || SAMPLE_AVATARS[Math.floor(Math.random() * SAMPLE_AVATARS.length)],
    };
    const result = register(submissionForm);
    setLoading(false);
    if (result.success) {
      navigate('/donor-dashboard');
    } else {
      setError(result.error);
      setStep(0);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', background: 'linear-gradient(135deg, #F8FAFC 0%, #fff5f6 100%)' }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #C81E32, #88111F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(200,30,50,0.3)',
            border: '3px solid #FFFFFF'
          }}>
            <BloodBridgeLogoIcon size={30} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#172033', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Join BloodBridge</h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Create your verified donor or recipient profile</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 4, borderRadius: 2, background: i <= step ? '#D62839' : '#e2e8f0', transition: 'background 0.3s' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: i <= step ? '#D62839' : '#94a3b8', textAlign: 'center' }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#991b1b' }}>
              {error}
            </div>
          )}

          {/* Step 0: Account & Photo Upload */}
          {step === 0 && (
            <div className="animate-fadeIn">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Create Your Account</h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
                Set your login credentials and profile picture
              </p>

              {/* Profile Picture Upload Section */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: 16,
                padding: '16px 18px',
                marginBottom: 20,
              }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#172033', marginBottom: 10 }}>
                  Profile Picture
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Photo Preview Circle */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 68,
                      height: 68,
                      minWidth: 68,
                      borderRadius: '50%',
                      background: form.avatar ? 'none' : '#fee2e2',
                      border: '2px solid #D62839',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    title="Click to upload picture"
                  >
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt="Profile Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Camera size={26} color="#D62839" />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 8,
                          background: 'white',
                          border: '1px solid #cbd5e1',
                          color: '#1e293b',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Upload size={13} /> {form.avatar ? 'Change Photo' : 'Upload Photo'}
                      </button>

                      {form.avatar && (
                        <button
                          type="button"
                          onClick={() => update('avatar', '')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            background: '#fee2e2',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <X size={13} /> Remove
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0' }}>
                      PNG, JPG or WebP (max 5MB). Visible to matched seekers.
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

                {/* Quick Avatar Presets */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                    Or select a sample photo:
                  </span>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {SAMPLE_AVATARS.slice(0, 6).map((pic, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => update('avatar', pic)}
                        style={{
                          width: 38,
                          height: 38,
                          minWidth: 38,
                          borderRadius: '50%',
                          border: form.avatar === pic ? '2.5px solid #D62839' : '1.5px solid #cbd5e1',
                          padding: 0,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transform: form.avatar === pic ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <img src={pic} alt={`preset-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form inputs */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Full Name *</label>
                <input id="reg-name" className="form-input" placeholder="e.g. Arjun Sharma" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Email Address *</label>
                <input id="reg-email" type="email" className="form-input" placeholder="e.g. arjun@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input id="reg-password" type={showPwd ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password *</label>
                <input type="password" className="form-input" placeholder="Repeat your password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Personal Information</h2>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Phone Number *</label>
                <input id="reg-phone" type="tel" className="form-input" placeholder="9876543210" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Blood Group *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {BLOOD_GROUPS.map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => update('bloodGroup', bg)}
                      style={{
                        padding: '10px 6px', borderRadius: 10, border: `2px solid ${form.bloodGroup === bg ? '#D62839' : '#e2e8f0'}`,
                        background: form.bloodGroup === bg ? '#fff0f1' : 'white',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div className={`blood-badge blood-badge-sm`} style={{ width: 28, height: 28, fontSize: 9 }}>{bg}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: form.bloodGroup === bg ? '#D62839' : '#64748B' }}>{bg}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 12 }}>
                <p style={{ fontSize: 12, color: '#0369a1', lineHeight: 1.6 }}>
                  ℹ️ Your blood group will be used to match you with compatible receivers. Please ensure it's accurate.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your Location</h2>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">City</label>
                <input className="form-input" value="Bengaluru" disabled style={{ background: '#f8fafc', color: '#64748B' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Locality / Area *</label>
                <select id="reg-locality" className="form-input form-select" value={form.locality} onChange={e => update('locality', e.target.value)}>
                  <option value="">Select your locality</option>
                  {BANGALORE_LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>You're almost done!</p>
                    <p style={{ fontSize: 12, color: '#059669', lineHeight: 1.6 }}>
                      Your exact address is never shared. Only your approximate locality is visible to receivers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); setError(''); }} className="template-pill-btn-outline" style={{ flex: 1 }}>
                Back
              </button>
            )}
            <button
              id="register-next"
              onClick={handleNext}
              className="template-pill-btn"
              style={{ flex: 2, padding: '12px 24px' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : step === 2 ? '🩸 Create Account' : 'Continue →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 16 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C81E32', fontWeight: 800, textDecoration: 'none' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
