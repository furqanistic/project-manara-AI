import express from 'express';
import {
  cancelSubscriptionAtPeriodEnd,
  cancelScheduledPlanChange,
  changeSubscriptionPlan,
  createCheckoutSession,
  createPortalSession,
  createSetupSession,
  deletePaymentMethod,
  getBillingStatus,
  getPaymentMethods,
  resumeSubscription,
  setDefaultPaymentMethod,
  syncCheckoutSession,
  stripeWebhook,
} from '../controllers/stripeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', verifyToken, createCheckoutSession);
router.post('/create-setup-session', verifyToken, createSetupSession);
router.post('/create-portal-session', verifyToken, createPortalSession);
router.get('/payment-methods', verifyToken, getPaymentMethods);
router.patch('/payment-methods/:paymentMethodId/default', verifyToken, setDefaultPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', verifyToken, deletePaymentMethod);
router.get('/billing-status', verifyToken, getBillingStatus);
router.post('/subscription/cancel', verifyToken, cancelSubscriptionAtPeriodEnd);
router.post('/subscription/cancel-scheduled-change', verifyToken, cancelScheduledPlanChange);
router.post('/subscription/resume', verifyToken, resumeSubscription);
router.post('/subscription/change-plan', verifyToken, changeSubscriptionPlan);
router.post('/sync-checkout-session', verifyToken, syncCheckoutSession);

// Webhook raw-body handling is configured in server bootstrap (index.js)
router.post('/webhook', stripeWebhook);

export default router;
