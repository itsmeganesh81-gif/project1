import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Droplets, Menu, X, Bell, User, LogOut, Settings,
  Heart, Search, LayoutDashboard, Trophy, Gift, ClipboardList,
  Map, ChevronDown, History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = user ? [
    { to: user.activeRole === 'donor' ? '/donor-dashboard' : '/receiver-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/find-donors', label: 'Find Donors', icon: <Search size={16} /> },
    { to: '/map', label: 'Map', icon: <Map size={16} /> },
    { to: '/requests', label: 'Requests', icon: <ClipboardList size={16} /> },
    { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
    { to: '/rewards', label: 'Rewards', icon: <Gift size={16} /> },
  ] : [];

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #D62839, #8D1B2A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(214,40,57,0.3)',
          }}>
            <Droplets size={20} color="white" fill="white" />
          </div>
          <div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, color: '#172033' }}>Blood</span>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, color: '#D62839' }}>Bridge</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }} className="hide-mobile">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-item ${location.pathname === link.to ? 'active' : ''}`}
              style={{ fontSize: 13, padding: '7px 12px' }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {user ? (
            <>
              {/* Role switcher */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }} className="hide-mobile">
                <button
                  onClick={() => switchRole('receiver')}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: user.activeRole === 'receiver' ? 'white' : 'transparent',
                    color: user.activeRole === 'receiver' ? '#D62839' : '#64748B',
                    boxShadow: user.activeRole === 'receiver' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  🔍 Receiver
                </button>
                <button
                  onClick={() => switchRole('donor')}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: user.activeRole === 'donor' ? 'white' : 'transparent',
                    color: user.activeRole === 'donor' ? '#D62839' : '#64748B',
                    boxShadow: user.activeRole === 'donor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  🩸 Donor
                </button>
              </div>

              {/* User menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '6px 10px', cursor: 'pointer' }}
                >
                  <Avatar name={user.name} initials={user.initials} avatar={user.avatar} size={28} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#172033' }} className="hide-mobile">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} color="#64748B" />
                </button>
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    minWidth: 200, padding: 8,
                    animation: 'scaleIn 0.15s ease-out',
                    zIndex: 200,
                  }}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 6 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#172033' }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: '#64748B' }}>{user.email}</p>
                      <div style={{ marginTop: 6 }}>
                        <span style={{
                          background: '#fff0f1', color: '#D62839', fontSize: 11, fontWeight: 700,
                          padding: '2px 8px', borderRadius: 6,
                        }}>
                          {user.bloodGroup} • {user.points} pts
                        </span>
                      </div>
                    </div>
                    {[
                      { to: '/profile', label: 'My Profile', icon: <User size={15} /> },
                      { to: '/donation-history', label: 'Donation History', icon: <History size={15} /> },
                      { to: '/settings', label: 'Settings', icon: <Settings size={15} /> },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="nav-item"
                        style={{ display: 'flex', gap: 10, padding: '8px 12px' }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 6, paddingTop: 6 }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: 'none', fontSize: 14, fontWeight: 500, color: '#EF4444',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={15} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-ghost btn-icon hide-desktop"
            style={{ padding: 8 }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-item ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          {user && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => { switchRole('receiver'); setMenuOpen(false); }} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>🔍 Receiver</button>
              <button onClick={() => { switchRole('donor'); setMenuOpen(false); }} className="btn btn-primary btn-sm" style={{ flex: 1 }}>🩸 Donor</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
