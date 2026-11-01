export const achievements = [
  {
    id: 'first-drop',
    name: 'First Drop',
    description: 'Made your first blood donation',
    icon: '🩸',
    emoji: '🩸',
    requiredDonations: 1,
    points: 0,
  },
  {
    id: 'lifesaver',
    name: 'Lifesaver',
    description: 'Completed 5 blood donations',
    icon: '❤️',
    emoji: '❤️',
    requiredDonations: 5,
    points: 0,
  },
  {
    id: 'hero-donor',
    name: 'Hero Donor',
    description: 'Completed 10 blood donations',
    icon: '⭐',
    emoji: '⭐',
    requiredDonations: 10,
    points: 0,
  },
  {
    id: 'blood-champion',
    name: 'Blood Champion',
    description: 'Completed 20 blood donations',
    icon: '🏅',
    emoji: '🏅',
    requiredDonations: 20,
    points: 0,
  },
  {
    id: 'community-guardian',
    name: 'Community Guardian',
    description: 'Active community participant',
    icon: '🛡️',
    emoji: '🛡️',
    requiredDonations: 0,
    points: 300,
  },
];

export const DONOR_LEVELS = [
  { name: 'Beginner', min: 0, max: 99, color: '#6B7280', bg: '#F3F4F6', icon: '🌱' },
  { name: 'Bronze', min: 100, max: 299, color: '#B45309', bg: '#FEF3C7', icon: '🥉' },
  { name: 'Silver', min: 300, max: 599, color: '#475569', bg: '#F1F5F9', icon: '🥈' },
  { name: 'Gold', min: 600, max: 999, color: '#D97706', bg: '#FFFBEB', icon: '🥇' },
  { name: 'Platinum', min: 1000, max: Infinity, color: '#7C3AED', bg: '#F5F3FF', icon: '💎' },
];

export const getDonorLevel = (points) => {
  return DONOR_LEVELS.find(l => points >= l.min && points <= l.max) || DONOR_LEVELS[0];
};

export const getNextLevel = (points) => {
  const currentIndex = DONOR_LEVELS.findIndex(l => points >= l.min && points <= l.max);
  return currentIndex < DONOR_LEVELS.length - 1 ? DONOR_LEVELS[currentIndex + 1] : null;
};

export const getLevelProgress = (points) => {
  const current = DONOR_LEVELS.find(l => points >= l.min && points <= l.max);
  if (!current) return 100;
  if (current.max === Infinity) return 100;
  const range = current.max - current.min;
  const progress = points - current.min;
  return Math.min(Math.round((progress / range) * 100), 100);
};

export const POINTS_EVENTS = [
  { event: 'blood_donation', label: 'Blood Donation (Verified)', points: 100 },
  { event: 'profile_complete', label: 'Profile Completed', points: 20 },
  { event: 'milestone_5', label: 'Milestone: 5 Donations', points: 50 },
  { event: 'milestone_10', label: 'Milestone: 10 Donations', points: 50 },
  { event: 'milestone_20', label: 'Milestone: 20 Donations', points: 100 },
  { event: 'awareness_campaign', label: 'Awareness Campaign', points: 30 },
  { event: 'referral', label: 'Referred a Donor', points: 25 },
];
