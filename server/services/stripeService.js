import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  /**
   * Create or retrieve a Stripe customer for a user
   */
  getOrCreateCustomer: async (user) => {
    if (user.stripeCustomerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (!existingCustomer.deleted) {
          return user.stripeCustomerId;
        }
      } catch (error) {
        // If customer retrieval fails, create a fresh Stripe customer and re-link it.
      }
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });

    user.stripeCustomerId = customer.id;
    await user.save({ validateBeforeSave: false });
    
    return customer.id;
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
