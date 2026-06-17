/**
 * LemonSqueezy Integration for BODYBVILDER
 *
 * Setup steps:
 * 1. Create account at https://app.lemonsqueezy.com
 * 2. Create a Product → "BODYBVILDER PRO"
 * 3. Add two Variants:
 *    - Monthly: $4.99/month
 *    - Yearly:  $29.99/year  (saves ~50%)
 * 4. Copy your Store Slug and Variant IDs below
 * 5. Set webhook URL in LemonSqueezy dashboard:
 *    https://YOUR_FIREBASE_FUNCTIONS_URL/lsWebhook
 *    Events: subscription_created, subscription_updated, subscription_cancelled
 */

// ─── REPLACE WITH YOUR ACTUAL IDs FROM LEMON SQUEEZY DASHBOARD ────────────
export const LS_CONFIG = {
  storeSlug: 'bodybvilder',
  monthlyVariantId: 'affacc81-be04-4be4-836a-0311610f499a',
  yearlyVariantId: '7d49ad55-c0b2-4ffb-9716-a440abe380cd',
  checkoutBaseUrl: 'https://bodybvilder.lemonsqueezy.com/checkout/buy/',
};

export const PRICES = {
  monthly: { amount: 4.99, period: 'month', label: '$4.99 / month' },
  yearly:  { amount: 29.99, period: 'year', label: '$29.99 / year', savingsLabel: 'Save 50%' },
};

/**
 * Open LemonSqueezy checkout in a new tab
 * Pass user email to pre-fill checkout form
 * Pass custom data (userId) so webhook can link purchase to Firebase user
 */
export function openCheckout(plan, userEmail, userId) {
  const variantId = plan === 'yearly' ? LS_CONFIG.yearlyVariantId : LS_CONFIG.monthlyVariantId;
  const url = new URL(`${LS_CONFIG.checkoutBaseUrl}${variantId}`);

  // Pre-fill email
  if (userEmail) url.searchParams.set('checkout[email]', userEmail);

  // Pass userId in custom data — webhook uses this to update Firebase
  if (userId) {
    url.searchParams.set('checkout[custom][user_id]', userId);
  }

  // Embed checkout overlay for better UX (no redirect)
  url.searchParams.set('embed', '1');

  // Open as popup (LemonSqueezy supports embedded checkout via postMessage)
  window.open(url.toString(), '_blank', 'width=500,height=700');
}

/**
 * Check if user has PRO — reads from localStorage (synced from Firebase via webhook)
 * In production, also verify against Firebase for security
 */
export function getProStatus() {
  try {
    const data = localStorage.getItem('bv-pro');
    if (!data) return { isPro: false, plan: null, expiresAt: null };
    const parsed = JSON.parse(data);
    // Check expiry
    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem('bv-pro');
      return { isPro: false, plan: null, expiresAt: null };
    }
    return parsed;
  } catch {
    return { isPro: false, plan: null, expiresAt: null };
  }
}

export function setProStatus(plan, expiresAt) {
  localStorage.setItem('bv-pro', JSON.stringify({ isPro: true, plan, expiresAt }));
}

export function clearProStatus() {
  localStorage.removeItem('bv-pro');
}
