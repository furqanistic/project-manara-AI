import User from '../models/User.js';
import { stripeService } from '../services/stripeService.js';

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { priceId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const customerId = await stripeService.getOrCreateCustomer(user);

    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription?success=true`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?canceled=true`;

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

export const createPortalSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ status: 'error', message: 'No active subscription found' });
    }

    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription`;
    const session = await stripeService.createPortalSession(user.stripeCustomerId, returnUrl);

    res.status(200).json({ status: 'success', url: session.url });
  } catch (err) {
    next(err);
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

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await updateSubscription(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await cancelSubscription(deletedSubscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

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
