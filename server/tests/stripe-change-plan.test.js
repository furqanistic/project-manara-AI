import test from 'node:test';
import assert from 'node:assert/strict';

import { changeSubscriptionPlan } from '../controllers/stripeController.js';
import User from '../models/User.js';
import { stripeService } from '../services/stripeService.js';

const createRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

const baseSubscription = {
  id: 'sub_1',
  current_period_start: 1735689600,
  current_period_end: 1738368000,
  customer: 'cus_1',
  items: {
    data: [
      {
        id: 'si_1',
        price: { id: 'price_plus' },
      },
    ],
  },
};

const setPlanEnv = () => {
  process.env.STRIPE_PRICE_ID_STARTER = 'price_starter';
  process.env.STRIPE_PRICE_ID_HOME = 'price_home';
  process.env.STRIPE_PRICE_ID_PLUS = 'price_plus';
};

test('changeSubscriptionPlan blocks second scheduled downgrade with 409', async () => {
  const originals = {
    findById: User.findById,
    resolveRecurringPriceId: stripeService.resolveRecurringPriceId,
    getOrCreateCustomer: stripeService.getOrCreateCustomer,
    listCardPaymentMethods: stripeService.listCardPaymentMethods,
    getSubscription: stripeService.getSubscription,
    createSubscriptionScheduleFromSubscription: stripeService.createSubscriptionScheduleFromSubscription,
    releaseSubscriptionSchedule: stripeService.releaseSubscriptionSchedule,
  };

  setPlanEnv();

  User.findById = async () => ({
    _id: 'user_1',
    stripeSubscriptionId: 'sub_1',
  });
  stripeService.resolveRecurringPriceId = async (value) => value;
  stripeService.getOrCreateCustomer = async () => 'cus_1';
  stripeService.listCardPaymentMethods = async () => ({ cards: [{ id: 'pm_1' }] });
  stripeService.getSubscription = async () => ({
    ...baseSubscription,
    schedule: 'sub_sched_1',
  });

  let releaseCalled = false;
  stripeService.releaseSubscriptionSchedule = async () => {
    releaseCalled = true;
  };

  let createdSchedule = false;
  stripeService.createSubscriptionScheduleFromSubscription = async () => {
    createdSchedule = true;
    return { id: 'sub_sched_new' };
  };

  const req = {
    user: { id: 'user_1' },
    body: {
      planId: 'home',
      priceId: 'price_home',
      renewNow: false,
    },
  };
  const res = createRes();

  try {
    await changeSubscriptionPlan(req, res, () => {});

    assert.equal(res.statusCode, 409);
    assert.equal(res.body?.status, 'error');
    assert.match(String(res.body?.message || ''), /already scheduled/i);
    assert.equal(releaseCalled, false);
    assert.equal(createdSchedule, false);
  } finally {
    User.findById = originals.findById;
    stripeService.resolveRecurringPriceId = originals.resolveRecurringPriceId;
    stripeService.getOrCreateCustomer = originals.getOrCreateCustomer;
    stripeService.listCardPaymentMethods = originals.listCardPaymentMethods;
    stripeService.getSubscription = originals.getSubscription;
    stripeService.createSubscriptionScheduleFromSubscription =
      originals.createSubscriptionScheduleFromSubscription;
    stripeService.releaseSubscriptionSchedule = originals.releaseSubscriptionSchedule;
  }
});

test('changeSubscriptionPlan releases schedule and upgrades immediately', async () => {
  const originals = {
    findById: User.findById,
    findOneAndUpdate: User.findOneAndUpdate,
    resolveRecurringPriceId: stripeService.resolveRecurringPriceId,
    getOrCreateCustomer: stripeService.getOrCreateCustomer,
    listCardPaymentMethods: stripeService.listCardPaymentMethods,
    getSubscription: stripeService.getSubscription,
    releaseSubscriptionSchedule: stripeService.releaseSubscriptionSchedule,
    updateSubscription: stripeService.updateSubscription,
  };

  setPlanEnv();

  User.findById = async () => ({
    _id: 'user_1',
    stripeSubscriptionId: 'sub_1',
  });
  User.findOneAndUpdate = async () => ({});
  stripeService.resolveRecurringPriceId = async (value) => value;
  stripeService.getOrCreateCustomer = async () => 'cus_1';
  stripeService.listCardPaymentMethods = async () => ({ cards: [{ id: 'pm_1' }] });
  stripeService.getSubscription = async () => ({
    ...baseSubscription,
    items: {
      data: [
        {
          id: 'si_1',
          price: { id: 'price_home' },
        },
      ],
    },
    schedule: 'sub_sched_1',
  });

  let releaseCount = 0;
  stripeService.releaseSubscriptionSchedule = async () => {
    releaseCount += 1;
  };

  let updatePayload = null;
  stripeService.updateSubscription = async (_subscriptionId, payload) => {
    updatePayload = payload;
    return {
      ...baseSubscription,
      id: 'sub_1',
      customer: 'cus_1',
      status: 'active',
      current_period_end: 1738368000,
      items: {
        data: [
          {
            id: 'si_1',
            price: { id: 'price_plus' },
          },
        ],
      },
    };
  };

  const req = {
    user: { id: 'user_1' },
    body: {
      planId: 'plus',
      priceId: 'price_plus',
      renewNow: false,
    },
  };
  const res = createRes();

  try {
    await changeSubscriptionPlan(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body?.status, 'success');
    assert.equal(res.body?.action, 'immediate_change');
    assert.equal(releaseCount, 1);
    assert.equal(updatePayload?.proration_behavior, 'always_invoice');
    assert.equal(updatePayload?.billing_cycle_anchor, 'unchanged');
  } finally {
    User.findById = originals.findById;
    User.findOneAndUpdate = originals.findOneAndUpdate;
    stripeService.resolveRecurringPriceId = originals.resolveRecurringPriceId;
    stripeService.getOrCreateCustomer = originals.getOrCreateCustomer;
    stripeService.listCardPaymentMethods = originals.listCardPaymentMethods;
    stripeService.getSubscription = originals.getSubscription;
    stripeService.releaseSubscriptionSchedule = originals.releaseSubscriptionSchedule;
    stripeService.updateSubscription = originals.updateSubscription;
  }
});

test('changeSubscriptionPlan releases schedule and renews same plan immediately', async () => {
  const originals = {
    findById: User.findById,
    findOneAndUpdate: User.findOneAndUpdate,
    resolveRecurringPriceId: stripeService.resolveRecurringPriceId,
    getOrCreateCustomer: stripeService.getOrCreateCustomer,
    listCardPaymentMethods: stripeService.listCardPaymentMethods,
    getSubscription: stripeService.getSubscription,
    releaseSubscriptionSchedule: stripeService.releaseSubscriptionSchedule,
    updateSubscription: stripeService.updateSubscription,
  };

  setPlanEnv();

  User.findById = async () => ({
    _id: 'user_1',
    stripeSubscriptionId: 'sub_1',
  });
  User.findOneAndUpdate = async () => ({});
  stripeService.resolveRecurringPriceId = async (value) => value;
  stripeService.getOrCreateCustomer = async () => 'cus_1';
  stripeService.listCardPaymentMethods = async () => ({ cards: [{ id: 'pm_1' }] });
  stripeService.getSubscription = async () => ({
    ...baseSubscription,
    schedule: 'sub_sched_1',
  });

  let releaseCount = 0;
  stripeService.releaseSubscriptionSchedule = async () => {
    releaseCount += 1;
  };

  let updatePayload = null;
  stripeService.updateSubscription = async (_subscriptionId, payload) => {
    updatePayload = payload;
    return {
      ...baseSubscription,
      id: 'sub_1',
      customer: 'cus_1',
      status: 'active',
      current_period_end: 1738368000,
    };
  };

  const req = {
    user: { id: 'user_1' },
    body: {
      planId: 'plus',
      priceId: 'price_plus',
      renewNow: true,
    },
  };
  const res = createRes();

  try {
    await changeSubscriptionPlan(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body?.status, 'success');
    assert.equal(res.body?.action, 'renewed');
    assert.equal(releaseCount, 1);
    assert.equal(updatePayload?.proration_behavior, 'none');
    assert.equal(updatePayload?.billing_cycle_anchor, 'now');
  } finally {
    User.findById = originals.findById;
    User.findOneAndUpdate = originals.findOneAndUpdate;
    stripeService.resolveRecurringPriceId = originals.resolveRecurringPriceId;
    stripeService.getOrCreateCustomer = originals.getOrCreateCustomer;
    stripeService.listCardPaymentMethods = originals.listCardPaymentMethods;
    stripeService.getSubscription = originals.getSubscription;
    stripeService.releaseSubscriptionSchedule = originals.releaseSubscriptionSchedule;
    stripeService.updateSubscription = originals.updateSubscription;
  }
});
