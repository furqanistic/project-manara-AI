import crypto from 'crypto';

const toBool = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
};

const toPercent = (value, defaultValue = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.min(100, Math.max(0, Math.round(parsed)));
};

const splitList = (value) => {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const getBucket = (seed) => {
  const hash = crypto.createHash('sha256').update(String(seed)).digest('hex');
  const bucket = Number.parseInt(hash.slice(0, 8), 16) % 100;
  return bucket;
};

const userInAllowlist = (user) => {
  const allowlist = splitList(process.env.BILLING_V2_ALLOWLIST || '');
  if (!allowlist.length) return false;

  const userId = String(user?._id || user?.id || '').trim().toLowerCase();
  const email = String(user?.email || '').trim().toLowerCase();
  return Boolean((userId && allowlist.includes(userId)) || (email && allowlist.includes(email)));
};

export const isBillingV2EnabledForUser = (user) => {
  if (!toBool(process.env.BILLING_V2_ENABLED, false)) return false;

  if (toBool(process.env.BILLING_V2_INTERNAL_ONLY, false)) {
    return userInAllowlist(user);
  }

  const rolloutPercent = toPercent(process.env.BILLING_V2_ROLLOUT_PERCENT, 100);
  if (rolloutPercent <= 0) return false;
  if (rolloutPercent >= 100) return true;

  const seed = String(user?._id || user?.id || user?.email || '');
  if (!seed) return false;
  return getBucket(seed) < rolloutPercent;
};

export const getBillingV2ThresholdPercent = () => {
  return toPercent(process.env.BILLING_V2_THRESHOLD_PERCENT, 80);
};
