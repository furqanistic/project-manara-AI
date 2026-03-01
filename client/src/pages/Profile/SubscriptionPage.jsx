import { motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  CreditCard,
  Crown,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from '../../components/Layout/Topbar';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { addCredits } from '../../lib/credits';
import { stripeService } from '../../services/stripeService';

const CREDIT_DEFINITIONS = [
  { label: '3D Render Set (1 room)', credits: 3 },
  { label: 'Extra style / variation', credits: 1 },
  { label: '2D Floor Plan / Cut', credits: 4 },
  { label: 'Shopping List + Supplier Suggestions', credits: 2 },
  { label: 'Small revision', credits: 1 },
  { label: 'Full Room Package (all of the above)', credits: 8 },
];

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Star,
    price: '199',
    credits: 20,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_STARTER,
    features: ['Best for testing', 'Mix and match outputs', 'Credits do not expire'],
  },
  {
    id: 'home',
    name: 'Home',
    icon: Sparkles,
    price: '449',
    credits: 50,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_HOME,
    popular: true,
    features: ['Great for multi-room projects', 'Enough for full packages', 'Credits do not expire'],
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: Crown,
    price: '799',
    credits: 100,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_PLUS,
    features: ['Best value', 'Ideal for teams', 'Credits do not expire'],
  },
];
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
const CREDIT_GRANT_PREFIX = 'manara_credit_grant';

const formatCardBrand = (brand) => {
  if (!brand) return 'Card';
  return brand.charAt(0).toUpperCase() + brand.slice(1);
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const SubscriptionPage = () => {
  const [billingData, setBillingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [subscriptionActionBusy, setSubscriptionActionBusy] = useState(null);
  const [busyCardId, setBusyCardId] = useState(null);
  const [showAddCardPrompt, setShowAddCardPrompt] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmLabel: '',
    tone: 'default',
    action: null,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const processedSearchRef = useRef('');

  const cards = billingData?.cards?.cards || [];
  const defaultPaymentMethodId = billingData?.cards?.defaultPaymentMethodId || null;
  const subscription = billingData?.subscription || {};

  const cardCount = cards.length;
  const hasCard = cardCount > 0;
  const hasSubscription = Boolean(subscription?.stripeSubscriptionId);
  const isCancelScheduled = Boolean(subscription?.cancelAtPeriodEnd);
  const activePlanId = subscription?.activePlanId || null;

  const subscriptionLabel = useMemo(() => {
    if (!subscription.subscriptionStatus || subscription.subscriptionStatus === 'none') {
      return 'No active subscription';
    }

    return subscription.subscriptionStatus.replace('_', ' ');
  }, [subscription.subscriptionStatus]);

  const nextBillingLabel = useMemo(() => {
    if (isLoading) return 'Loading...';
    if (!hasSubscription) return 'No active plan';
    return formatDate(subscription?.nextBillingDate) === 'N/A'
      ? 'Pending sync'
      : formatDate(subscription?.nextBillingDate);
  }, [hasSubscription, isLoading, subscription?.nextBillingDate]);
  const isUpdatingSubscription = Boolean(subscriptionActionBusy);

  const scheduledChangeLabel = useMemo(() => {
    const scheduledPlanName = subscription?.scheduledPlanName;
    const scheduledDate = formatDate(subscription?.scheduledChangeAt);
    if (!scheduledPlanName || scheduledDate === 'N/A') return null;
    return `${scheduledPlanName} on ${scheduledDate}`;
  }, [subscription?.scheduledPlanName, subscription?.scheduledChangeAt]);
  const hasScheduledPlanChange = Boolean(subscription?.scheduledPlanId && subscription?.scheduledChangeAt);

  const applyCreditsGrant = (grantKey, amount, description) => {
    const safeAmount = Math.max(0, Number(amount) || 0);
    if (!safeAmount || !grantKey || typeof window === 'undefined') return;

    const storageKey = `${CREDIT_GRANT_PREFIX}:${grantKey}`;
    if (localStorage.getItem(storageKey) === '1') return;

    addCredits(safeAmount, {
      source: 'subscription_purchase',
      description,
    });
    localStorage.setItem(storageKey, '1');
  };

  const refreshBillingStatus = async () => {
    const response = await stripeService.getBillingStatus();
    setBillingData(response?.data || null);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await refreshBillingStatus();
      } catch (error) {
        console.error('Billing status load error:', error);
        toast.error('Failed to load billing data.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!location.search || processedSearchRef.current === location.search) {
      return;
    }
    processedSearchRef.current = location.search;

    const params = new URLSearchParams(location.search);
    const checkoutSuccess = params.get('success');
    const cardSetup = params.get('card_setup');
    const sessionId = params.get('session_id');
    let shouldClearSearch = false;

    if (checkoutSuccess === 'true') {
      toast.success('Subscription checkout completed.', {
        id: 'stripe-subscription-success',
      });
      if (sessionId) {
        stripeService
          .syncCheckoutSession(sessionId)
          .then((syncResponse) => {
            const grantedCredits = Number(syncResponse?.data?.grantedCredits) || 0;
            const grantedPlanId = syncResponse?.data?.grantedPlanId || null;
            const creditGrantKey = syncResponse?.data?.creditGrantKey || `checkout:${sessionId}`;
            const fallbackCredits = grantedPlanId ? PLAN_CREDITS[grantedPlanId] || 0 : 0;
            const finalCredits = grantedCredits || fallbackCredits;

            if (finalCredits > 0) {
              applyCreditsGrant(
                creditGrantKey,
                finalCredits,
                `Plan purchase (${grantedPlanId || 'subscription'})`
              );
              toast.success(`${finalCredits} credits added to your account.`, {
                id: `credits-granted-${sessionId}`,
              });
            }
            return refreshBillingStatus();
          })
          .catch((error) => {
            console.error('Checkout sync failed:', error);
            refreshBillingStatus().catch(() => {});
          });
      } else {
        refreshBillingStatus().catch(() => {});
      }
      shouldClearSearch = true;
    }

    if (cardSetup === 'success') {
      toast.success('Card linked successfully.', {
        id: 'stripe-card-setup-success',
      });
      refreshBillingStatus().catch(() => {
        toast.error('Card linked, but failed to refresh billing data.', {
          id: 'stripe-card-refresh-failed',
        });
      });
      shouldClearSearch = true;
    }

    if (cardSetup === 'canceled') {
      toast('Card setup was canceled.', {
        id: 'stripe-card-setup-canceled',
      });
      shouldClearSearch = true;
    }

    if (shouldClearSearch) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  const handleAddCard = async () => {
    const toastId = 'stripe-card-setup-loading';
    setIsAddingCard(true);
    toast.loading('Preparing secure card setup...', { id: toastId });
    try {
      const response = await stripeService.createSetupSession();
      if (response?.url) {
        toast.loading('Redirecting to Stripe...', { id: toastId });
        window.location.href = response.url;
        return;
      }
      throw new Error('Missing setup session URL');
    } catch (error) {
      console.error('Setup session error:', error);
      toast.dismiss(toastId);
      toast.error(error?.response?.data?.message || 'Unable to start card setup.');
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleMakePrimary = async (paymentMethodId) => {
    setBusyCardId(paymentMethodId);
    try {
      const response = await stripeService.setDefaultPaymentMethod(paymentMethodId);
      setBillingData((prev) => ({
        ...(prev || {}),
        cards: response?.data || prev?.cards,
      }));
      toast.success('Primary card updated.');
    } catch (error) {
      console.error('Set default card error:', error);
      toast.error(error?.response?.data?.message || 'Failed to set primary card.');
    } finally {
      setBusyCardId(null);
    }
  };

  const handleRemoveCard = async (paymentMethodId) => {
    setBusyCardId(paymentMethodId);
    try {
      const response = await stripeService.deletePaymentMethod(paymentMethodId);
      setBillingData((prev) => ({
        ...(prev || {}),
        cards: response?.data || prev?.cards,
      }));
      toast.success('Card removed.');
    } catch (error) {
      console.error('Delete card error:', error);
      toast.error(error?.response?.data?.message || 'Failed to remove card.');
    } finally {
      setBusyCardId(null);
    }
  };

  const handlePlanOperation = async (plan) => {
    if (!hasCard) {
      setShowAddCardPrompt(true);
      return;
    }

    setProcessingPlanId(plan.id);
    try {
      const response = await stripeService.createCheckoutSession({
        planId: plan.id,
        priceId: plan.priceId,
      });

      if (response?.url) {
        window.location.href = response.url;
        return;
      }

      throw new Error('Missing checkout URL');
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast.error(error?.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const openConfirmDialog = ({
    title,
    description,
    confirmLabel,
    tone = 'default',
    action,
  }) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      confirmLabel,
      tone,
      action,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const executePlanChange = async (plan, options = {}) => {
    setProcessingPlanId(plan.id);
    try {
      const response = await stripeService.changeSubscriptionPlan({
        planId: plan.id,
        priceId: plan.priceId,
        renewNow: Boolean(options.renewNow),
      });
      const grantedCredits = Number(response?.grantedCredits) || 0;
      const creditGrantKey = response?.creditGrantKey || null;
      if (grantedCredits > 0) {
        applyCreditsGrant(creditGrantKey, grantedCredits, `Plan upgrade (${plan.name})`);
        toast.success(`${grantedCredits} credits added to your account.`, {
          id: `credits-upgrade-${plan.id}`,
        });
      }
      toast.success(response?.message || 'Plan updated successfully.');
      await refreshBillingStatus();
    } catch (error) {
      console.error('Change plan error:', error);
      toast.error(error?.response?.data?.message || 'Failed to change plan.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleChangePlan = async (plan) => {
    if (!hasCard) {
      setShowAddCardPrompt(true);
      return;
    }

    if (!hasSubscription) {
      await handlePlanOperation(plan);
      return;
    }

    if (activePlanId === plan.id) {
      openConfirmDialog({
        title: `Renew ${plan.name} now?`,
        description:
          'This will charge the full plan amount now, add a fresh credit pack immediately, and start a new billing period today.',
        confirmLabel: 'Renew Now',
        action: () => executePlanChange(plan, { renewNow: true }),
      });
      return;
    }

    const currentRank = PLAN_ORDER[activePlanId] || 0;
    const targetRank = PLAN_ORDER[plan.id] || 0;
    const isDowngrade = currentRank > 0 && targetRank > 0 && targetRank < currentRank;
    openConfirmDialog({
      title: isDowngrade ? `Downgrade to ${plan.name}?` : `Upgrade to ${plan.name}?`,
      description: isDowngrade
        ? `Your current plan remains active until the billing period ends, then your account moves to ${plan.name}.`
        : `Your account will move to ${plan.name} right away, and the prorated difference for this cycle will be charged immediately.`,
      confirmLabel: isDowngrade ? 'Schedule Downgrade' : 'Confirm Upgrade',
      action: () => executePlanChange(plan),
    });
  };

  const handleOpenPortal = async () => {
    try {
      const response = await stripeService.createPortalSession();
      if (response?.url) {
        window.location.href = response.url;
        return;
      }
      throw new Error('Missing portal URL');
    } catch (error) {
      console.error('Portal error:', error);
      toast.error(error?.response?.data?.message || 'Unable to open billing portal.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!hasSubscription) {
      toast.error('No active subscription found.');
      return;
    }

    openConfirmDialog({
      title: 'Cancel at period end?',
      description: 'Your plan stays active until the next billing date, then renewal stops automatically.',
      confirmLabel: 'Confirm Cancellation',
      tone: 'danger',
      action: async () => {
        setSubscriptionActionBusy('cancel_period');
        try {
          const response = await stripeService.cancelSubscription();
          toast.success(
            response?.message || 'Subscription set to cancel at period end.'
          );
          await refreshBillingStatus();
        } catch (error) {
          console.error('Cancel subscription error:', error);
          toast.error(
            error?.response?.data?.message || 'Unable to cancel subscription.'
          );
        } finally {
          setSubscriptionActionBusy(null);
        }
      },
    });
  };

  const handleResumeSubscription = async () => {
    if (!hasSubscription) {
      toast.error('No active subscription found.');
      return;
    }

    setSubscriptionActionBusy('resume');
    try {
      const response = await stripeService.resumeSubscription();
      toast.success(
        response?.message || 'Subscription renewed successfully.'
      );
      await refreshBillingStatus();
    } catch (error) {
      console.error('Resume subscription error:', error);
      toast.error(
        error?.response?.data?.message || 'Unable to resume subscription.'
      );
    } finally {
      setSubscriptionActionBusy(null);
    }
  };

  const handleCancelScheduledChange = async () => {
    if (!hasScheduledPlanChange) return;

    setSubscriptionActionBusy('cancel_schedule');
    try {
      const response = await stripeService.cancelScheduledPlanChange();
      toast.success(response?.message || 'Scheduled plan change canceled.');
      await refreshBillingStatus();
    } catch (error) {
      console.error('Cancel scheduled change error:', error);
      toast.error(
        error?.response?.data?.message || 'Unable to cancel scheduled change.'
      );
    } finally {
      setSubscriptionActionBusy(null);
    }
  };

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#937c60]/10'>
      <TopBar />

      <main className='max-w-[1400px] mx-auto pt-40 pb-24 px-8 md:px-16 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-20'
        >
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-[1px] bg-[#937c60] opacity-40'></div>
            <span className='text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase'>Account Management</span>
          </div>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight'>
            Manage <span className='text-[#937c60]'>billing</span>
          </h1>
        </motion.div>

        {!hasCard && !isLoading && (
          <div className='mb-8 p-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-start gap-3'>
            <CreditCard size={18} className='mt-0.5' />
            <div>
              <p className='font-semibold'>Card required</p>
              <p className='text-xs mt-1'>You must link at least one card before buying a plan.</p>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 xl:grid-cols-12 gap-12'>
          <div className='xl:col-span-9'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {CREDIT_PACKAGES.map((plan) => {
                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -5 }}
                    className={`relative p-8 rounded-[40px] bg-white dark:bg-[#111] border transition-all duration-300 flex flex-col ${
                      plan.popular
                        ? 'border-[#937c60] shadow-[0_20px_50px_rgba(147,124,96,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                        : 'border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:border-gray-200 dark:hover:border-white/20'
                    }`}
                  >
                    {plan.popular && (
                      <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-[#937c60] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest'>
                        Most Popular
                      </div>
                    )}

                    <div className='mb-8'>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.popular ? 'bg-[#937c60] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-300'}`}>
                        <plan.icon size={24} />
                      </div>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-1'>{plan.name}</h3>
                      <div className='flex items-baseline gap-1'>
                        <span className='text-3xl font-bold text-gray-900 dark:text-white'>{plan.price}</span>
                        <span className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase'>AED</span>
                      </div>
                      <p className='text-xs font-bold text-[#937c60] mt-2'>{plan.credits} credits</p>
                    </div>

                    <ul className='space-y-4 mb-10 flex-grow'>
                      {plan.features.map((f, i) => (
                        <li key={i} className='flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300 font-medium'>
                          <Check size={14} className={plan.popular ? 'text-[#937c60]' : 'text-gray-300'} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => {
                        if (hasSubscription) {
                          handleChangePlan(plan);
                          return;
                        }
                        handlePlanOperation(plan);
                      }}
                      disabled={
                        Boolean(processingPlanId) ||
                        isLoading ||
                        (hasScheduledPlanChange && subscription?.scheduledPlanId === plan.id)
                      }
                      className='w-full py-6 rounded-2xl font-bold text-sm transition-all bg-gray-900 hover:bg-black text-white disabled:opacity-60'
                    >
                      {processingPlanId === plan.id
                        ? 'Processing...'
                        : hasSubscription && activePlanId === plan.id
                          ? 'Renew Now'
                          : hasSubscription && hasScheduledPlanChange && subscription?.scheduledPlanId === plan.id
                            ? 'Scheduled'
                          : hasSubscription
                            ? (PLAN_ORDER[plan.id] || 0) < (PLAN_ORDER[activePlanId] || 0)
                              ? 'Downgrade at Renewal'
                              : 'Upgrade Now'
                            : 'Buy Plan'}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            <div className='mt-10 bg-white dark:bg-[#111] rounded-[32px] p-8 border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-[1px] bg-[#937c60] opacity-40'></div>
                <span className='text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase'>Credit Definitions</span>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {CREDIT_DEFINITIONS.map((item) => (
                  <div key={item.label} className='flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-sm font-semibold text-gray-700 dark:text-gray-200'>
                    <span>{item.label}</span>
                    <span className='text-[#937c60]'>{item.credits} credits</span>
                  </div>
                ))}
              </div>
              <p className='mt-6 text-xs text-gray-400 dark:text-gray-500'>Credits are always shown before you confirm an action.</p>
            </div>
          </div>

          <div className='xl:col-span-3 space-y-6'>
            <div className='bg-white dark:bg-[#111] rounded-[28px] p-6 md:p-8 border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
              <h4 className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-50'>Subscription</h4>

              <div className='space-y-6'>
                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Status</p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white capitalize'>{subscriptionLabel}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Current Plan</p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>{subscription?.planName || 'N/A'}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Next Billing Date</p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>{nextBillingLabel}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Renewal</p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>
                    {!hasSubscription ? 'No active renewal' : isCancelScheduled ? 'Will cancel at period end' : 'Auto-renew enabled'}
                  </p>
                </div>

                {scheduledChangeLabel ? (
                  <div className='space-y-1'>
                    <p className='text-[10px] font-bold text-gray-400 uppercase'>Scheduled Change</p>
                    <p className='text-sm font-bold text-gray-900 dark:text-white'>{scheduledChangeLabel}</p>
                  </div>
                ) : null}

                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Linked Cards</p>
                  <div className='flex items-center gap-2'>
                    <CreditCard size={14} className='text-gray-400' />
                    <p className='text-sm font-bold text-gray-900 dark:text-white'>
                      {isLoading ? 'Loading...' : `${cardCount} card(s)`}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  {hasScheduledPlanChange ? (
                    <Button
                      onClick={handleCancelScheduledChange}
                      disabled={isUpdatingSubscription}
                      className='w-full h-9 px-3 text-[11px] rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:opacity-60 dark:bg-transparent dark:border-white/20 dark:text-white dark:hover:bg-white/5'
                    >
                      {subscriptionActionBusy === 'cancel_schedule' ? 'Updating...' : 'Cancel Scheduled Change'}
                    </Button>
                  ) : null}
                  <Button
                    onClick={isCancelScheduled ? handleResumeSubscription : handleCancelSubscription}
                    disabled={isUpdatingSubscription || !hasSubscription}
                    className='w-full h-9 px-3 text-[11px] rounded-xl bg-gray-900 text-white disabled:opacity-60'
                  >
                    {(subscriptionActionBusy === 'cancel_period' || subscriptionActionBusy === 'resume')
                      ? 'Updating...'
                      : !hasSubscription
                        ? 'No Active Plan'
                      : isCancelScheduled
                        ? 'Resume Subscription'
                        : 'Cancel At Period End'}
                  </Button>
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-[#111] rounded-[28px] p-6 md:p-8 border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
              <h4 className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100 dark:border-white/10'>Payment Method</h4>

              <div className='space-y-4'>
                {cards.length === 0 && !isLoading && (
                  <div className='text-xs text-gray-500'>No card added yet.</div>
                )}

                {cards.map((card) => {
                  const isPrimary = card.id === defaultPaymentMethodId;
                  const isBusy = busyCardId === card.id;
                  return (
                    <div key={card.id} className='rounded-xl border border-gray-200 dark:border-white/15 p-4 space-y-3 bg-gray-50/50 dark:bg-white/[0.02]'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p className='text-sm font-bold text-gray-900 dark:text-white'>
                            {formatCardBrand(card.brand)} •••• {card.last4}
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>Exp {card.expMonth}/{card.expYear}</p>
                        </div>
                        {isPrimary ? (
                          <span className='text-[10px] px-2 py-1 rounded-full bg-[#937c60]/10 text-[#937c60] font-bold uppercase tracking-wide'>
                            Primary
                          </span>
                        ) : null}
                      </div>

                      <div className='flex items-center gap-2'>
                        {!isPrimary && (
                          <Button
                            onClick={() => handleMakePrimary(card.id)}
                            disabled={isBusy}
                            className='h-8 px-3 text-[11px] bg-gray-900 text-white rounded-lg'
                          >
                            {isBusy ? 'Saving...' : 'Make Primary'}
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRemoveCard(card.id)}
                          disabled={isBusy || cards.length <= 1}
                          className='h-8 px-3 text-[11px] bg-transparent border border-red-200 text-red-600 rounded-lg hover:bg-red-50'
                        >
                          <Trash2 size={12} className='mr-1' />
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <Button
                  onClick={handleAddCard}
                  disabled={isAddingCard}
                  className='w-full bg-gray-900 text-white py-4 rounded-lg font-bold text-xs'
                >
                  {isAddingCard ? 'Redirecting to secure checkout...' : 'Add Card'}
                </Button>
              </div>
            </div>

            <div className='bg-gray-900 dark:bg-black rounded-[40px] p-8 text-white relative overflow-hidden'>
              <div className='relative z-10'>
                <h4 className='text-xs font-bold text-[#937c60] uppercase tracking-widest mb-4'>Billing Help</h4>
                <p className='text-[11px] text-gray-300 mb-4'>
                  You must keep at least one saved card. If multiple cards are linked, one card is always primary.
                </p>
                <Button
                  onClick={handleOpenPortal}
                  className='w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-xs mb-4'
                >
                  Open my payment portal
                </Button>
                <a
                  href='mailto:billing@manaradesign.ai'
                  className='text-xs font-bold flex items-center gap-2 hover:text-[#937c60] transition-colors'
                >
                  Contact Billing
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) closeConfirmDialog();
        }}
      >
        <DialogContent
          showCloseButton={!processingPlanId && !isUpdatingSubscription}
          className='max-w-md rounded-2xl border border-gray-200 dark:border-white/20 bg-white dark:bg-[#0f0f0f] p-6'
        >
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-gray-900 dark:text-white'>
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className='text-sm text-gray-600 dark:text-gray-300'>
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4 gap-2 sm:justify-end'>
            <Button
              onClick={closeConfirmDialog}
              disabled={Boolean(processingPlanId) || isUpdatingSubscription}
              className='h-9 px-4 rounded-lg bg-transparent border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
            >
              Back
            </Button>
            <Button
              onClick={async () => {
                const action = confirmDialog.action;
                if (!action) return;
                try {
                  await action();
                } finally {
                  closeConfirmDialog();
                }
              }}
              disabled={Boolean(processingPlanId) || isUpdatingSubscription}
              className={`h-9 px-4 rounded-lg text-white ${
                confirmDialog.tone === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-900 hover:bg-black'
              }`}
            >
              {Boolean(processingPlanId) || isUpdatingSubscription
                ? 'Processing...'
                : confirmDialog.confirmLabel || 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCardPrompt} onOpenChange={setShowAddCardPrompt}>
        <DialogContent className='max-w-md rounded-2xl border border-gray-200 dark:border-white/20 bg-white dark:bg-[#0f0f0f] p-6'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-gray-900 dark:text-white'>
              Add a card to continue
            </DialogTitle>
            <DialogDescription className='text-sm text-gray-600 dark:text-gray-300'>
              A payment method is required before buying, renewing, or changing your plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4 gap-2 sm:justify-end'>
            <Button
              onClick={() => setShowAddCardPrompt(false)}
              disabled={isAddingCard}
              className='h-9 px-4 rounded-lg bg-transparent border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
            >
              Not now
            </Button>
            <Button
              onClick={async () => {
                setShowAddCardPrompt(false);
                await handleAddCard();
              }}
              disabled={isAddingCard}
              className='h-9 px-4 rounded-lg bg-gray-900 hover:bg-black text-white'
            >
              {isAddingCard ? 'Preparing...' : 'Add a card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;
