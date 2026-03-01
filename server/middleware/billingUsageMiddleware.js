import { billingUsageService } from '../services/billingUsageService.js';

export const consumeUsage = ({ actionKey, units = null, shouldConsume = null }) => {
  return async (req, res, next) => {
    try {
      if (typeof shouldConsume === 'function' && !shouldConsume(req)) {
        return next();
      }

      const result = await billingUsageService.consumeUsageOrBlock({
        user: req.user,
        actionKey,
        explicitUnits: units,
      });

      if (!result?.enforced) {
        return next();
      }

      if (result.blocked) {
        return res.status(429).json({
          status: 'error',
          code: result.reasonCode || 'USAGE_LIMIT_REACHED',
          message: result.message || 'Usage limit reached.',
          data: {
            ...result.usage,
            upgradeCta:
              result.reasonCode === 'NO_ACTIVE_PLAN'
                ? 'Open Subscription'
                : result?.usage?.planId === 'plus'
                  ? 'Contact Sales'
                  : 'Upgrade Plan',
          },
        });
      }

      req.billingUsage = result.usage;
      const originalJson = res.json.bind(res);
      res.json = (payload) => {
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          return originalJson({
            ...payload,
            billingUsage: req.billingUsage,
          });
        }
        return originalJson(payload);
      };

      if (result.thresholdState === 'warn') {
        res.setHeader('X-Billing-Usage-Warning', 'USAGE_THRESHOLD_80');
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
