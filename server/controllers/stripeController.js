import User from '../models/User.js';
import { stripeService } from '../services/stripeService.js';

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const ACTIVE_SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'unpaid'];

const resolvePriceId = ({ planId, priceId }) => {
  if (priceId) return priceId;
  if (!planId) return null;

  const map = {
    starter: process.env.STRIPE_PRICE_ID_STARTER,
    home: process.env.STRIPE_PRICE_ID_HOME,
    plus: process.env.STRIPE_PRICE_ID_PLUS,
  };

  return map[planId] || null;
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { planId, priceId: requestedPriceId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const configuredId = resolvePriceId({ planId, priceId: requestedPriceId });
    if (!configuredId) {
      return res.status(400).json({
        status: 'error',
        message:
          'No Stripe price configured for this plan. Set STRIPE_PRICE_ID_STARTER/HOME/PLUS or pass a priceId.',
      });
    }
    const priceId = await stripeService.resolveRecurringPriceId(configuredId);

    const customerId = await stripeService.getOrCreateCustomer(user);
    const cardState = await stripeService.listCardPaymentMethods(customerId);
    if (!cardState.cards.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Please link at least one card before purchasing a plan.',
      });
    }

    const successUrl = `${getFrontendUrl()}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${getFrontendUrl()}/pricing?canceled=true`;

    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.status(200).json({ status: 'success', url: session.url });
  } catch (err) {
    next(err);
  }
};

export const createSetupSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    const successUrl = `${getFrontendUrl()}/subscription?card_setup=success`;
    const cancelUrl = `${getFrontendUrl()}/subscription?card_setup=canceled`;

    const session = await stripeService.createSetupSession(customerId, successUrl, cancelUrl);
    return res.status(200).json({ status: 'success', url: session.url });
  } catch (err) {
    return next(err);
  }
};

export const createPortalSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    const returnUrl = `${getFrontendUrl()}/subscription`;
    const session = await stripeService.createPortalSession(customerId, returnUrl);

    res.status(200).json({ status: 'success', url: session.url });
  } catch (err) {
    next(err);
  }
};

export const getPaymentMethods = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    const result = await stripeService.listCardPaymentMethods(customerId);

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

export const setDefaultPaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethodId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    await stripeService.setDefaultPaymentMethod(customerId, paymentMethodId);
    const data = await stripeService.listCardPaymentMethods(customerId);

    return res.status(200).json({ status: 'success', data });
  } catch (err) {
    return next(err);
  }
};

export const deletePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethodId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    await stripeService.removePaymentMethod(customerId, paymentMethodId);
    const data = await stripeService.listCardPaymentMethods(customerId);

    return res.status(200).json({ status: 'success', data });
  } catch (err) {
    return next(err);
  }
};

export const getBillingStatus = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    const cards = await stripeService.listCardPaymentMethods(customerId);
    let nextBillingDate = user.subscriptionCurrentPeriodEnd || null;
    let resolvedPlanName = null;
    let activePlanId = null;
    let stripePriceId = user.stripePriceId || null;

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
        await updateSubscription(subscription);
        user = await User.findById(req.user.id);
        nextBillingDate = user.subscriptionCurrentPeriodEnd || null;
        resolvedPlanName = user.stripePriceId
          ? PRICE_ID_TO_PLAN_NAME[user.stripePriceId] || 'Custom Plan'
          : resolvedPlanName;
      } catch (error) {
        console.warn('Unable to refresh subscription from Stripe:', error.message);
      }
    }

    if (!user.stripeSubscriptionId || !ACTIVE_SUBSCRIPTION_STATUSES.includes(user.subscriptionStatus)) {
      const subscriptionList = await stripeService.listSubscriptions(customerId);
      const activeSubscription = subscriptionList.data.find((item) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(item.status)
      );

      if (activeSubscription) {
        await updateSubscription(activeSubscription);
        user = await User.findById(req.user.id);
      }
    }

    stripePriceId = user.stripePriceId || null;
    nextBillingDate = user.subscriptionCurrentPeriodEnd || null;

    const [starterPrice, homePrice, plusPrice] = await Promise.all([
      process.env.STRIPE_PRICE_ID_STARTER
        ? stripeService.resolveRecurringPriceId(process.env.STRIPE_PRICE_ID_STARTER).catch(() => null)
        : Promise.resolve(null),
      process.env.STRIPE_PRICE_ID_HOME
        ? stripeService.resolveRecurringPriceId(process.env.STRIPE_PRICE_ID_HOME).catch(() => null)
        : Promise.resolve(null),
      process.env.STRIPE_PRICE_ID_PLUS
        ? stripeService.resolveRecurringPriceId(process.env.STRIPE_PRICE_ID_PLUS).catch(() => null)
        : Promise.resolve(null),
    ]);

    if (stripePriceId && starterPrice && stripePriceId === starterPrice) {
      resolvedPlanName = 'Starter';
      activePlanId = 'starter';
    } else if (stripePriceId && homePrice && stripePriceId === homePrice) {
      resolvedPlanName = 'Home';
      activePlanId = 'home';
    } else if (stripePriceId && plusPrice && stripePriceId === plusPrice) {
      resolvedPlanName = 'Plus';
      activePlanId = 'plus';
    } else if (stripePriceId) {
      resolvedPlanName = 'Custom Plan';
    }

    return res.status(200).json({
      status: 'success',
      data: {
        customerId,
        cards,
        subscription: {
          subscriptionStatus: user.subscriptionStatus,
          stripeSubscriptionId: user.stripeSubscriptionId,
          stripePriceId,
          subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
          nextBillingDate,
          cancelAtPeriodEnd: user.cancelAtPeriodEnd,
          planName: resolvedPlanName,
          activePlanId,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const syncCheckoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ status: 'error', message: 'sessionId is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    const session = await stripeService.getCheckoutSession(sessionId);
    if (session.customer !== customerId) {
      return res.status(403).json({ status: 'error', message: 'Invalid checkout session for this user' });
    }

    await handleCheckoutSessionCompleted(session);
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return next(err);
  }
};

export const cancelSubscriptionAtPeriodEnd = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ status: 'error', message: 'No active subscription found' });
    }

    const subscription = await stripeService.updateSubscription(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    await updateSubscription(subscription);

    return res.status(200).json({
      status: 'success',
      message: 'Subscription will cancel at the end of the current billing period.',
    });
  } catch (err) {
    return next(err);
  }
};

export const resumeSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ status: 'error', message: 'No active subscription found' });
    }

    const subscription = await stripeService.updateSubscription(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
    await updateSubscription(subscription);

    return res.status(200).json({
      status: 'success',
      message: 'Subscription cancellation removed. Your plan will renew automatically.',
    });
  } catch (err) {
    return next(err);
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeService.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'checkout.session.async_payment_failed': {
        const failedSession = event.data.object;
        console.warn(
          `⚠️ Async checkout payment failed for session ${failedSession.id}`
        );
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await updateSubscription(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const deletedSubscription = event.data.object;
        await cancelSubscription(deletedSubscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripeService.getSubscription(
            invoice.subscription
          );
          await updateSubscription(subscription);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripeService.getSubscription(
            invoice.subscription
          );
          await updateSubscription(subscription);
        }
        break;
      }
      case 'payment_method.attached': {
        const paymentMethod = event.data.object;
        if (paymentMethod.customer) {
          // Ensure there is always a default card when at least one card exists.
          await stripeService.listCardPaymentMethods(paymentMethod.customer);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    return res.status(500).json({ received: false, message: err.message });
  }

  res.json({ received: true });
};

async function handleCheckoutSessionCompleted(session) {
  const mode = session.mode;
  const customerId = session.customer;

  if (!customerId) return;

  if (mode === 'setup') {
    // Card setup flow: make the newly setup card the primary/default card.
    if (session.setup_intent) {
      const setupIntentId =
        typeof session.setup_intent === 'string'
          ? session.setup_intent
          : session.setup_intent.id;
      const setupIntent = await stripeService.getSetupIntent(setupIntentId);
      const paymentMethodId = setupIntent.payment_method;
      if (paymentMethodId) {
        await stripeService.setDefaultPaymentMethod(customerId, paymentMethodId);
        return;
      }
    }

    await stripeService.listCardPaymentMethods(customerId);
    return;
  }

  if (mode === 'subscription' && session.subscription) {
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;
    const subscription = await stripeService.getSubscription(subscriptionId);
    await updateSubscription(subscription);
    return;
  }
}

async function updateSubscription(subscription) {
  const customerId = subscription.customer;
  const status = subscription.status;
  const priceId = subscription.items.data[0].price.id;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  await User.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      subscriptionStatus: status,
      subscriptionCurrentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
    }
  );
}

async function cancelSubscription(subscription) {
  const customerId = subscription.customer;
  await User.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      stripePriceId: null,
    }
  );
}
