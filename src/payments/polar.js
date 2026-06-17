/**
 * Polar.sh Integration for BODYBVILDER
 * Organization: bodybvilder
 * Products created: Monthly + Yearly PRO
 */

export const POLAR_CONFIG = {
  organizationSlug: 'bodybvilder',
  monthlyProductId: 'affacc81-be04-4be4-836a-0311610f499a',
  yearlyProductId:  '7d49ad55-c0b2-4ffb-9716-a440abe380cd',
};

export const POLAR_PRICES = {
  monthly: { amount: 4.99,  label: '$4.99 / month', period: 'month' },
  yearly:  { amount: 29.99, label: '$29.99 / year',  period: 'year', savingsLabel: 'Save 50%' },
};

/**
 * Open Polar checkout in a new tab
 * Polar hosted checkout handles everything — taxes, payment, receipts
 */
export function openPolarCheckout(plan, userEmail) {
  const productId = plan === 'yearly'
    ? POLAR_CONFIG.yearlyProductId
    : POLAR_CONFIG.monthlyProductId;

  // Polar checkout URL format
  const url = new URL(`https://buy.polar.sh/bodybvilder/${productId}`);

  // Pre-fill customer email if logged in
  if (userEmail) {
    url.searchParams.set('customer_email', userEmail);
  }

  window.open(url.toString(), '_blank', 'noopener,noreferrer');
}

/**
 * PRO status management — stored in localStorage
 * Synced from Firebase via webhook after successful payment
 */
export function getProStatus() {
  try {
    const raw = localStorage.getItem('bv-pro');
    if (!raw) return { isPro: false, plan: null, expiresAt: null };
    const data = JSON.parse(raw);
    // Check if expired
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      localStorage.removeItem('bv-pro');
      return { isPro: false, plan: null, expiresAt: null };
    }
    return data;
  } catch {
    return { isPro: false, plan: null, expiresAt: null };
  }
}

export function setProStatus(plan, expiresAt) {
  localStorage.setItem('bv-pro', JSON.stringify({ isPro: true, plan, expiresAt }));
  // Trigger update event so usePro hook re-reads
  window.dispatchEvent(new Event('bv-pro-updated'));
}

export function clearProStatus() {
  localStorage.removeItem('bv-pro');
  window.dispatchEvent(new Event('bv-pro-updated'));
}
