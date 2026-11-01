import { calculateDistance } from './distanceCalculator';
import { BENGALURU_CENTER } from '../data/mockDonors';

/**
 * Filter donors based on search criteria
 */
export const filterDonors = (donors, filters, userLocation = BENGALURU_CENTER) => {
  const { bloodGroup, radius, availableOnly } = filters;

  return donors
    .map(donor => ({
      ...donor,
      distance: calculateDistance(userLocation.lat, userLocation.lng, donor.lat, donor.lng),
    }))
    .filter(donor => {
      if (bloodGroup && bloodGroup !== 'all' && donor.bloodGroup !== bloodGroup) return false;
      if (radius && donor.distance > radius) return false;
      if (availableOnly && !donor.available) return false;
      return true;
    })
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Get compatible blood groups (can receive from which groups)
 */
export const getCompatibleBloodGroups = (recipientGroup) => {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
  };
  return compatibility[recipientGroup] || [];
};

export const sortDonors = (donors, sortBy) => {
  const sorted = [...donors];
  switch (sortBy) {
    case 'distance': return sorted.sort((a, b) => a.distance - b.distance);
    case 'donations': return sorted.sort((a, b) => b.totalDonations - a.totalDonations);
    case 'points': return sorted.sort((a, b) => b.points - a.points);
    case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default: return sorted;
  }
};
