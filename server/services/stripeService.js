import dotenv from 'dotenv';
import Stripe from 'stripe';
import User from '../models/User.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || '2026-02-25.clover',
});

const stringifySafe = (value) => String(value || '').trim();

const buildCustomerMetadata = (user) => {
  const billingProfile = user?.onboardingData?.requiredProfile || {};
  const onboardingStripeMetadata = user?.onboardingData?.stripeMetadata || {};

  return {
    userId: stringifySafe(user?._id),
    userType: stringifySafe(onboardingStripeMetadata.userType || user?.onboardingData?.userType),
    country: stringifySafe(onboardingStripeMetadata.country || billingProfile.country),
    city: stringifySafe(onboardingStripeMetadata.city || billingProfile.city),
    billingRegion: stringifySafe(onboardingStripeMetadata.billingRegion || billingProfile.billingRegion),
  };
};

const attachCustomerIdToUser = async (user, customerId, options = {}) => {
  const { force = false } = options;
  if (!user?._id || !customerId) return customerId;
  if (user.stripeCustomerId === customerId) return customerId;

  try {
    await User.updateOne(
      force
        ? { _id: user._id }
        : {
            _id: user._id,
            $or: [
              { stripeCustomerId: null },
              { stripeCustomerId: { $exists: false } },
              { stripeCustomerId: '' },
            ],
          },
      {
        $set: { stripeCustomerId: customerId },
      }
    );
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }

  const refreshed = await User.findById(user._id).select('stripeCustomerId');
  return refreshed?.stripeCustomerId || customerId;
};

const findCustomerByMetadataUserId = async (userId) => {
  if (!userId) return null;
  try {
    const result = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 1,
    });
    return result?.data?.[0] || null;
  } catch (error) {
    return null;
  }
};

const findCustomerByEmail = async (email) => {
  if (!email) return null;
  const result = await stripe.customers.list({
    email,
    limit: 10,
  });
  const activeCustomer = (result?.data || []).find((item) => !item.deleted);
  return activeCustomer || null;
};

export const stripeService = {
  /**
   * Accept either Stripe price ID (price_...) or product ID (prod_...)
   * and resolve to a valid recurring price ID for subscriptions.
   */
  resolveRecurringPriceId: async (priceOrProductId) => {
    if (!priceOrProductId) return null;

    if (priceOrProductId.startsWith('price_')) {
      return priceOrProductId;
    }

    if (!priceOrProductId.startsWith('prod_')) {
      return priceOrProductId;
    }

    const product = await stripe.products.retrieve(priceOrProductId, {
      expand: ['default_price'],
    });

    const defaultPrice =
      typeof product.default_price === 'string'
        ? await stripe.prices.retrieve(product.default_price)
        : product.default_price;

    if (defaultPrice?.id && defaultPrice.active && defaultPrice.type === 'recurring') {
      return defaultPrice.id;
    }

    const productPrices = await stripe.prices.list({
      product: priceOrProductId,
      active: true,
      limit: 100,
    });

    const recurringPrice = productPrices.data.find((item) => item.type === 'recurring');
    if (recurringPrice?.id) {
      return recurringPrice.id;
    }

    throw new Error(
      `No active recurring price found for product '${priceOrProductId}'. Please use a price_ ID for subscription checkout.`
    );
  },

  syncCustomerMetadata: async (user, customerId) => {
    if (!user || !customerId) return;
    const metadata = buildCustomerMetadata(user);
    await stripe.customers.update(customerId, {
      email: user.email || undefined,
      name: user.name || undefined,
      metadata,
    });
  },

  /**
   * Create or retrieve a Stripe customer for a user
   */
  getOrCreateCustomer: async (user) => {
    if (user.stripeCustomerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (!existingCustomer.deleted) {
          await stripeService.syncCustomerMetadata(user, user.stripeCustomerId);
          return user.stripeCustomerId;
        }
      } catch (error) {
        // If customer retrieval fails, create a fresh Stripe customer and re-link it.
      }
    }

    const metadata = buildCustomerMetadata(user);

    const metadataMatch = await findCustomerByMetadataUserId(metadata.userId);
    if (metadataMatch?.id) {
      const linkedCustomerId = await attachCustomerIdToUser(user, metadataMatch.id, { force: true });
      await stripeService.syncCustomerMetadata(user, linkedCustomerId);
      return linkedCustomerId;
    }

    const emailMatch = await findCustomerByEmail(user.email);
    if (emailMatch?.id) {
      const linkedCustomerId = await attachCustomerIdToUser(user, emailMatch.id, { force: true });
      await stripeService.syncCustomerMetadata(user, linkedCustomerId);
      return linkedCustomerId;
    }

    const idempotencyKey = `customer_create_user_${metadata.userId || user.email || Date.now()}`;
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata,
    }, {
      idempotencyKey,
    });

    const linkedCustomerId = await attachCustomerIdToUser(user, customer.id);
    await stripeService.syncCustomerMetadata(user, linkedCustomerId);
    return linkedCustomerId;
  },

  /**
   * Create checkout session in setup mode to attach card first
   */
  createSetupSession: async (customerId, successUrl, cancelUrl) => {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  },

  /**
   * Create a checkout session for a subscription
   */
  createCheckoutSession: async (customerId, priceId, successUrl, cancelUrl) => {
    const { cards } = await stripeService.listCardPaymentMethods(customerId);
    if (cards.length === 0) {
      throw new Error('Please link at least one card before purchasing a plan.');
    }

    return await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
      },
    });
  },

  /**
   * Create a one-time checkout session for credit top-ups
   */
  createTopupCheckoutSession: async (
    customerId,
    { planId, credits, amountAed, successUrl, cancelUrl }
  ) => {
    const { cards } = await stripeService.listCardPaymentMethods(customerId);
    if (cards.length === 0) {
      throw new Error('Please link at least one card before purchasing credits.');
    }

    const amount = Number(amountAed);
    const totalCredits = Number(credits);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(totalCredits) || totalCredits <= 0) {
      throw new Error('Invalid top-up configuration.');
    }

    return await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aed',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `${planId} credit top-up`,
              description: `${totalCredits} credits`,
            },
          },
        },
      ],
      metadata: {
        purchaseType: 'topup',
        planId,
        credits: String(totalCredits),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  },

  /**
   * Create a customer portal session for managing subscription
   */
  createPortalSession: async (customerId, returnUrl) => {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  },

  /**
   * Retrieve subscription details
   */
  getSubscription: async (subscriptionId, options = {}) => {
    return await stripe.subscriptions.retrieve(subscriptionId, options);
  },

  /**
   * Update existing subscription
   */
  updateSubscription: async (subscriptionId, payload) => {
    return await stripe.subscriptions.update(subscriptionId, payload);
  },

  createSubscriptionScheduleFromSubscription: async (subscriptionId) => {
    return await stripe.subscriptionSchedules.create({
      from_subscription: subscriptionId,
    });
  },

  updateSubscriptionSchedule: async (scheduleId, payload) => {
    return await stripe.subscriptionSchedules.update(scheduleId, payload);
  },

  getSubscriptionSchedule: async (scheduleId) => {
    return await stripe.subscriptionSchedules.retrieve(scheduleId);
  },

  releaseSubscriptionSchedule: async (scheduleId) => {
    return await stripe.subscriptionSchedules.release(scheduleId);
  },

  cancelSubscriptionSchedule: async (scheduleId) => {
    return await stripe.subscriptionSchedules.cancel(scheduleId);
  },

  /**
   * Retrieve setup intent details
   */
  getSetupIntent: async (setupIntentId) => {
    return await stripe.setupIntents.retrieve(setupIntentId);
  },

  /**
   * Retrieve checkout session details
   */
  getCheckoutSession: async (sessionId) => {
    return await stripe.checkout.sessions.retrieve(sessionId);
  },

  /**
   * List subscriptions for a customer
   */
  listSubscriptions: async (customerId) => {
    return await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 20,
    });
  },

  /**
   * List card payment methods and guarantee a default card when one exists
   */
  listCardPaymentMethods: async (customerId) => {
    const [paymentMethods, customer] = await Promise.all([
      stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      }),
      stripe.customers.retrieve(customerId),
    ]);

    const rawCards = paymentMethods.data
      .map((paymentMethod) => ({
        id: paymentMethod.id,
        brand: paymentMethod.card?.brand || 'card',
        last4: paymentMethod.card?.last4 || '****',
        expMonth: paymentMethod.card?.exp_month || null,
        expYear: paymentMethod.card?.exp_year || null,
        fingerprint: paymentMethod.card?.fingerprint || null,
        created: paymentMethod.created || 0,
      }))
      .sort((a, b) => b.created - a.created);

    // Some Stripe flows can attach the same physical card multiple times.
    // Keep the newest copy per unique card signature for cleaner UX.
    const seenSignatures = new Set();
    const cards = [];
    for (const card of rawCards) {
      const signature = [
        card.fingerprint || 'no-fingerprint',
        card.brand,
        card.last4,
        card.expMonth,
        card.expYear,
      ].join(':');

      if (seenSignatures.has(signature)) continue;
      seenSignatures.add(signature);
      cards.push({ ...card, signature });
    }

    let defaultPaymentMethodId =
      customer?.invoice_settings?.default_payment_method || null;

    const defaultCard = cards.find((card) => card.id === defaultPaymentMethodId);
    if (!defaultCard && defaultPaymentMethodId) {
      const previousDefault = rawCards.find((card) => card.id === defaultPaymentMethodId);
      if (previousDefault) {
        const signature = [
          previousDefault.fingerprint || 'no-fingerprint',
          previousDefault.brand,
          previousDefault.last4,
          previousDefault.expMonth,
          previousDefault.expYear,
        ].join(':');
        const dedupedMatch = cards.find((card) => card.signature === signature);
        if (dedupedMatch) {
          defaultPaymentMethodId = dedupedMatch.id;
        }
      }
    }

    const hasValidDefault = defaultPaymentMethodId
      ? cards.some((card) => card.id === defaultPaymentMethodId)
      : false;

    if (cards.length > 0 && !hasValidDefault) {
      defaultPaymentMethodId = cards[0].id;
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: defaultPaymentMethodId },
      });
    }

    return {
      cards: cards.map((paymentMethod) => ({
        id: paymentMethod.id,
        brand: paymentMethod.brand,
        last4: paymentMethod.last4,
        expMonth: paymentMethod.expMonth,
        expYear: paymentMethod.expYear,
      })),
      defaultPaymentMethodId,
    };
  },

  /**
   * Set one card as primary/default
   */
  setDefaultPaymentMethod: async (customerId, paymentMethodId) => {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (!paymentMethod || paymentMethod.customer !== customerId || paymentMethod.type !== 'card') {
      throw new Error('Invalid card selection.');
    }

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  },

  /**
   * Remove a card, while enforcing at least one card remains
   */
  removePaymentMethod: async (customerId, paymentMethodId) => {
    const { cards, defaultPaymentMethodId } = await stripeService.listCardPaymentMethods(customerId);
    if (cards.length <= 1) {
      throw new Error('At least one card must remain on your account.');
    }

    const cardExists = cards.some((card) => card.id === paymentMethodId);
    if (!cardExists) {
      throw new Error('Card not found for this account.');
    }

    const replacementCard = cards.find((card) => card.id !== paymentMethodId);
    if (defaultPaymentMethodId === paymentMethodId && replacementCard) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: replacementCard.id },
      });
    }

    await stripe.paymentMethods.detach(paymentMethodId);
  },

  /**
   * Handle Stripe Webhook Events
   */
  constructEvent: (payload, sig, endpointSecret) => {
    return stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  }
};

export default stripe;
