import { useState, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Droplets, Shield, Award, Calendar,
  Edit2, Check, CheckCircle, Clock, Heart, AlertCircle, ToggleLeft, ToggleRight, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BLOOD_GROUPS, BANGALORE_LOCALITIES, SAMPLE_AVATARS } from '../data/mockDonors';
import { achievements } from '../data/achievements';
import { getDonorLevel, getLevelProgress, getNextLevel } from '../utils/pointsCalculator';
import Avatar from '../components/common/Avatar';
import BloodGroupBadge from '../components/common/BloodGroupBadge';
import LevelBadge from '../components/common/LevelBadge';

export default function Profile() {
  const { user, updateUser, toggleAvailability } = useAuth();
  const { showToast } = useApp();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || 'O+',
    city: user?.city || 'Bengaluru',
    locality: user?.locality || 'Koramangala',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Please log in to view your profile</h2>
        <a href="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Login</a>
      </div>
    );
  }

  const level = getDonorLevel(user.points || 0);
  const nextLevel = getNextLevel(user.points || 0);
  const progress = getLevelProgress(user.points || 0);

  const earnedAchievements = achievements.filter(a => (user.achievements || []).includes(a.id));
  const lockedAchievements = achievements.filter(a => !(user.achievements || []).includes(a.id));

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target.result;
        setFormData(f => ({ ...f, avatar: dataUrl }));
        updateUser({ avatar: dataUrl });
        showToast('Profile picture updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      phone: formData.phone,
      bloodGroup: formData.bloodGroup,
      city: formData.city,
      locality: formData.locality,
      bio: formData.bio,
      avatar: formData.avatar,
    });
    setIsEditing(false);
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Top Banner & Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #172033 0%, #2b1228 100%)',
        borderRadius: 20,
        padding: '36px 32px',
        color: 'white',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={user.name} initials={user.initials} avatar={formData.avatar || user.avatar} size={88} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: '50%',
                background: '#D62839', border: '2px solid white',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
              title="Upload new profile picture"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{user.name}</h1>
              {user.verified && (
                <span style={{
                  background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)',
                  color: '#4ade80', fontSize: 12, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Shield size={13} /> Verified Donor
                </span>
              )}
              <LevelBadge level={level} size="sm" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#94a3b8', fontSize: 13, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} color="#D62839" /> {user.locality}, {user.city}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} /> Joined {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2023'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Droplets size={14} color="#ef4444" /> Blood Group: <strong style={{ color: 'white' }}>{user.bloodGroup}</strong>
              </span>
            </div>

            {user.bio && (
              <p style={{ color: '#cbd5e1', fontSize: 13, marginTop: 10, fontStyle: 'italic', maxWidth: 600 }}>
                "{user.bio}"
              </p>
            )}
          </div>

          {/* Quick Action Button */}
          <div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
                background: isEditing ? '#D62839' : 'rgba(255,255,255,0.1)',
                color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Edit2 size={15} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        {/* Left Column: Details & Edit Form */}
        <div>
          {/* Availability Card */}
          <div style={{
            background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0',
            marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033', margin: '0 0 4px' }}>
                Emergency Donation Availability
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                {user.available
                  ? 'Your profile appears in search results and you can receive urgent alerts.'
                  : 'You are currently resting or unavailable for blood donation requests.'}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: user.available ? '#16a34a' : '#94a3b8',
                display: 'flex', alignItems: 'center',
              }}
              title="Toggle availability"
            >
              {user.available ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
            </button>
          </div>

          {/* User Details / Edit Form */}
          <div style={{
            background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#172033', marginBottom: 20 }}>
              {isEditing ? 'Edit Profile Information' : 'Personal Details'}
            </h3>

            {isEditing ? (
              <form onSubmit={handleSave}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      Blood Group
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 600 }}
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      Locality
                    </label>
                    <select
                      value={formData.locality}
                      onChange={e => setFormData({ ...formData, locality: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    >
                      {BANGALORE_LOCALITIES.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Bio & Motivation
                  </label>
                  <textarea
                    rows="3"
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, resize: 'vertical' }}
                    placeholder="Tell receivers why voluntary donation is important to you..."
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #D62839, #b91c1c)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748B', fontSize: 13 }}>Email Address</span>
                  <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748B', fontSize: 13 }}>Phone Number</span>
                  <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{user.phone || '+91 98765 43210'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748B', fontSize: 13 }}>Blood Group</span>
                  <BloodGroupBadge bloodGroup={user.bloodGroup} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748B', fontSize: 13 }}>Primary Locality</span>
                  <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{user.locality}, {user.city}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: 13 }}>Active Role</span>
                  <span style={{ fontWeight: 700, color: '#D62839', fontSize: 13, textTransform: 'capitalize' }}>{user.activeRole}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Gamification, Badges & History */}
        <div>
          {/* Gamification Progress Box */}
          <div style={{
            background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0',
            marginBottom: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Donor Impact Score</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#D62839' }}>{user.points || 0}</span>
                  <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Points</span>
                </div>
              </div>
              <LevelBadge level={level} size="md" />
            </div>

            {nextLevel && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 6 }}>
                  <span>Progress to {nextLevel.name}</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #D62839, #f59e0b)', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'right' }}>
                  {nextLevel.min - (user.points || 0)} pts needed for {nextLevel.name}
                </div>
              </div>
            )}
          </div>

          {/* Earned Badges */}
          <div style={{
            background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0',
            marginBottom: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033', margin: 0 }}>
                Achievements & Badges ({earnedAchievements.length})
              </h3>
              <a href="/rewards" style={{ fontSize: 12, color: '#D62839', textDecoration: 'none', fontWeight: 600 }}>
                Rewards Store →
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
              {earnedAchievements.map(a => (
                <div
                  key={a.id}
                  style={{
                    background: '#fef2f2',
                    borderRadius: 12,
                    padding: 12,
                    textAlign: 'center',
                    border: '1px solid #fee2e2',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{a.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#172033' }}>{a.title}</div>
                  <div style={{ fontSize: 10, color: '#D62839', fontWeight: 600, marginTop: 2 }}>+{a.points} pts</div>
                </div>
              ))}
              {lockedAchievements.slice(0, 2).map(a => (
                <div
                  key={a.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: 12,
                    padding: 12,
                    textAlign: 'center',
                    border: '1px dashed #cbd5e1',
                    opacity: 0.6,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 4, filter: 'grayscale(100%)' }}>{a.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>{a.title}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Locked</div>
                </div>
              ))}
            </div>
          </div>

          {/* Donation History */}
          <div style={{
            background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033', marginBottom: 16 }}>
              Recent Donation History ({user.donationHistory?.length || 0})
            </h3>

            {(user.donationHistory && user.donationHistory.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {user.donationHistory.map(dh => (
                  <div
                    key={dh.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', background: '#f8fafc', borderRadius: 10,
                      border: '1px solid #e2e8f0', fontSize: 13,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{dh.hospital}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{dh.date} • {dh.units} Unit</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7',
                      padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <CheckCircle size={11} /> Verified
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No verified donations recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
