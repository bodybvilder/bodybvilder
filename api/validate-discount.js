/**
 * Vercel Serverless Function — Validate Polar Discount Code
 * GET /api/validate-discount?code=RIZKY20
 *
 * Checks if a discount code exists and returns its value
 * Uses Polar API with server-side access token
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://bodybvilder.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) return res.status(500).json({ error: 'Server config error' });

  try {
    // List discounts and find matching code
    const response = await fetch(
      `https://api.polar.sh/v1/discounts?organization_id=bodybvilder&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Could not verify code' });
    }

    const data = await response.json();
    const discounts = data.items || [];

    // Find discount by code (case-insensitive)
    const match = discounts.find(
      d => d.code?.toLowerCase() === code.toLowerCase() && d.is_active
    );

    if (!match) {
      return res.status(404).json({ valid: false, error: 'Code not found' });
    }

    // Return discount info
    return res.status(200).json({
      valid: true,
      code: match.code,
      name: match.name || '',
      type: match.type,           // 'percentage' | 'fixed'
      amount: match.amount,       // e.g. 20 (for 20%)
      currency: match.currency || 'USD',
      label: match.type === 'percentage'
        ? `${match.amount}% off`
        : `$${(match.amount / 100).toFixed(2)} off`,
    });

  } catch (err) {
    console.error('Discount validation error:', err.message);
    return res.status(500).json({ error: 'Validation failed' });
  }
}
