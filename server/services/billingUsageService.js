import BillingUsage from '../models/BillingUsage.js';
import { stripeService } from './stripeService.js';
import { getBillingV2ThresholdPercent, isBillingV2EnabledForUser } from './billingFeatureFlags.js';

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['trialing', 'active', 'past_due', 'unpaid']);

const PLAN_LIMITS = {
  starter: 20,
  home: 50,
  plus: 100,
};

const ACTION_UNITS = {
  moodboard_generate: 1,
  moodboard_regenerate: 1,
  floorplan_generate_image: 4,
  floorplan_edit_image: 1,
  threed_generate: 3,
  threed_visualize: 1,
  threed_meshy_generate: 1,
};

let planCatalogCache = null;
let planCatalogCachedAt = 0;
const PLAN_CATALOG_TTL_MS = 5 * 60 * 1000;

const monthAgo = (date) => {
  const previous = new Date(date.getTime());
  previous.setMonth(previous.getMonth() - 1);
  return previous;
};

const monthAhead = (date) => {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + 1);
  return next;
};

const getPeriodBounds = (user) => {
  const now = new Date();
  const periodEnd = user?.subscriptionCurrentPeriodEnd ? new Date(user.subscriptionCurrentPeriodEnd) : null;

  if (!periodEnd || Number.isNaN(periodEnd.getTime()) || periodEnd <= now) {
    const fallbackStart = now;
    return {
      billingPeriodStart: fallbackStart,
      billingPeriodEnd: monthAhead(fallbackStart),
    };
  }

  return {
    billingPeriodStart: monthAgo(periodEnd),
    billingPeriodEnd: periodEnd,
  };
};

const getPlanCatalog = async () => {
  const now = Date.now();
  if (planCatalogCache && now - planCatalogCachedAt < PLAN_CATALOG_TTL_MS) {
    return planCatalogCache;
  }

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

  planCatalogCache = { priceToPlanId };
  planCatalogCachedAt = now;
  return planCatalogCache;
};

const resolvePlanId = async (user) => {
  if (!user?.stripePriceId) return null;
  const catalog = await getPlanCatalog();
  return catalog.priceToPlanId[user.stripePriceId] || null;
};

const ensureUsageRecord = async ({ userId, planId, limitUnits, billingPeriodStart, billingPeriodEnd }) => {
  let usage = await BillingUsage.findOne({
    userId,
    billingPeriodStart,
    billingPeriodEnd,
  });

  if (!usage) {
    try {
      usage = await BillingUsage.create({
        userId,
        planId,
        billingPeriodStart,
        billingPeriodEnd,
        usedUnits: 0,
        limitUnits,
      });
    } catch (error) {
      if (error?.code === 11000) {
        usage = await BillingUsage.findOne({
          userId,
          billingPeriodStart,
          billingPeriodEnd,
        });
      } else {
        throw error;
      }
    }
  } else if (usage.limitUnits !== limitUnits || usage.planId !== planId) {
    usage.limitUnits = limitUnits;
    usage.planId = planId;
    await usage.save();
  }

  return usage;
};

const buildState = ({ usedUnits, limitUnits, thresholdPercent }) => {
  const percent = limitUnits > 0 ? Math.round((usedUnits / limitUnits) * 100) : 0;
  const state = usedUnits >= limitUnits ? 'blocked' : percent >= thresholdPercent ? 'warn' : 'ok';
  return { percent, state };
};

export const billingUsageService = {
  PLAN_LIMITS,
  ACTION_UNITS,

  isBillingV2EnabledForUser,

  consumeUsageOrBlock: async ({ user, actionKey, explicitUnits = null }) => {
    if (!isBillingV2EnabledForUser(user)) {
      return { enforced: false };
    }

    const units = Number.isFinite(Number(explicitUnits))
      ? Math.max(0, Number(explicitUnits))
      : ACTION_UNITS[actionKey] || 0;

    const planId = await resolvePlanId(user);
    const limitUnits = planId ? PLAN_LIMITS[planId] || 0 : 0;
    const thresholdPercent = getBillingV2ThresholdPercent();

    if (!ACTIVE_SUBSCRIPTION_STATUSES.has(user?.subscriptionStatus) || !planId || limitUnits <= 0) {
      return {
        enforced: true,
        blocked: true,
        reasonCode: 'NO_ACTIVE_PLAN',
        message: 'An active subscription plan is required to continue.',
        usage: {
          usedUnits: 0,
          limitUnits: 0,
          percent: 100,
          state: 'blocked',
        },
      };
    }

    const { billingPeriodStart, billingPeriodEnd } = getPeriodBounds(user);
    await ensureUsageRecord({
      userId: user._id,
      planId,
      limitUnits,
      billingPeriodStart,
      billingPeriodEnd,
    });

    const current = await BillingUsage.findOne({
      userId: user._id,
      billingPeriodStart,
      billingPeriodEnd,
    });

    if (!current) {
      throw new Error('Failed to initialize billing usage state.');
    }

    if (current.usedUnits + units > limitUnits) {
      const state = buildState({
        usedUnits: current.usedUnits,
        limitUnits,
        thresholdPercent,
      });
      return {
        enforced: true,
        blocked: true,
        reasonCode: 'USAGE_LIMIT_REACHED',
        message:
          planId === 'plus'
            ? 'You reached your monthly Plus plan limit. Contact sales to increase your capacity.'
            : 'You reached your monthly plan limit. Upgrade your plan to continue.',
        usage: {
          usedUnits: current.usedUnits,
          limitUnits,
          percent: state.percent,
          state: 'blocked',
          planId,
          billingPeriodStart,
          billingPeriodEnd,
          nextResetAt: billingPeriodEnd,
        },
      };
    }

    const updated = await BillingUsage.findOneAndUpdate(
      {
        _id: current._id,
        usedUnits: current.usedUnits,
      },
      {
        $inc: { usedUnits: units },
        $set: {
          planId,
          limitUnits,
        },
      },
      { new: true }
    );

    if (!updated) {
      return billingUsageService.consumeUsageOrBlock({ user, actionKey, explicitUnits });
    }

    const state = buildState({
      usedUnits: updated.usedUnits,
      limitUnits,
      thresholdPercent,
    });

    return {
      enforced: true,
      blocked: false,
      thresholdState: state.state,
      usage: {
        usedUnits: updated.usedUnits,
        limitUnits,
        percent: state.percent,
        state: state.state,
        planId,
        billingPeriodStart,
        billingPeriodEnd,
        nextResetAt: billingPeriodEnd,
      },
    };
  },

  getCurrentUsageStatus: async (user) => {
    const enabled = isBillingV2EnabledForUser(user);
    if (!enabled) {
      return {
        billingModel: 'v1_credits',
        usage: null,
      };
    }

    const planId = await resolvePlanId(user);
    const limitUnits = planId ? PLAN_LIMITS[planId] || 0 : 0;
    const thresholdPercent = getBillingV2ThresholdPercent();
    const { billingPeriodStart, billingPeriodEnd } = getPeriodBounds(user);

    if (!ACTIVE_SUBSCRIPTION_STATUSES.has(user?.subscriptionStatus) || !planId || limitUnits <= 0) {
      return {
        billingModel: 'v2_subscription_usage',
        usage: {
          usedUnits: 0,
          limitUnits: 0,
          percent: 0,
          thresholdState: 'blocked',
          planId: planId || null,
          billingPeriodStart,
          billingPeriodEnd,
          nextResetAt: billingPeriodEnd,
          thresholdPercent,
        },
      };
    }

    const usage = await ensureUsageRecord({
      userId: user._id,
      planId,
      limitUnits,
      billingPeriodStart,
      billingPeriodEnd,
    });

    const state = buildState({
      usedUnits: usage.usedUnits,
      limitUnits,
      thresholdPercent,
    });

    return {
      billingModel: 'v2_subscription_usage',
      usage: {
        usedUnits: usage.usedUnits,
        limitUnits,
        percent: state.percent,
        thresholdState: state.state,
        planId,
        billingPeriodStart,
        billingPeriodEnd,
        nextResetAt: billingPeriodEnd,
        thresholdPercent,
      },
    };
  },
};
