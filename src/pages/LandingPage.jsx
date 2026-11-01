import { Link } from 'react-router-dom';
import { Heart, MapPin, Shield, Award, Users, TrendingUp, ArrowRight, CheckCircle, Droplets, Star } from 'lucide-react';
import { mockDonors } from '../data/mockDonors';

const stats = [
  { label: 'Registered Donors', value: '10,000+', icon: '👥' },
  { label: 'Lives Impacted', value: '25,000+', icon: '❤️' },
  { label: 'Cities Covered', value: '15+', icon: '🏙️' },
  { label: 'Donations Facilitated', value: '8,500+', icon: '🩸' },
];

const features = [
  {
    icon: <MapPin size={24} color="#D62839" />,
    title: 'Geo-Location Search',
    description: 'Find blood donors within your specified radius using an interactive map powered by real coordinates.',
  },
  {
    icon: <Shield size={24} color="#D62839" />,
    title: 'Verified Donors',
    description: 'Donors are verified through our community system, ensuring you connect with genuine volunteers.',
  },
  {
    icon: <Award size={24} color="#D62839" />,
    title: 'Gamification & Rewards',
    description: 'Donors earn points, badges, and levels for every donation. Redeem rewards from our marketplace.',
  },
  {
    icon: <TrendingUp size={24} color="#D62839" />,
    title: 'Leaderboards',
    description: 'City-wide and global leaderboards to celebrate our top donors and inspire others.',
  },
  {
    icon: <Users size={24} color="#D62839" />,
    title: 'Community Driven',
    description: 'A growing community of voluntary donors committed to saving lives across Bengaluru and beyond.',
  },
  {
    icon: <Heart size={24} color="#D62839" />,
    title: 'Emergency Requests',
    description: 'Send urgent blood requests directly to available donors with urgency-based priority levels.',
  },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function LandingPage() {
  const featuredDonors = mockDonors.filter(d => d.level === 'Platinum').slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #172033 0%, #2d1b33 50%, #1a0d1a 100%)',
        position: 'relative', overflow: 'hidden', padding: '80px 20px 100px',
        minHeight: '92vh', display: 'flex', alignItems: 'center',
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 70% 50%, rgba(214,40,57,0.15) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(214,40,57,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(214,40,57,0.06)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', width: '100%' }}>
          {/* Left */}
          <div className="animate-fadeIn">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(214,40,57,0.15)', border: '1px solid rgba(214,40,57,0.3)',
              borderRadius: 30, padding: '6px 16px', marginBottom: 24,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D62839', animation: 'pulse-red 2s infinite' }} />
              <span style={{ fontSize: 13, color: '#fca5a5', fontWeight: 600 }}>Bengaluru's #1 Blood Donation Platform</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 24 }}>
              Bridge the Gap Between{' '}
              <span style={{ color: '#D62839', display: 'block' }}>Life & Hope</span>
            </h1>

            <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.8, maxWidth: 520, marginBottom: 36 }}>
              Connect with voluntary blood donors in your city instantly. Whether you need blood urgently or want to save lives — BloodBridge makes it possible.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Join as Donor <ArrowRight size={18} />
              </Link>
              <Link to="/find-donors" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}>
                Find Blood Now
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
              {['Free to use', 'No registration for search', 'Verified donors'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={15} color="#10B981" />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Hero Card */}
          <div className="animate-float" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24,
              padding: 28, width: '100%', maxWidth: 360,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>🔴 Live Donors Nearby</span>
                <span style={{ background: '#10B981', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>LIVE</span>
              </div>

              {mockDonors.filter(d => d.available).slice(0, 4).map((donor, i) => (
                <div key={donor.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  marginBottom: 8, border: '1px solid rgba(255,255,255,0.08)',
                  animation: `fadeIn 0.4s ease-out ${i * 0.1}s both`,
                }}>
                  <div className="blood-badge blood-badge-sm">{donor.bloodGroup}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>{donor.name}</p>
                    <p style={{ color: '#64748B', fontSize: 11, margin: 0 }}>{donor.locality}</p>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                </div>
              ))}

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/find-donors" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: '#D62839', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                }}>
                  View all available donors <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#D62839', padding: '40px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }}>{stat.value}</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Blood Groups */}
      <section style={{ padding: '80px 20px', background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#172033', marginBottom: 12 }}>
            All Blood Groups, One Platform
          </h2>
          <p style={{ color: '#64748B', fontSize: 16, marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
            We have donors registered for every blood group. Search by your specific need.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {bloodGroups.map(bg => (
              <Link key={bg} to={`/find-donors?blood=${bg}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20,
                  background: 'linear-gradient(135deg, #fff0f1, #fee2e2)',
                  border: '2px solid rgba(214,40,57,0.15)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.25s',
                  boxShadow: '0 2px 8px rgba(214,40,57,0.08)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#D62839'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(214,40,57,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(214,40,57,0.15)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(214,40,57,0.08)'; }}
                >
                  <div className="blood-badge blood-badge-sm">{bg}</div>
                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 6, fontWeight: 600 }}>Donors</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 20px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#172033', marginBottom: 12 }}>
              Everything You Need, In One Place
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              BloodBridge combines emergency blood discovery with a rewarding donation experience.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card card-hover" style={{ padding: 28 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: '#fff0f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#172033', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Donors */}
      <section style={{ padding: '80px 20px', background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#172033' }}>Community Heroes</h2>
              <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Our top Platinum-level donors making a difference</p>
            </div>
            <Link to="/leaderboard" className="btn btn-secondary">View Leaderboard</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {featuredDonors.map((donor, i) => (
              <div key={donor.id} className="card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 16 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fff0f1, #fee2e2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, fontWeight: 800, color: '#D62839',
                    border: '3px solid rgba(214,40,57,0.2)',
                  }}>
                    {donor.initials}
                  </div>
                  <div style={{ position: 'absolute', top: -4, right: -4, background: '#fef3c7', borderRadius: '50%', padding: 4, border: '2px solid white', fontSize: 12 }}>
                    💎
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172033', marginBottom: 4 }}>{donor.name}</h3>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>{donor.locality}</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <div className="blood-badge blood-badge-sm">{donor.bloodGroup}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748B' }}>
                    🩸 {donor.totalDonations} donations
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12 }}>
                  <Star size={14} color="#D97706" fill="#D97706" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>{donor.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #D62839 0%, #8D1B2A 100%)',
        padding: '80px 20px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🩸</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', color: 'white', marginBottom: 16 }}>
            Ready to Save a Life?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of voluntary donors on BloodBridge. Earn rewards, track your impact, and be someone's hero.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: '#D62839', fontWeight: 700 }}>
              Register as Donor <ArrowRight size={18} />
            </Link>
            <Link to="/find-donors" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              Find Blood Now
            </Link>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 24 }}>
            Demo credentials: demo@bloodbridge.in / demo1234
          </p>
        </div>
      </section>
    </div>
  );
}
