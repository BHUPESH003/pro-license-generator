export function addMonths(date: Date, months: number) {
  // End-of-month aware month addition (Aug 31 + 1m => Sep 30)
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

export function addYears(date: Date, years: number) {
  // End-of-month aware year addition (Feb 29 + 1y => Feb 28 on non-leap)
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setFullYear(d.getFullYear() + years);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

export function addQuarters(date: Date, quarters: number) {
  return addMonths(date, quarters * 3);
}

/**
 * Calculate license expiry date based on plan type and existing expiry
 * @param plan - The subscription plan (monthly, quarterly, yearly)
 * @param baseDate - Base date to calculate from (defaults to current date)
 * @param existingExpiry - Existing expiry date to extend from if still valid
 * @returns New expiry date
 */
export function calculateLicenseExpiry(
  plan: string,
  baseDate: Date = new Date(),
  existingExpiry?: Date
): Date {
  const now = new Date();
  
  // If existing expiry is still valid, extend from it
  // Otherwise, extend from the base date
  const base = existingExpiry && existingExpiry > now ? existingExpiry : baseDate;
  
  switch (plan.toLowerCase()) {
    case 'yearly':
      return addYears(base, 1);
    case 'quarterly':
      return addQuarters(base, 1);
    case 'monthly':
    default:
      return addMonths(base, 1);
  }
}

/**
 * Get the number of days until a license expires
 * @param expiryDate - The license expiry date
 * @returns Number of days until expiry (negative if expired)
 */
export function getDaysUntilExpiry(expiryDate: Date): number {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a license is expired
 * @param expiryDate - The license expiry date
 * @returns True if the license is expired
 */
export function isLicenseExpired(expiryDate: Date): boolean {
  return getDaysUntilExpiry(expiryDate) <= 0;
}

/**
 * Check if a license is expiring soon (within specified days)
 * @param expiryDate - The license expiry date
 * @param daysThreshold - Number of days to consider as "soon" (default: 7)
 * @returns True if the license expires within the threshold
 */
export function isLicenseExpiringSoon(expiryDate: Date, daysThreshold: number = 7): boolean {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
}
