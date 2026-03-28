/**
 * Trail utility functions
 */

/**
 * Calculate distance between coordinates using the Haversine formula.
 * @param {Array<[number, number]>} coords - Array of [lat, lon] coordinate pairs
 * @returns {number} Total distance in kilometers
 */
export function calculateDistance(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const lat1 = coords[i - 1][0] * Math.PI / 180;
    const lat2 = coords[i][0] * Math.PI / 180;
    const dLat = lat2 - lat1;
    const dLon = (coords[i][1] - coords[i - 1][1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += 6371 * c; // Earth's radius in km
  }
  return total;
}

/**
 * Bruce Trail Club latitude boundaries (approximate, from south to north).
 * These boundaries are based on the geographic distribution of the trail
 * through Ontario, from Niagara to Tobermory.
 */
const CLUB_BOUNDARIES = [
  { maxLat: 43.4, club: 'niagara' },      // Niagara Escarpment, Niagara Falls area
  { maxLat: 43.8, club: 'iroquoia' },     // Hamilton to Burlington area
  { maxLat: 44.05, club: 'toronto' },     // Greater Toronto Area section
  { maxLat: 44.3, club: 'caledon' },      // Caledon Hills region
  { maxLat: 44.5, club: 'dufferin' },     // Dufferin County highlands
  { maxLat: 44.7, club: 'bluemountains' }, // Blue Mountains ski area
  { maxLat: 44.85, club: 'beavervalley' }, // Beaver Valley region
  { maxLat: 45.1, club: 'sydenham' },     // Sydenham section near Owen Sound
];

/**
 * Determine which Bruce Trail club section a trail segment belongs to
 * based on its average latitude.
 * @param {number} lat - Latitude value
 * @returns {string} Club identifier
 */
export function getClubByLatitude(lat) {
  for (const boundary of CLUB_BOUNDARIES) {
    if (lat < boundary.maxLat) {
      return boundary.club;
    }
  }
  return 'peninsula'; // Northernmost section (Bruce Peninsula)
}

/**
 * Format a date string for display.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-CA', { ...defaultOptions, ...options });
}

/**
 * Get today's date in ISO format (YYYY-MM-DD).
 * @returns {string} Today's date
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}
