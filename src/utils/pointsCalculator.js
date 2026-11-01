import { DONOR_LEVELS, getDonorLevel, getNextLevel, getLevelProgress } from '../data/achievements';

export const calculatePoints = (donations, events = []) => {
  let total = donations * 100;
  events.forEach(e => { total += e.points; });
  return total;
};

export const getPointsForAction = (action) => {
  const pointsMap = {
    blood_donation: 100,
    profile_complete: 20,
    milestone_5: 50,
    milestone_10: 50,
    milestone_20: 100,
    awareness_campaign: 30,
    referral: 25,
  };
  return pointsMap[action] || 0;
};

export { getDonorLevel, getNextLevel, getLevelProgress, DONOR_LEVELS };

export const formatPoints = (points) => {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}k`;
  return points.toString();
};

export const getLevelColor = (levelName) => {
  const colors = {
    Beginner: '#6B7280',
    Bronze: '#B45309',
    Silver: '#475569',
    Gold: '#D97706',
    Platinum: '#7C3AED',
  };
  return colors[levelName] || '#6B7280';
};
