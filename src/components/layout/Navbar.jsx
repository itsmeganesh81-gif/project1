import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  Menu, X, User, LogOut, Settings,
  Search, LayoutDashboard, ChevronDown, Mic, History
} from 'lucide-react';
import {
  BloodBridgeLogoIcon, BloodBankVaultIcon, HospitalClinicalIcon,
  VolunteerCourierIcon, SurplusExchangeIcon,
  RecurringTransfusionIcon, RarePhenotypeIcon, GrievanceSupportIcon
} from '../common/CustomIcons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import VoiceAssistantModal from '../voice/VoiceAssistantModal';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'clinical' | 'care' | null
  const [voiceOpen, setVoiceOpen] = useState(false);

  const clinicalRef = useRef(null);
  const careRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        clinicalRef.current && !clinicalRef.current.contains(event.target) &&
        careRef.current && !careRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 1. Clinical Network Group
  const clinicalLinks = [
    {
      to: '/blood-bank',
      label: t('bloodBank'),
      desc: 'Component inventory, TTI test clearance & batch vaults',
      icon: <BloodBankVaultIcon size={20} color="#C81E32" />
    },
    {
      to: '/hospital',
      label: t('hospital'),
      desc: 'Clinical blood requisitions & Massive Hemorrhage Protocol',
      icon: <HospitalClinicalIcon size={20} color="#C81E32" />
    },
    {
      to: '/surplus-board',
      label: t('surplusBoard'),
      desc: 'Near-expiry zero-wastage exchange board (Platelets & PRBC)',
      icon: <SurplusExchangeIcon size={20} color="#C81E32" />
    },
  ];

  // 2. Specialized Care Group
  const careLinks = [
    {
      to: '/recurring-transfusions',
      label: t('recurringCare'),
      desc: 'Thalassemia & Sickle Cell cycles, nadir Hb & donor circles',
      icon: <RecurringTransfusionIcon size={20} color="#C81E32" />
    },
    {
      to: '/rare-network',
      label: t('rareBlood'),
      desc: 'Bombay Phenotype (hh), Rh-Null & Immunohematology registry',
      icon: <RarePhenotypeIcon size={20} color="#C81E32" />
    },
    {
      to: '/volunteers',
      label: t('volunteers'),
      desc: 'Cold-chain rapid courier dispatch & sample transport',
      icon: <VolunteerCourierIcon size={20} color="#C81E32" />
    },
  ];

  const isClinicalActive = clinicalLinks.some(l => location.pathname === l.to);
  const isCareActive = careLinks.some(l => location.pathname === l.to);

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 64 }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            filter: 'drop-shadow(0 2px 6px rgba(200,30,50,0.3))'
          }}>
            <BloodBridgeLogoIcon size={32} />
          </div>
          <div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, color: '#172033' }}>Blood</span>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, color: '#C81E32' }}>Bridge</span>
          </div>
        </Link>

        {/* Organized Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hide-mobile">
          {/* Direct: Dashboard */}
          {user && (
            <Link
              to={user.activeRole === 'donor' ? '/donor-dashboard' : '/receiver-dashboard'}
              className={`nav-item ${location.pathname.includes('dashboard') ? 'active' : ''}`}
              style={{ fontSize: 13, padding: '8px 14px', borderRadius: 9999, fontWeight: 700 }}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
          )}

          {/* Direct: Find Donors */}
          <Link
            to="/find-donors"
            className={`nav-item ${location.pathname === '/find-donors' ? 'active' : ''}`}
            style={{ fontSize: 13, padding: '8px 14px', borderRadius: 9999, fontWeight: 700 }}
          >
            <Search size={15} />
            {t('findDonors')}
          </Link>

          {/* Categorized Dropdown 1: Clinical Network */}
          <div
            ref={clinicalRef}
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('clinical')}
          >
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'clinical' ? null : 'clinical')}
              className={`nav-item ${isClinicalActive ? 'active' : ''}`}
              style={{
                fontSize: 13, padding: '8px 14px', borderRadius: 9999, fontWeight: 700,
                border: 'none', background: isClinicalActive ? '#FFF1F2' : 'transparent',
                color: isClinicalActive ? '#C81E32' : '#64748B', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6
              }}
            >
              <HospitalClinicalIcon size={15} color={isClinicalActive ? '#C81E32' : '#64748B'} />
              Clinical Network
              <ChevronDown size={14} style={{ transform: activeDropdown === 'clinical' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {activeDropdown === 'clinical' && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                style={{
                  position: 'absolute', top: '100%', left: 0, width: 340,
                  background: 'white', borderRadius: 20, padding: 10,
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
                  marginTop: 6, zIndex: 200, animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <div style={{ padding: '6px 12px 10px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hospitals & Blood Vaults
                </div>
                {clinicalLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setActiveDropdown(null)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px',
                      borderRadius: 14, textDecoration: 'none', transition: 'background 0.2s',
                      background: location.pathname === link.to ? '#FFF1F2' : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF5F6'}
                    onMouseLeave={e => e.currentTarget.style.background = location.pathname === link.to ? '#FFF1F2' : 'transparent'}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, background: '#FFF1F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {link.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#172033' }}>{link.label}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{link.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Categorized Dropdown 2: Specialized Care */}
          <div
            ref={careRef}
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('care')}
          >
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'care' ? null : 'care')}
              className={`nav-item ${isCareActive ? 'active' : ''}`}
              style={{
                fontSize: 13, padding: '8px 14px', borderRadius: 9999, fontWeight: 700,
                border: 'none', background: isCareActive ? '#FFF1F2' : 'transparent',
                color: isCareActive ? '#C81E32' : '#64748B', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6
              }}
            >
              <RecurringTransfusionIcon size={15} color={isCareActive ? '#C81E32' : '#64748B'} />
              Specialized Care
              <ChevronDown size={14} style={{ transform: activeDropdown === 'care' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {activeDropdown === 'care' && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                style={{
                  position: 'absolute', top: '100%', left: 0, width: 340,
                  background: 'white', borderRadius: 20, padding: 10,
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
                  marginTop: 6, zIndex: 200, animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <div style={{ padding: '6px 12px 10px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Lifeline Patient Networks
                </div>
                {careLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setActiveDropdown(null)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px',
                      borderRadius: 14, textDecoration: 'none', transition: 'background 0.2s',
                      background: location.pathname === link.to ? '#FFF1F2' : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF5F6'}
                    onMouseLeave={e => e.currentTarget.style.background = location.pathname === link.to ? '#FFF1F2' : 'transparent'}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, background: '#FFF1F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {link.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#172033' }}>{link.label}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{link.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Direct: Reviews & Grievance Support */}
          <Link
            to="/reviews"
            className={`nav-item ${location.pathname === '/reviews' ? 'active' : ''}`}
            style={{ fontSize: 13, padding: '8px 14px', borderRadius: 9999, fontWeight: 700 }}
          >
            <GrievanceSupportIcon size={15} />
            {t('reviewsAndSupport')}
          </Link>
        </nav>

        {/* Right side: Language, Voice Assistant & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {/* Language Switcher Pill */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 9999, padding: 3, gap: 2 }}>
            <button
              onClick={() => changeLanguage('en')}
              style={{
                border: 'none', background: lang === 'en' ? 'white' : 'transparent',
                padding: '4px 9px', borderRadius: 9999, fontSize: 11, fontWeight: 800,
                color: lang === 'en' ? '#C81E32' : '#64748b', cursor: 'pointer',
                boxShadow: lang === 'en' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('kn')}
              style={{
                border: 'none', background: lang === 'kn' ? 'white' : 'transparent',
                padding: '4px 9px', borderRadius: 9999, fontSize: 11, fontWeight: 800,
                color: lang === 'kn' ? '#C81E32' : '#64748b', cursor: 'pointer',
                boxShadow: lang === 'kn' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              style={{
                border: 'none', background: lang === 'hi' ? 'white' : 'transparent',
                padding: '4px 9px', borderRadius: 9999, fontSize: 11, fontWeight: 800,
                color: lang === 'hi' ? '#C81E32' : '#64748b', cursor: 'pointer',
                boxShadow: lang === 'hi' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              हिन्दी
            </button>
          </div>

          {/* Hands-free Voice Assistant Button */}
          <button
            onClick={() => setVoiceOpen(true)}
            title="BloodBridge Hands-Free Voice Assistant"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#FFF1F2', color: '#C81E32', border: '1px solid #FECDD3',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(200,30,50,0.15)', transition: 'all 0.2s'
            }}
          >
            <Mic size={17} />
          </button>

          {/* User Profile or Auth Buttons */}
          {user ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2
                }}
              >
                <div style={{ border: '2px solid #C81E32', borderRadius: '50%', padding: 1 }}>
                  <Avatar name={user.name} initials={user.initials} avatar={user.avatar} size={34} />
                </div>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', width: 230,
                  background: 'white', borderRadius: 20, padding: 10,
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18)',
                  marginTop: 8, zIndex: 200, border: '1px solid #F1F5F9'
                }}>
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#172033' }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{user.email}</div>
                    <span style={{
                      display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 800,
                      background: '#FFF1F2', color: '#C81E32', padding: '2px 8px', borderRadius: 9999
                    }}>
                      🩸 {user.bloodGroup} • {user.points || 0} pts
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="nav-item"
                    style={{ padding: '8px 12px', fontSize: 13 }}
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <Link
                    to="/rewards"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="nav-item"
                    style={{ padding: '8px 12px', fontSize: 13 }}
                  >
                    🏆 Rewards & Badges
                  </Link>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 4, paddingTop: 4 }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'none', fontSize: 13, fontWeight: 700, color: '#EF4444'
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="template-pill-btn-outline" style={{ fontSize: 12, padding: '7px 16px' }}>
                Log In
              </Link>
              <Link to="/register" className="template-pill-btn" style={{ fontSize: 12, padding: '7px 18px' }}>
                Join Us
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-ghost btn-icon hide-desktop"
            style={{ padding: 6, borderRadius: 9999 }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Categorized Mobile Drawer Navigation */}
      {menuOpen && (
        <div style={{
          background: 'white', borderTop: '1px solid #e2e8f0', padding: '16px 20px 24px',
          display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '80vh', overflowY: 'auto'
        }}>
          {user && (
            <Link
              to={user.activeRole === 'donor' ? '/donor-dashboard' : '/receiver-dashboard'}
              className="nav-item active"
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard size={16} /> My Dashboard
            </Link>
          )}

          <Link to="/find-donors" className="nav-item" onClick={() => setMenuOpen(false)}>
            <Search size={16} /> {t('findDonors')}
          </Link>

          {/* Mobile Category 1: Clinical Network */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
              Clinical Network
            </span>
            {clinicalLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-item"
                style={{ padding: '8px 10px' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Category 2: Specialized Care */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
              Specialized Care
            </span>
            {careLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-item"
                style={{ padding: '8px 10px' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Category 3: Support */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
              Support & Community
            </span>
            <Link to="/reviews" className="nav-item" onClick={() => setMenuOpen(false)}>
              <GrievanceSupportIcon size={16} /> {t('reviewsAndSupport')}
            </Link>
            <Link to="/rewards" className="nav-item" onClick={() => setMenuOpen(false)}>
              🏆 Rewards & Badges
            </Link>
          </div>
        </div>
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </header>
  );
}
