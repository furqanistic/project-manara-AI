import User from '../models/User.js';
import StripeWebhookEvent from '../models/StripeWebhookEvent.js';
import { billingUsageService } from '../services/billingUsageService.js';
import { stripeService } from '../services/stripeService.js';

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const ACTIVE_SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'unpaid'];
const PLAN_ORDER = {
  starter: 1,
  home: 2,
  plus: 3,
};
const PLAN_CREDITS = {
  starter: 20,
  home: 50,
  plus: 100,
};
const PLAN_PRICES_AED = {
  starter: 199,
  home: 449,
  plus: 799,
};

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

const getPlanCatalog = async () => {
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

  const priceToPlanId = {};
  if (starterPrice) priceToPlanId[starterPrice] = 'starter';
  if (homePrice) priceToPlanId[homePrice] = 'home';
  if (plusPrice) priceToPlanId[plusPrice] = 'plus';

  const priceToPlanName = {};
  if (starterPrice) priceToPlanName[starterPrice] = 'Starter';
  if (homePrice) priceToPlanName[homePrice] = 'Home';
  if (plusPrice) priceToPlanName[plusPrice] = 'Plus';

  return {
    starterPrice,
    homePrice,
    plusPrice,
    priceToPlanId,
    priceToPlanName,
  };
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { planId, priceId: requestedPriceId, purchaseType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    const cardState = await stripeService.listCardPaymentMethods(customerId);
    if (!cardState.cards.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Please link at least one card before purchasing a plan.',
      });
    }

    if (purchaseType === 'topup') {
      const hasActiveSubscription = Boolean(
        user.stripeSubscriptionId && ACTIVE_SUBSCRIPTION_STATUSES.includes(user.subscriptionStatus)
      );
      if (!hasActiveSubscription) {
        return res.status(400).json({
          status: 'error',
          code: 'ACTIVE_PLAN_REQUIRED',
          message: 'You need an active plan before buying additional credits.',
        });
      }

      const topupPlanId = planId && PLAN_CREDITS[planId] ? planId : null;
      if (!topupPlanId) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid top-up plan selected.',
        });
      }

      const session = await stripeService.createTopupCheckoutSession(customerId, {
        planId: topupPlanId,
        credits: PLAN_CREDITS[topupPlanId],
        amountAed: PLAN_PRICES_AED[topupPlanId],
        successUrl: `${getFrontendUrl()}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${getFrontendUrl()}/pricing?canceled=true`,
      });

      return res.status(200).json({ status: 'success', url: session.url });
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

    const successUrl = `${getFrontendUrl()}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${getFrontendUrl()}/subscription?canceled=true`;

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
    let scheduledPlanId = null;
    let scheduledPlanName = null;
    let scheduledChangeAt = null;

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
        await updateSubscription(subscription);
        user = await User.findById(req.user.id);
        nextBillingDate = user.subscriptionCurrentPeriodEnd || null;

        const scheduleId =
          typeof subscription?.schedule === 'string'
            ? subscription.schedule
            : subscription?.schedule?.id || null;

        if (scheduleId) {
          try {
            const schedule = await stripeService.getSubscriptionSchedule(scheduleId);
            const phases = Array.isArray(schedule?.phases) ? schedule.phases : [];
            const nowUnix = Math.floor(Date.now() / 1000);
            const currentIndex = phases.findIndex((phase) => {
              const start = Number(phase?.start_date || 0);
              const end = Number(phase?.end_date || 0);
              return start > 0 && end > 0 && nowUnix >= start && nowUnix < end;
            });

            let nextPhase = null;
            if (currentIndex >= 0 && phases[currentIndex + 1]) {
              nextPhase = phases[currentIndex + 1];
            } else {
              nextPhase = phases.find((phase) => Number(phase?.start_date || 0) > nowUnix) || null;
            }

            if (nextPhase) {
              const nextPriceId =
                typeof nextPhase?.items?.[0]?.price === 'string'
                  ? nextPhase.items[0].price
                  : nextPhase?.items?.[0]?.price?.id || null;
              const nextStartUnix = Number(nextPhase?.start_date || 0);
              if (nextPriceId) {
                const { priceToPlanId, priceToPlanName } = await getPlanCatalog();
                scheduledPlanId = priceToPlanId[nextPriceId] || null;
                scheduledPlanName = priceToPlanName[nextPriceId] || 'Custom Plan';
              }
              if (Number.isFinite(nextStartUnix) && nextStartUnix > 0) {
                scheduledChangeAt = new Date(nextStartUnix * 1000);
              }
            }
          } catch (scheduleError) {
            console.warn('Unable to load subscription schedule details:', scheduleError.message);
          }
        }
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

    const { starterPrice, homePrice, plusPrice, priceToPlanName } = await getPlanCatalog();

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
      resolvedPlanName = priceToPlanName[stripePriceId] || 'Custom Plan';
    }

    const usageSnapshot = await billingUsageService.getCurrentUsageStatus(user);

    return res.status(200).json({
      status: 'success',
      data: {
        customerId,
        cards,
        billingModel: usageSnapshot?.billingModel || 'v1_credits',
        usage: usageSnapshot?.usage || null,
        subscription: {
          subscriptionStatus: user.subscriptionStatus,
          stripeSubscriptionId: user.stripeSubscriptionId,
          stripePriceId,
          subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
          nextBillingDate,
          cancelAtPeriodEnd: user.cancelAtPeriodEnd,
          planName: resolvedPlanName,
          activePlanId,
          scheduledPlanId,
          scheduledPlanName,
          scheduledChangeAt,
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
    const sessionCustomerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;
    if (sessionCustomerId !== customerId) {
      return res.status(403).json({ status: 'error', message: 'Invalid checkout session for this user' });
    }

    await handleCheckoutSessionCompleted(session);

    let grantedCredits = 0;
    let grantedPlanId = null;
    let creditGrantKey = session.id ? `checkout:${session.id}` : null;
    const isTopupCheckout =
      session.mode === 'payment' &&
      session?.metadata?.purchaseType === 'topup';

    if (isTopupCheckout) {
      grantedPlanId = session?.metadata?.planId || null;
      grantedCredits = Number(session?.metadata?.credits) || 0;
      creditGrantKey = session.id ? `topup:${session.id}` : null;
    }

    if (session.mode === 'subscription' && session.subscription) {
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

      if (subscriptionId) {
        const subscription = await stripeService.getSubscription(subscriptionId);
        const priceId = subscription?.items?.data?.[0]?.price?.id || null;
        if (priceId) {
          const { priceToPlanId } = await getPlanCatalog();
          grantedPlanId = priceToPlanId[priceId] || null;
          grantedCredits = grantedPlanId ? PLAN_CREDITS[grantedPlanId] || 0 : 0;
        }
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        grantedCredits,
        grantedPlanId,
        creditGrantKey,
      },
    });
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

export const cancelScheduledPlanChange = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ status: 'error', message: 'No active subscription found' });
    }

    const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
    const scheduleId =
      typeof subscription?.schedule === 'string'
        ? subscription.schedule
        : subscription?.schedule?.id || null;

    if (!scheduleId) {
      return res.status(400).json({
        status: 'error',
        message: 'No scheduled plan change found.',
      });
    }

    await stripeService.releaseSubscriptionSchedule(scheduleId);
    await updateSubscription(subscription);

    return res.status(200).json({
      status: 'success',
      message: 'Scheduled plan change canceled.',
    });
  } catch (err) {
    return next(err);
  }
};

export const changeSubscriptionPlan = async (req, res, next) => {
  try {
    const { planId, priceId: requestedPriceId, renewNow } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ status: 'error', message: 'No active subscription found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);
    const cardState = await stripeService.listCardPaymentMethods(customerId);
    if (!cardState.cards.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Please link at least one card before changing plan.',
      });
    }

    const configuredId = resolvePriceId({ planId, priceId: requestedPriceId });
    if (!configuredId) {
      return res.status(400).json({
        status: 'error',
        message:
          'No Stripe price configured for this plan. Set STRIPE_PRICE_ID_STARTER/HOME/PLUS or pass a priceId.',
      });
    }

    const targetPriceId = await stripeService.resolveRecurringPriceId(configuredId);
    const { priceToPlanId, priceToPlanName } = await getPlanCatalog();

    const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
    const currentItem = subscription?.items?.data?.[0];
    const currentPriceId = currentItem?.price?.id;
    if (!currentItem?.id || !currentPriceId) {
      return res.status(400).json({
        status: 'error',
        message: 'Unable to determine current subscription line item.',
      });
    }

    const currentPlanId = priceToPlanId[currentPriceId] || null;
    const targetPlanId = planId || priceToPlanId[targetPriceId] || null;
    const currentRank = currentPlanId ? PLAN_ORDER[currentPlanId] || 0 : 0;
    const targetRank = targetPlanId ? PLAN_ORDER[targetPlanId] || 0 : 0;
    const scheduleId =
      typeof subscription?.schedule === 'string'
        ? subscription.schedule
        : subscription?.schedule?.id || null;

    if (currentPriceId === targetPriceId) {
      if (!renewNow) {
        return res.status(400).json({
          status: 'error',
          message: 'You are already on this plan.',
        });
      }

      if (scheduleId) {
        await stripeService.releaseSubscriptionSchedule(scheduleId);
      }

      const renewedSubscription = await stripeService.updateSubscription(subscription.id, {
        cancel_at_period_end: false,
        proration_behavior: 'none',
        billing_cycle_anchor: 'now',
        items: [{ id: currentItem.id, price: currentPriceId }],
      });

      await updateSubscription(renewedSubscription);
      return res.status(200).json({
        status: 'success',
        action: 'renewed',
        grantedCredits: currentPlanId ? PLAN_CREDITS[currentPlanId] || 0 : 0,
        creditGrantKey: `renew:${subscription.id}:${currentPriceId}:${renewedSubscription.current_period_end || 'na'}`,
        message: `Plan renewed. Your new billing period starts today.`,
      });
    }

    if (currentRank > 0 && targetRank > 0 && targetRank < currentRank) {
      if (scheduleId) {
        return res.status(409).json({
          status: 'error',
          message:
            'A downgrade is already scheduled. Cancel the scheduled change before selecting another downgrade.',
        });
      }

      const schedule = await stripeService.createSubscriptionScheduleFromSubscription(subscription.id);
      const schedulePhase = schedule?.phases?.[0] || {};
      const phaseStartDate = Number(schedulePhase.start_date || subscription.current_period_start || 0);
      const phaseEndDate = Number(schedulePhase.end_date || subscription.current_period_end || 0);
      const hasPhaseStart = Number.isFinite(phaseStartDate) && phaseStartDate > 0;
      const hasPhaseEnd = Number.isFinite(phaseEndDate) && phaseEndDate > 0;
      await stripeService.updateSubscriptionSchedule(schedule.id, {
        end_behavior: 'release',
        phases: [
          {
            items: [{ price: currentPriceId, quantity: 1 }],
            ...(hasPhaseStart ? { start_date: phaseStartDate } : {}),
            ...(hasPhaseEnd
              ? { end_date: phaseEndDate }
              : { duration: { interval: 'month', interval_count: 1 } }),
          },
          {
            items: [{ price: targetPriceId, quantity: 1 }],
            ...(hasPhaseEnd
              ? { start_date: phaseEndDate }
              : {}),
          },
        ],
      });

      await updateSubscription(subscription);
      return res.status(200).json({
        status: 'success',
        action: 'scheduled_downgrade',
        grantedCredits: 0,
        creditGrantKey: null,
        message: `Downgrade to ${priceToPlanName[targetPriceId] || 'selected plan'} scheduled for your next billing date.`,
      });
    }

    if (scheduleId) {
      await stripeService.releaseSubscriptionSchedule(scheduleId);
    }

    const updatedSubscription = await stripeService.updateSubscription(subscription.id, {
      cancel_at_period_end: false,
      proration_behavior: 'always_invoice',
      billing_cycle_anchor: 'unchanged',
      items: [{ id: currentItem.id, price: targetPriceId }],
    });

    await updateSubscription(updatedSubscription);
    return res.status(200).json({
      status: 'success',
      action: 'immediate_change',
      grantedCredits: targetPlanId ? PLAN_CREDITS[targetPlanId] || 0 : 0,
      creditGrantKey: `upgrade:${subscription.id}:${targetPriceId}:${updatedSubscription.current_period_end || 'na'}`,
      message: `Switched to ${priceToPlanName[targetPriceId] || 'selected plan'} immediately.`,
    });
  } catch (err) {
    return next(err);
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  if (!webhookSecret) {
    return res.status(500).json({
      received: false,
      message: 'STRIPE_WEBHOOK_SECRET is not configured.',
    });
  }

  if (!sig) {
    return res.status(400).json({
      received: false,
      message: 'Missing stripe-signature header.',
    });
  }

  try {
    event = stripeService.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let webhookEvent = await StripeWebhookEvent.findOne({ eventId: event.id });
  if (webhookEvent?.status === 'success') {
    return res.json({ received: true, duplicate: true });
  }

  if (!webhookEvent) {
    try {
      webhookEvent = await StripeWebhookEvent.create({
        eventId: event.id,
        type: event.type,
        status: 'pending',
      });
    } catch (error) {
      if (error?.code === 11000) {
        webhookEvent = await StripeWebhookEvent.findOne({ eventId: event.id });
        if (webhookEvent?.status === 'success') {
          return res.json({ received: true, duplicate: true });
        }
      } else {
        console.error('Webhook idempotency persistence error:', error);
        return res.status(500).json({ received: false, message: 'Failed to persist webhook event.' });
      }
    }
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

    await StripeWebhookEvent.findOneAndUpdate(
      { eventId: event.id },
      {
        status: 'success',
        processedAt: new Date(),
        error: null,
      }
    );
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    await StripeWebhookEvent.findOneAndUpdate(
      { eventId: event.id },
      {
        status: 'failed',
        processedAt: new Date(),
        error: String(err.message || err),
      }
    );
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
  const normalized = normalizeSubscriptionPayload(subscription);
  if (!normalized.customerId) return;

  await User.findOneAndUpdate(
    { stripeCustomerId: normalized.customerId },
    {
      stripeSubscriptionId: normalized.stripeSubscriptionId,
      stripePriceId: normalized.stripePriceId,
      subscriptionStatus: normalized.subscriptionStatus,
      subscriptionCurrentPeriodEnd: normalized.subscriptionCurrentPeriodEnd,
      cancelAtPeriodEnd: normalized.cancelAtPeriodEnd,
    }
  );
}

const normalizeSubscriptionPayload = (subscription) => {
  const customerId =
    typeof subscription?.customer === 'string'
      ? subscription.customer
      : subscription?.customer?.id;
  const status = subscription?.status || 'none';
  const priceId = subscription?.items?.data?.[0]?.price?.id || null;
  const cancelAtPeriodEnd = Boolean(subscription?.cancel_at_period_end);

  const unixPeriodEnd = Number(
    subscription?.current_period_end ||
      subscription?.cancel_at ||
      subscription?.trial_end ||
      0
  );
  const currentPeriodEnd =
    Number.isFinite(unixPeriodEnd) && unixPeriodEnd > 0
      ? new Date(unixPeriodEnd * 1000)
      : null;

  return {
    customerId,
    stripeSubscriptionId: subscription?.id || null,
    stripePriceId: priceId,
    subscriptionStatus: status,
    subscriptionCurrentPeriodEnd: currentPeriodEnd,
    cancelAtPeriodEnd,
  };
};

async function cancelSubscription(subscription) {
  const customerId =
    typeof subscription?.customer === 'string'
      ? subscription.customer
      : subscription?.customer?.id;
  if (!customerId) return;
  await User.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      stripePriceId: null,
      cancelAtPeriodEnd: false,
    }
  );
}
