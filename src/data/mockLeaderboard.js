import { mockDonors } from './mockDonors';

// Generate leaderboard from mock donors sorted by points
const generateLeaderboard = () => {
  return [...mockDonors]
    .sort((a, b) => b.points - a.points)
    .map((donor, index) => ({
      ...donor,
      rank: index + 1,
    }));
};

export const globalLeaderboard = generateLeaderboard();

export const monthlyLeaderboard = [...mockDonors]
  .filter(d => d.lastDonated >= '2024-10-01')
  .sort((a, b) => b.totalDonations - a.totalDonations)
  .map((donor, index) => ({ ...donor, rank: index + 1 }));

export const cityLeaderboard = {
  'Koramangala': [...mockDonors].filter(d => d.locality === 'Koramangala').sort((a, b) => b.points - a.points),
  'Indiranagar': [...mockDonors].filter(d => d.locality === 'Indiranagar').sort((a, b) => b.points - a.points),
  'Whitefield': [...mockDonors].filter(d => d.locality === 'Whitefield').sort((a, b) => b.points - a.points),
  'Electronic City': [...mockDonors].filter(d => d.locality === 'Electronic City').sort((a, b) => b.points - a.points),
  'Hebbal': [...mockDonors].filter(d => d.locality === 'Hebbal').sort((a, b) => b.points - a.points),
};
