import { Link } from 'react-router-dom';
import { Droplets, TrendingUp, Award, Clock, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, MapPin, Bell, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { achievements } from '../data/achievements';
import { getDonorLevel, getLevelProgress, getNextLevel } from '../utils/pointsCalculator';
import Avatar from '../components/common/Avatar';
import BloodGroupBadge from '../components/common/BloodGroupBadge';
import LevelBadge from '../components/common/LevelBadge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const donationChartData = [
  { month: 'Apr', donations: 1 },
  { month: 'May', donations: 0 },
  { month: 'Jun', donations: 1 },
  { month: 'Jul', donations: 1 },
  { month: 'Aug', donations: 0 },
  { month: 'Sep', donations: 0 },
  { month: 'Oct', donations: 1 },
];

export default function DonorDashboard() {
  const { user, toggleAvailability, addPoints } = useAuth();
  const { requests, updateRequestStatus } = useApp();

  if (!user) return null;

  const level = getDonorLevel(user.points);
  const nextLevel = getNextLevel(user.points);
  const progress = getLevelProgress(user.points);

  // Incoming requests for this donor
  const incomingRequests = requests.filter(r => r.donorId === user.id && r.status === 'pending');

  const earnedAchievements = achievements.filter(a => (user.achievements || []).includes(a.id));
  const lockedAchievements = achievements.filter(a => !(user.achievements || []).includes(a.id));

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar name={user.name} initials={user.initials} avatar={user.avatar} size={64} />
          <div>
            <p style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Welcome back,</p>
            <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#172033' }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <BloodGroupBadge group={user.bloodGroup} size="sm" />
              <LevelBadge points={user.points} compact />
              <span style={{ fontSize: 12, color: '#64748B' }}>{user.locality}, Bengaluru</span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#172033', margin: 0 }}>Donation Availability</p>
            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
              {user.available ? '✅ You appear in search results' : '⏸️ Hidden from search results'}
            </p>
          </div>
          <button
            id="donor-availability-toggle"
            onClick={toggleAvailability}
            className={`toggle ${user.available ? 'active' : ''}`}
            title="Toggle availability"
          />
        </div>
      </div>

      {/* Urgent disclaimer */}
      <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: '#92400e' }}>
          <strong>Health Advisory:</strong> Please ensure at least 56 days have passed since your last whole blood donation before donating again. Consult a certified blood bank or healthcare professional to confirm eligibility.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '🩸', label: 'Total Donations', value: user.totalDonations, color: '#D62839', bg: '#fff0f1' },
          { icon: '❤️', label: 'Lives Impacted', value: user.totalDonations * 3, color: '#EF4444', bg: '#fef2f2' },
          { icon: '⭐', label: 'Points Earned', value: user.points, color: '#D97706', bg: '#fffbeb' },
          { icon: level.icon, label: 'Donor Level', value: level.name, color: level.color, bg: level.bg },
          { icon: '🏅', label: 'Achievements', value: earnedAchievements.length, color: '#7C3AED', bg: '#f5f3ff' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'Plus Jakarta Sans' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Level Progress */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033' }}>Level Progress</h3>
            <Link to="/leaderboard" style={{ fontSize: 12, color: '#D62839', textDecoration: 'none', fontWeight: 600 }}>View Leaderboard →</Link>
          </div>
          <LevelBadge points={user.points} showProgress />
          {nextLevel && (
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 10, textAlign: 'center' }}>
              {nextLevel.min - user.points} more points to reach {nextLevel.name} {nextLevel.icon}
            </p>
          )}
        </div>

        {/* Donation Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033', marginBottom: 16 }}>Donation Activity</h3>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={donationChartData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} />
              <Area type="monotone" dataKey="donations" stroke="#D62839" fill="rgba(214,40,57,0.1)" strokeWidth={2} dot={{ fill: '#D62839', strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Incoming Requests */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033' }}>
              Incoming Requests
              {incomingRequests.length > 0 && (
                <span style={{ marginLeft: 8, background: '#D62839', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 12 }}>
                  {incomingRequests.length}
                </span>
              )}
            </h3>
            <Link to="/requests" style={{ fontSize: 12, color: '#D62839', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {incomingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
              <Bell size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>No pending requests right now</p>
            </div>
          ) : (
            incomingRequests.slice(0, 3).map(req => (
              <div key={req.id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#172033' }}>{req.senderName}</p>
                    <p style={{ fontSize: 12, color: '#64748B' }}>{req.hospital}</p>
                  </div>
                  <span className="blood-badge blood-badge-sm" style={{ width: 28, height: 28, fontSize: 9 }}>{req.bloodGroup}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => updateRequestStatus(req.id, 'accepted')} className="btn btn-success btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <CheckCircle size={13} /> Accept
                  </button>
                  <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Donations */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033' }}>Recent Donations</h3>
            <Link to="/donation-history" style={{ fontSize: 12, color: '#D62839', textDecoration: 'none', fontWeight: 600 }}>History →</Link>
          </div>
          {(user.donationHistory || []).slice(0, 4).map(d => (
            <div key={d.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                🩸
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#172033', margin: 0 }}>{d.hospital}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className="status-badge status-completed">Completed</span>
            </div>
          ))}
          {(!user.donationHistory || user.donationHistory.length === 0) && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
              <p style={{ fontSize: 13 }}>No donations recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033' }}>Achievements & Badges</h3>
          <Link to="/rewards" style={{ fontSize: 12, color: '#D62839', textDecoration: 'none', fontWeight: 600 }}>Rewards →</Link>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {achievements.map(badge => {
            const earned = (user.achievements || []).includes(badge.id);
            return (
              <div key={badge.id} className={`achievement-badge ${earned ? 'earned' : 'locked'}`} style={{ minWidth: 80 }}>
                <div style={{ fontSize: 28 }}>{badge.emoji}</div>
                <p style={{ fontSize: 11, fontWeight: 700, color: earned ? '#D62839' : '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>{badge.name}</p>
                {!earned && <p style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>Locked</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { to: '/find-donors', label: 'Find Donors', icon: '🔍', desc: 'Search as receiver' },
          { to: '/leaderboard', label: 'Leaderboard', icon: '🏆', desc: 'See your ranking' },
          { to: '/rewards', label: 'Rewards', icon: '🎁', desc: `${user.points} pts available` },
          { to: '/profile', label: 'My Profile', icon: '👤', desc: 'Edit your profile' },
        ].map((action, i) => (
          <Link key={i} to={action.to} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ padding: 18, cursor: 'pointer' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{action.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#172033', margin: 0 }}>{action.label}</p>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
