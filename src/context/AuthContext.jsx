import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEMO_ACCOUNTS = [
  {
    id: 'demo-user',
    email: 'demo@bloodbridge.in',
    password: 'demo1234',
    name: 'Demo User',
    bloodGroup: 'O+',
    phone: '9876543210',
    city: 'Bengaluru',
    locality: 'Koramangala',
    lat: 12.9352,
    lng: 77.6245,
    role: 'both',
    activeRole: 'donor',
    totalDonations: 7,
    points: 420,
    level: 'Silver',
    available: true,
    verified: true,
    initials: 'DU',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    joinedDate: '2023-01-15',
    achievements: ['first-drop', 'lifesaver', 'community-guardian'],
    donationHistory: [
      { id: 'my-dh001', date: '2024-10-01', hospital: 'Manipal Hospital', units: 1, status: 'completed' },
      { id: 'my-dh002', date: '2024-07-15', hospital: 'Apollo Hospital', units: 1, status: 'completed' },
      { id: 'my-dh003', date: '2024-04-20', hospital: 'Narayana Health', units: 1, status: 'completed' },
      { id: 'my-dh004', date: '2024-01-10', hospital: 'Fortis Hospital', units: 1, status: 'completed' },
      { id: 'my-dh005', date: '2023-10-05', hospital: 'Columbia Asia', units: 1, status: 'completed' },
      { id: 'my-dh006', date: '2023-07-18', hospital: 'Sakra World Hospital', units: 1, status: 'completed' },
      { id: 'my-dh007', date: '2023-04-22', hospital: 'Aster Hospital', units: 1, status: 'completed' },
    ],
    pointsHistory: [
      { id: 'ph001', event: 'blood_donation', label: 'Blood Donation', points: 100, date: '2024-10-01' },
      { id: 'ph002', event: 'blood_donation', label: 'Blood Donation', points: 100, date: '2024-07-15' },
      { id: 'ph003', event: 'blood_donation', label: 'Blood Donation', points: 100, date: '2024-04-20' },
      { id: 'ph004', event: 'milestone_5', label: 'Milestone: 5 Donations', points: 50, date: '2024-01-10' },
      { id: 'ph005', event: 'profile_complete', label: 'Profile Completed', points: 20, date: '2023-01-15' },
      { id: 'ph006', event: 'awareness_campaign', label: 'Awareness Campaign', points: 30, date: '2023-06-01' },
      { id: 'ph007', event: 'awareness_campaign', label: 'Awareness Campaign', points: 20, date: '2023-03-15' },
    ],
    bio: 'Passionate blood donor. Committed to saving lives through voluntary donation.',
    redeemedRewards: [],
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bb_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('bb_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Check demo accounts
    const demo = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (demo) {
      const userData = { ...demo };
      setUser(userData);
      localStorage.setItem('bb_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    // Check registered users in localStorage
    const registered = JSON.parse(localStorage.getItem('bb_registered_users') || '[]');
    const found = registered.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('bb_user', JSON.stringify(found));
      return { success: true, user: found };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (userData) => {
    const registered = JSON.parse(localStorage.getItem('bb_registered_users') || '[]');
    if (registered.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      role: 'both',
      activeRole: 'donor',
      totalDonations: 0,
      points: 20, // profile complete bonus
      level: 'Beginner',
      available: true,
      verified: false,
      initials: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      achievements: [],
      donationHistory: [],
      pointsHistory: [
        { id: 'ph-init', event: 'profile_complete', label: 'Profile Completed', points: 20, date: new Date().toISOString().split('T')[0] },
      ],
      bio: '',
      redeemedRewards: [],
      lat: 12.9716 + (Math.random() - 0.5) * 0.1,
      lng: 77.5946 + (Math.random() - 0.5) * 0.1,
    };
    registered.push(newUser);
    localStorage.setItem('bb_registered_users', JSON.stringify(registered));
    setUser(newUser);
    localStorage.setItem('bb_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bb_user');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('bb_user', JSON.stringify(updated));
    // Also update in registered users list
    const registered = JSON.parse(localStorage.getItem('bb_registered_users') || '[]');
    const idx = registered.findIndex(u => u.id === updated.id);
    if (idx !== -1) {
      registered[idx] = updated;
      localStorage.setItem('bb_registered_users', JSON.stringify(registered));
    }
    return updated;
  };

  const switchRole = (role) => {
    updateUser({ activeRole: role });
  };

  const toggleAvailability = () => {
    updateUser({ available: !user.available });
  };

  const addPoints = (points, event, label) => {
    const newHistory = [
      { id: `ph-${Date.now()}`, event, label, points, date: new Date().toISOString().split('T')[0] },
      ...(user.pointsHistory || []),
    ];
    updateUser({ points: (user.points || 0) + points, pointsHistory: newHistory });
  };

  const redeemReward = (rewardId, pointsCost) => {
    if (user.points < pointsCost) return false;
    const redeemed = [...(user.redeemedRewards || []), { rewardId, date: new Date().toISOString() }];
    updateUser({
      points: user.points - pointsCost,
      redeemedRewards: redeemed,
    });
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser,
      switchRole, toggleAvailability, addPoints, redeemReward,
      DEMO_ACCOUNTS,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
