import { Link } from 'react-router-dom';
import { Heart, MapPin, Shield, Award, Users, TrendingUp, ArrowRight, CheckCircle, Star, ShieldCheck } from 'lucide-react';
import { mockDonors } from '../data/mockDonors';
import heroBannerImg from '../assets/blood_donation_hero.jpg';
import {
  BloodBridgeLogoIcon, BloodBankVaultIcon, HospitalClinicalIcon,
  SurplusExchangeIcon, RecurringTransfusionIcon, RarePhenotypeIcon,
  VolunteerCourierIcon, GrievanceSupportIcon, ClinicalMatchIcon
} from '../components/common/CustomIcons';
import { useLanguage } from '../context/LanguageContext';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function LandingPage() {
  const { t } = useLanguage();
  const featuredDonors = mockDonors.filter(d => d.level === 'Platinum').slice(0, 3);

  const stats = [
    { label: t('statRegisteredDonors'), value: '10,000+', icon: '👥' },
    { label: t('statLivesImpacted'), value: '25,000+', icon: '❤️' },
    { label: t('statCitiesCovered'), value: '15+', icon: '🏙️' },
    { label: t('statDonationsFacilitated'), value: '8,500+', icon: '🩸' },
  ];

  const featureCategories = [
    {
      category: t('pillar1Title'),
      badge: t('pillar1Badge'),
      items: [
        {
          icon: <BloodBankVaultIcon size={24} color="#C81E32" />,
          title: t('cardBloodBankTitle'),
          to: '/blood-bank',
          description: t('cardBloodBankDesc'),
        },
        {
          icon: <HospitalClinicalIcon size={24} color="#C81E32" />,
          title: t('cardHospitalTitle'),
          to: '/hospital',
          description: t('cardHospitalDesc'),
        },
        {
          icon: <SurplusExchangeIcon size={24} color="#C81E32" />,
          title: t('cardSurplusTitle'),
          to: '/surplus-board',
          description: t('cardSurplusDesc'),
        },
      ]
    },
    {
      category: t('pillar2Title'),
      badge: t('pillar2Badge'),
      items: [
        {
          icon: <RecurringTransfusionIcon size={24} color="#C81E32" />,
          title: t('cardRecurringTitle'),
          to: '/recurring-transfusions',
          description: t('cardRecurringDesc'),
        },
        {
          icon: <RarePhenotypeIcon size={24} color="#C81E32" />,
          title: t('cardRareTitle'),
          to: '/rare-network',
          description: t('cardRareDesc'),
        },
        {
          icon: <VolunteerCourierIcon size={24} color="#C81E32" />,
          title: t('cardVolunteerTitle'),
          to: '/volunteers',
          description: t('cardVolunteerDesc'),
        },
      ]
    },
    {
      category: t('pillar3Title'),
      badge: t('pillar3Badge'),
      items: [
        {
          icon: <GrievanceSupportIcon size={24} color="#C81E32" />,
          title: t('cardReviewsTitle'),
          to: '/reviews',
          description: t('cardReviewsDesc'),
        },
        {
          icon: <ClinicalMatchIcon size={24} color="#C81E32" />,
          title: t('cardMatchingTitle'),
          to: '/find-donors',
          description: t('cardMatchingDesc'),
        },
        {
          icon: <Award size={24} color="#C81E32" />,
          title: t('cardRewardsTitle'),
          to: '/rewards',
          description: t('cardRewardsDesc'),
        },
      ]
    }
  ];

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
              <span style={{ fontSize: 13, color: '#fca5a5', fontWeight: 600 }}>{t('heroBadge')}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 24 }}>
              {t('heroTitlePart1')}{' '}
              <span style={{ color: '#D62839', display: 'block' }}>{t('heroTitlePart2')}</span>
            </h1>

            <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.8, maxWidth: 520, marginBottom: 36 }}>
              {t('heroDescription')}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                {t('heroRegisterDonorBtn')} <ArrowRight size={18} />
              </Link>
              <Link to="/find-donors" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}>
                {t('heroFindDonorsBtn')}
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
              {[t('footerCompliance'), 'NBTC Certified', t('heroVerifiedDonorsBadge')].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={15} color="#10B981" />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Featured BloodBridge Poster Visual */}
          <div className="animate-float" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{
              position: 'relative',
              borderRadius: 32,
              overflow: 'hidden',
              boxShadow: '0 25px 60px -10px rgba(200, 30, 50, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.18)',
              maxWidth: 420,
              width: '100%',
              background: '#991B1B',
            }}>
              <img
                src={heroBannerImg}
                alt="Donate Blood, Save a Life - BloodBridge"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                  borderRadius: 32,
                }}
              />

              {/* Floating Top Badge */}
              <div style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(15, 23, 42, 0.78)',
                backdropFilter: 'blur(8px)',
                borderRadius: 9999,
                padding: '6px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                125+ {t('statRegisteredDonors')}
              </div>

              {/* Interactive Bottom Glass Bar */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: 20,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#172033' }}>
                    {t('appName')} 🩸
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    1 donation saves up to 3 lives
                  </div>
                </div>
                <Link
                  to="/find-donors"
                  className="template-pill-btn"
                  style={{ padding: '7px 16px', fontSize: 12 }}
                >
                  {t('heroFindDonorsBtn')} →
                </Link>
              </div>
            </div>

            {/* Quick Live Donors Pill Ticker Beneath Visual */}
            <div style={{
              display: 'flex',
              gap: 8,
              marginTop: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: 420,
            }}>
              {mockDonors.filter(d => d.available).slice(0, 3).map(donor => (
                <div
                  key={donor.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 9999,
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    color: '#FFFFFF',
                  }}
                >
                  <span style={{
                    background: '#C81E32', color: 'white', fontWeight: 900,
                    borderRadius: '50%', width: 18, height: 18, display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 9
                  }}>
                    {donor.bloodGroup}
                  </span>
                  <span>{donor.name.split(' ')[0]} ({donor.locality})</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                </div>
              ))}
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
            {t('urgentBloodGroupsTitle')}
          </h2>
          <p style={{ color: '#64748B', fontSize: 16, marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
            {t('urgentBloodGroupsSubtitle')}
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
                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 6, fontWeight: 600 }}>{t('navFindDonors')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categorized Features & Clinical Architecture */}
      <section style={{ padding: '80px 20px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              background: '#FFF1F2', color: '#C81E32', fontSize: 12, fontWeight: 800,
              padding: '4px 14px', borderRadius: 9999, border: '1px solid #FECDD3', textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {t('subTagline')}
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', color: '#172033', margin: '12px 0 8px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {t('tagline')}
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 620, margin: '0 auto' }}>
              {t('heroDescription')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {featureCategories.map((pillar, pIdx) => (
              <div key={pIdx}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#172033', margin: 0 }}>
                      {pillar.category}
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: '#E2E8F0', color: '#334155' }}>
                      {pillar.badge}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                  {pillar.items.map((f, i) => (
                    <div
                      key={i}
                      className="template-card"
                      style={{
                        padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        border: '1px solid #E2E8F0', background: '#FFFFFF'
                      }}
                    >
                      <div>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14,
                          background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 16, border: '1px solid #FFE4E6'
                        }}>
                          {f.icon}
                        </div>
                        <h4 style={{ fontSize: 17, fontWeight: 800, color: '#172033', marginBottom: 8 }}>
                          {f.title}
                        </h4>
                        <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                          {f.description}
                        </p>
                      </div>

                      <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                        <Link
                          to={f.to}
                          style={{
                            fontSize: 13, fontWeight: 800, color: '#C81E32', textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          {t('heroFindDonorsBtn')} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
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
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#172033' }}>{t('topHeroesTitle')}</h2>
              <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>{t('topHeroesSubtitle')}</p>
            </div>
            <Link to="/rewards" className="btn btn-secondary">{t('navRewards')}</Link>
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
                    🩸 {donor.totalDonations} {t('heroDonations')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12 }}>
                  <Star size={14} color="#D97706" fill="#D97706" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>{donor.points} {t('heroPoints')}</span>
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
            {t('heroTitlePart1')} {t('heroTitlePart2')}
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 36, lineHeight: 1.7 }}>
            {t('heroDescription')}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: '#D62839', fontWeight: 700 }}>
              {t('heroRegisterDonorBtn')} <ArrowRight size={18} />
            </Link>
            <Link to="/find-donors" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              {t('heroFindDonorsBtn')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
