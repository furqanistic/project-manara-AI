import test from 'node:test';
import assert from 'node:assert/strict';

import { stripeWebhook } from '../controllers/stripeController.js';
import { consumeUsage } from '../middleware/billingUsageMiddleware.js';
import StripeWebhookEvent from '../models/StripeWebhookEvent.js';
import { stripeService } from '../services/stripeService.js';
import { billingUsageService } from '../services/billingUsageService.js';

const createRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    sent: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.sent = payload;
      return this;
    },
  };
  return res;
};

test('stripeWebhook skips duplicate events that are already marked successful', async () => {
  const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const originalConstructEvent = stripeService.constructEvent;
  const originalFindOne = StripeWebhookEvent.findOne;

  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  stripeService.constructEvent = () => ({
    id: 'evt_duplicate_1',
    type: 'checkout.session.completed',
    data: {
      object: {},
    },
  });
  StripeWebhookEvent.findOne = async () => ({
    status: 'success',
  });

  const req = {
    headers: { 'stripe-signature': 't=1,v1=test' },
    body: Buffer.from('{}'),
  };
  const res = createRes();

  try {
    await stripeWebhook(req, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { received: true, duplicate: true });
  } finally {
    process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
    stripeService.constructEvent = originalConstructEvent;
    StripeWebhookEvent.findOne = originalFindOne;
  }
});

test('stripeWebhook enforces missing signature validation', async () => {
  const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

  const req = {
    headers: {},
    body: Buffer.from('{}'),
  };
  const res = createRes();

  try {
    await stripeWebhook(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body?.received, false);
    assert.match(String(res.body?.message || ''), /Missing stripe-signature header/i);
  } finally {
    process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
  }
});

test('consumeUsage middleware blocks when usage limit is reached', async () => {
  const originalConsume = billingUsageService.consumeUsageOrBlock;
  billingUsageService.consumeUsageOrBlock = async () => ({
    enforced: true,
    blocked: true,
    reasonCode: 'USAGE_LIMIT_REACHED',
    message: 'Limit reached for current plan.',
    usage: {
      usedUnits: 20,
      limitUnits: 20,
      planId: 'starter',
    },
  });

  const middleware = consumeUsage({ actionKey: 'moodboard_generate' });
  const req = { user: { _id: 'user_1' } };
  const res = createRes();

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  try {
    await middleware(req, res, next);
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 429);
    assert.equal(res.body?.code, 'USAGE_LIMIT_REACHED');
    assert.equal(res.body?.data?.upgradeCta, 'Upgrade Plan');
  } finally {
    billingUsageService.consumeUsageOrBlock = originalConsume;
  }
});

test('consumeUsage middleware attaches warning usage payload on success', async () => {
  const originalConsume = billingUsageService.consumeUsageOrBlock;
  const usage = {
    usedUnits: 16,
    limitUnits: 20,
    percent: 80,
    state: 'warn',
    planId: 'starter',
  };
  billingUsageService.consumeUsageOrBlock = async () => ({
    enforced: true,
    blocked: false,
    thresholdState: 'warn',
    usage,
  });

  const middleware = consumeUsage({ actionKey: 'moodboard_generate' });
  const req = { user: { _id: 'user_1' } };
  const res = createRes();

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  try {
    await middleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(res.headers['X-Billing-Usage-Warning'], 'USAGE_THRESHOLD_80');

    res.json({ status: 'success' });
    assert.equal(res.body?.status, 'success');
    assert.deepEqual(res.body?.billingUsage, usage);
  } finally {
    billingUsageService.consumeUsageOrBlock = originalConsume;
  }
});
