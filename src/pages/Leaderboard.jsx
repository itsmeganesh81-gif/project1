import { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { mockDonors } from '../data/mockDonors';
import { useAuth } from '../context/AuthContext';
import LevelBadge from '../components/common/LevelBadge';
import BloodGroupBadge from '../components/common/BloodGroupBadge';
import Avatar from '../components/common/Avatar';

const TABS = [
  { id: 'global', label: 'Global', icon: '🌐' },
  { id: 'monthly', label: 'Monthly', icon: '📅' },
  { id: 'city', label: 'City', icon: '🏙️' },
];

const CITIES = ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'Hebbal'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('global');
  const [selectedCity, setSelectedCity] = useState('Koramangala');

  const getLeaderboard = () => {
    if (tab === 'monthly') {
      return [...mockDonors]
        .filter(d => d.lastDonated >= '2024-10-01')
        .sort((a, b) => b.totalDonations - a.totalDonations)
        .map((d, i) => ({ ...d, rank: i + 1 }));
    }
    if (tab === 'city') {
      return [...mockDonors]
        .filter(d => d.locality === selectedCity)
        .sort((a, b) => b.points - a.points)
        .map((d, i) => ({ ...d, rank: i + 1 }));
    }
    return [...mockDonors]
      .sort((a, b) => b.points - a.points)
      .map((d, i) => ({ ...d, rank: i + 1 }));
  };

  const leaderboard = getLeaderboard();

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} color="#D97706" fill="#D97706" />;
    if (rank === 2) return <Medal size={20} color="#94a3b8" />;
    if (rank === 3) return <Medal size={20} color="#B45309" />;
    return <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', minWidth: 20, textAlign: 'center' }}>#{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'linear-gradient(135deg, #fffbeb, #fef3c7)';
    if (rank === 2) return 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
    if (rank === 3) return 'linear-gradient(135deg, #fff7ed, #fed7aa)';
    return 'white';
  };

  // Find current user's rank
  const userRank = leaderboard.findIndex(d => d.id === user?.id) + 1;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#172033', marginBottom: 8 }}>Donor Leaderboard</h1>
        <p style={{ color: '#64748B', fontSize: 15 }}>Celebrating our community heroes who save lives through voluntary blood donation</p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-end', marginBottom: 40 }}>
          {/* 2nd */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
            <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 8 }}>
              <Avatar name={leaderboard[1].name} initials={leaderboard[1].initials} avatar={leaderboard[1].avatar} size={64} />
              <div style={{ position: 'absolute', top: -8, right: -8, background: '#94a3b8', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', fontSize: 12, fontWeight: 800, color: 'white' }}>2</div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>{leaderboard[1].name.split(' ')[0]}</p>
            <p style={{ fontSize: 11, color: '#64748B' }}>{leaderboard[1].points} pts</p>
            <div style={{ height: 80, background: 'linear-gradient(180deg, #e2e8f0, #cbd5e1)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 24 }}>🥈</span>
            </div>
          </div>

          {/* 1st */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: 200 }}>
            <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 8 }}>
              <Avatar name={leaderboard[0].name} initials={leaderboard[0].initials} avatar={leaderboard[0].avatar} size={80} />
              <div style={{ position: 'absolute', top: -10, right: -10, background: '#D97706', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', fontSize: 14, fontWeight: 800, color: 'white' }}>1</div>
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#172033' }}>{leaderboard[0].name.split(' ')[0]}</p>
            <p style={{ fontSize: 12, color: '#D97706', fontWeight: 700 }}>{leaderboard[0].points} pts</p>
            <div style={{ height: 110, background: 'linear-gradient(180deg, #fef3c7, #fde68a)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 32 }}>👑</span>
            </div>
          </div>

          {/* 3rd */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
            <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 8 }}>
              <Avatar name={leaderboard[2].name} initials={leaderboard[2].initials} avatar={leaderboard[2].avatar} size={64} />
              <div style={{ position: 'absolute', top: -8, right: -8, background: '#B45309', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', fontSize: 12, fontWeight: 800, color: 'white' }}>3</div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>{leaderboard[2].name.split(' ')[0]}</p>
            <p style={{ fontSize: 11, color: '#64748B' }}>{leaderboard[2].points} pts</p>
            <div style={{ height: 60, background: 'linear-gradient(180deg, #fed7aa, #fdba74)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 20 }}>🥉</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              background: tab === t.id ? 'white' : 'transparent',
              color: tab === t.id ? '#D62839' : '#64748B',
              boxShadow: tab === t.id ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'city' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {CITIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${selectedCity === c ? '#D62839' : '#e2e8f0'}`,
                background: selectedCity === c ? '#D62839' : 'white',
                color: selectedCity === c ? 'white' : '#64748B',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Your rank */}
      {user && userRank > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fff0f1, #fff)', border: '2px solid rgba(214,40,57,0.2)', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <TrendingUp size={18} color="#D62839" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#172033' }}>
            Your current rank: <strong style={{ color: '#D62839' }}>#{userRank}</strong> with <strong>{user.points}</strong> points
          </span>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Rank', 'Donor', 'Blood Group', 'Locality', 'Donations', 'Points', 'Level'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(donor => {
                const isCurrentUser = donor.id === user?.id;
                return (
                  <tr key={donor.id} style={{
                    background: isCurrentUser ? 'linear-gradient(135deg, #fff0f1, #fff)' : (donor.rank <= 3 ? getRankBg(donor.rank) : 'white'),
                    borderBottom: '1px solid #f1f5f9',
                    border: isCurrentUser ? '2px solid rgba(214,40,57,0.3)' : 'none',
                    transition: 'background 0.2s',
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getRankIcon(donor.rank)}
                        {isCurrentUser && <span style={{ fontSize: 10, background: '#D62839', color: 'white', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>YOU</span>}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={donor.name} initials={donor.initials} avatar={donor.avatar} size={36} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#172033', margin: 0 }}>{donor.name}</p>
                          {donor.verified && <p style={{ fontSize: 11, color: '#10B981', margin: 0, fontWeight: 600 }}>✓ Verified</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><BloodGroupBadge group={donor.bloodGroup} size="sm" /></td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{donor.locality}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#172033' }}>🩸 {donor.totalDonations}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#D97706' }}>⭐ {donor.points}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <LevelBadge points={donor.points} compact />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <p>No donors in this category yet.</p>
        </div>
      )}
    </div>
  );
}
