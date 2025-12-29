import express from 'express';
import { createCheckoutSession, createPortalSession, stripeWebhook } from '../controllers/stripeController.js';
import { verifyToken } from '../verifyToken.js';

const router = express.Router();

router.post('/create-checkout-session', verifyToken, createCheckoutSession);
router.post('/create-portal-session', verifyToken, createPortalSession);

// Webhook must be handled with raw body - we'll config this in index.js
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
