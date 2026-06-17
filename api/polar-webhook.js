/**
 * Vercel Serverless Function — Polar Webhook Handler
 * POST /api/polar-webhook
 *
 * Receives subscription lifecycle events from Polar
 * and updates Firebase user PRO status accordingly.
 *
 * Setup in Polar:
 * Settings → Webhooks → Add Endpoint
 * URL: https://bodybvilder.vercel.app/api/polar-webhook
 * Events: subscription.created, subscription.updated, subscription.revoked
 * Secret: set POLAR_WEBHOOK_SECRET in Vercel env vars
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'crypto';

// ── Init Firebase Admin ────────────────────────────────────────────────
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

// ── Verify Polar Standard Webhook signature ────────────────────────────
// Polar uses Standard Webhooks spec (HMAC-SHA256)
function verifyPolarWebhook(rawBody, headers, secret) {
  const msgId        = headers['webhook-id'];
  const msgTimestamp = headers['webhook-timestamp'];
  const msgSignature = headers['webhook-signature'];

  if (!msgId || !msgTimestamp || !msgSignature) return false;

  // Reject if timestamp is >5 minutes old (replay attack protection)
  const ts = parseInt(msgTimestamp, 10);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const signedContent = `${msgId}.${msgTimestamp}.${rawBody}`;
  const secretBytes   = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected      = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // msgSignature may contain multiple sigs separated by space
  const sigs = msgSignature.split(' ');
  return sigs.some(sig => {
    const sigValue = sig.replace(/^v1,/, '');
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(sigValue)
    );
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error('POLAR_WEBHOOK_SECRET not set');
    return res.status(500).end();
  }

  // Get raw body for signature verification
  const rawBody = JSON.stringify(req.body);

  // Verify signature
  const isValid = verifyPolarWebhook(rawBody, req.headers, secret);
  if (!isValid) {
    console.error('Invalid webhook signature');
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  const eventType = event.type;

  console.log(`Polar webhook: ${eventType}`);

  try {
    const db = getFirebaseAdmin();

    // ── subscription.created / subscription.updated ──────────────────
    if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
      const sub = event.data;
      const customerEmail = sub.customer?.email;
      const status = sub.status; // 'active' | 'canceled' | 'past_due' | etc.
      const productId = sub.product?.id;
      const currentPeriodEnd = sub.current_period_end;

      if (!customerEmail) {
        console.warn('No customer email in webhook');
        return res.status(200).json({ received: true });
      }

      // Find user by email in Firebase Auth
      const { getAuth } = await import('firebase-admin/auth');
      let uid;
      try {
        const userRecord = await getAuth().getUserByEmail(customerEmail);
        uid = userRecord.uid;
      } catch {
        console.warn(`No Firebase user for email: ${customerEmail}`);
        return res.status(200).json({ received: true });
      }

      const isPro = status === 'active';
      const plan = productId === 'affacc81-be04-4be4-836a-0311610f499a'
        ? 'monthly'
        : productId === '7d49ad55-c0b2-4ffb-9716-a440abe380cd'
        ? 'yearly'
        : 'monthly';

      // Update Firestore
      await db.collection('users').doc(uid).set({
        isPro,
        plan: isPro ? plan : null,
        proExpiresAt: currentPeriodEnd || null,
        polarSubscriptionId: sub.id,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log(`User ${uid} PRO status → ${isPro} (${plan})`);
    }

    // ── subscription.revoked ─────────────────────────────────────────
    else if (eventType === 'subscription.revoked') {
      const sub = event.data;
      const customerEmail = sub.customer?.email;

      if (!customerEmail) return res.status(200).json({ received: true });

      const { getAuth } = await import('firebase-admin/auth');
      let uid;
      try {
        const userRecord = await getAuth().getUserByEmail(customerEmail);
        uid = userRecord.uid;
      } catch {
        return res.status(200).json({ received: true });
      }

      await db.collection('users').doc(uid).set({
        isPro: false,
        plan: null,
        proExpiresAt: null,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log(`User ${uid} PRO revoked`);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).json({ error: 'Processing failed' });
  }
}
