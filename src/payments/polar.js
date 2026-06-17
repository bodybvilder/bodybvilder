/**
 * Polar.sh Integration for BODYBVILDER
 * Organization: bodybvilder
 * Products created: Monthly + Yearly PRO
 */

export const POLAR_CONFIG = {
  organizationSlug: 'bodybvilder',
  monthlyProductId: 'affacc81-be04-4be4-836a-0311610f499a',
  yearlyProductId:  '7d49ad55-c0b2-4ffb-9716-a440abe380cd',
  // Single checkout link — user can switch between Monthly/Yearly at checkout
  checkoutLink: 'https://buy.polar.sh/polar_cl_LqVGhA4jy3lTni2SEs2toWjNccv8RlGcGINpH0akIuk',
};

export const POLAR_PRICES = {
  monthly: { amount: 4.99,  label: '$4.99 / month', period: 'month' },
  yearly:  { amount: 29.99, label: '$29.99 / year',  period: 'year', savingsLabel: 'Save 50%' },
};

/**
 * Open Polar checkout — uses the pre-configured checkout link
 * Both Monthly and Yearly products are selectable at checkout
 */
export function openPolarCheckout(plan, userEmail, discountCode) {
  const url = new URL(POLAR_CONFIG.checkoutLink);

  if (plan === 'yearly') {
    url.searchParams.set('products', POLAR_CONFIG.yearlyProductId);
  } else {
    url.searchParams.set('products', POLAR_CONFIG.monthlyProductId);
  }

  if (userEmail) {
    url.searchParams.set('customer_email', userEmail);
  }

  // Apply creator/discount code if provided
  if (discountCode) {
    url.searchParams.set('discount_code', discountCode);
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
