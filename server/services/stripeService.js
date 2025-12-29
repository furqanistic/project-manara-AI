import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeService = {
  /**
   * Create or retrieve a Stripe customer for a user
   */
  getOrCreateCustomer: async (user) => {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
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
   * Create a checkout session for a subscription
   */
  createCheckoutSession: async (customerId, priceId, successUrl, cancelUrl) => {
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
  getSubscription: async (subscriptionId) => {
    return await stripe.subscriptions.retrieve(subscriptionId);
  },

  /**
   * Handle Stripe Webhook Events
   */
  constructEvent: (payload, sig, endpointSecret) => {
    return stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  }
};

export default stripe;
