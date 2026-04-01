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

  const isUpdatingSubscription = Boolean(subscriptionActionBusy);

  const scheduledChangeLabel = useMemo(() => {
    const scheduledPlanName = subscription?.scheduledPlanName;
    const scheduledDate = formatDate(subscription?.scheduledChangeAt);
    if (!scheduledPlanName || scheduledDate === 'N/A') return null;
    return `${scheduledPlanName} on ${scheduledDate}`;
  }, [subscription?.scheduledPlanName, subscription?.scheduledChangeAt]);
  const hasScheduledPlanChange = Boolean(subscription?.scheduledPlanId && subscription?.scheduledChangeAt);
  const hasAnyScheduledDowngrade = hasScheduledPlanChange;
  const activePlanRank = PLAN_ORDER[activePlanId] || 0;
  const isDowngradeOption = (planId) => {
    const targetRank = PLAN_ORDER[planId] || 0;
    return activePlanRank > 0 && targetRank > 0 && targetRank < activePlanRank;
  };

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
    if (isDowngrade && hasAnyScheduledDowngrade) {
      toast.error('A downgrade is already scheduled. Cancel it first to choose another plan.');
      return;
    }

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

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#937c60]/10'>
        <TopBar />
        <main className='max-w-[1400px] mx-auto pt-32 pb-20 px-4 md:px-8'>
          <div className='animate-pulse space-y-4 mb-8'>
            <div className='h-4 w-24 rounded bg-gray-200/80 dark:bg-white/10' />
            <div className='h-10 w-72 rounded bg-gray-200/80 dark:bg-white/10' />
            <div className='h-4 w-96 max-w-full rounded bg-gray-200/80 dark:bg-white/10' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-3 mb-6'>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className='animate-pulse h-24 rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-[#111]' />
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4'>
              {[1, 2, 3].map((item) => (
                <div key={item} className='animate-pulse h-80 rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-[#111]' />
              ))}
            </div>
            <div className='space-y-4'>
              <div className='animate-pulse h-56 rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-[#111]' />
              <div className='animate-pulse h-56 rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-[#111]' />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#937c60]/10'>
      <TopBar />

      <main className='max-w-[1400px] mx-auto pt-32 pb-20 px-4 md:px-8'>
        <div className='mb-8'>
          <p className='text-[11px] font-bold tracking-[0.25em] text-[#937c60] uppercase'>Billing</p>
          <h1 className='mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight'>
            Subscription & Payment
          </h1>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-2xl'>
            Choose a plan, manage renewal, and update cards. Everything here is focused on active billing actions.
          </p>
        </div>

        {!hasCard ? (
          <div className='mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3'>
            <CreditCard size={18} className='mt-0.5' />
            <div>
              <p className='text-sm font-semibold'>Add a card to activate plans</p>
              <p className='text-xs mt-1'>A saved payment method is required before buying, renewing, or switching plans.</p>
            </div>
          </div>
        ) : null}

        {scheduledChangeLabel ? (
          <div className='mb-6 rounded-2xl border border-[#937c60]/30 bg-[#937c60]/5 p-4 text-sm text-[#6f5a42] dark:text-[#d8c8b2]'>
            Scheduled change: <span className='font-semibold'>{scheduledChangeLabel}</span>
          </div>
        ) : null}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <section className='lg:col-span-2'>
            <div className='mb-3 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Choose Plan</h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>Credits are added immediately after successful billing.</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {CREDIT_PACKAGES.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-5 bg-white dark:bg-[#111] flex flex-col ${
                    plan.popular
                      ? 'border-[#937c60]/50 shadow-[0_8px_30px_rgba(147,124,96,0.12)]'
                      : 'border-gray-100 dark:border-white/10'
                  }`}
                >
                  {plan.popular ? (
                    <span className='absolute -top-2 left-4 rounded-full bg-[#937c60] text-white text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider'>
                      Popular
                    </span>
                  ) : null}

                  {hasSubscription && activePlanId === plan.id ? (
                    <span className='absolute top-3 right-3 rounded-full bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 font-bold uppercase tracking-wider'>
                      Current
                    </span>
                  ) : null}

                  <div className='mb-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.popular ? 'bg-[#937c60] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300'}`}>
                        <plan.icon size={16} />
                      </div>
                      <h3 className='text-base font-semibold text-gray-900 dark:text-white'>{plan.name}</h3>
                    </div>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {plan.price} <span className='text-xs text-gray-500 font-semibold'>AED</span>
                    </p>
                    <p className='text-xs font-semibold text-[#937c60] mt-1'>{plan.credits} credits</p>
                  </div>

                  <ul className='space-y-2 mb-5 flex-grow'>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className='flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300'>
                        <Check size={13} className='text-[#937c60] mt-0.5 shrink-0' />
                        <span>{feature}</span>
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
                      (hasAnyScheduledDowngrade && isDowngradeOption(plan.id))
                    }
                    className='w-full h-10 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold disabled:opacity-60'
                  >
                    {processingPlanId === plan.id
                      ? 'Processing...'
                      : hasSubscription && activePlanId === plan.id
                        ? 'Renew Plan'
                        : hasSubscription && hasScheduledPlanChange && subscription?.scheduledPlanId === plan.id
                          ? 'Change Scheduled'
                          : hasSubscription && hasAnyScheduledDowngrade && isDowngradeOption(plan.id)
                            ? 'Downgrade Scheduled'
                            : hasSubscription
                              ? 'Change Plan'
                              : 'Start Plan'}
                  </Button>
                </div>
              ))}
            </div>

            <div className='mt-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#111] p-5'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-3'>Credit Usage Guide</h3>
              <div className='space-y-2'>
                {CREDIT_DEFINITIONS.slice(0, 4).map((item) => (
                  <div key={item.label} className='flex items-center justify-between text-xs text-gray-600 dark:text-gray-300'>
                    <span>{item.label}</span>
                    <span className='font-semibold text-[#937c60]'>{item.credits}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className='space-y-4'>
            <div className='rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#111] p-5'>
              <h2 className='text-sm font-semibold text-gray-900 dark:text-white mb-4'>Subscription Controls</h2>
              <div className='space-y-2'>
                {hasScheduledPlanChange ? (
                  <Button
                    onClick={handleCancelScheduledChange}
                    disabled={isUpdatingSubscription}
                    className='w-full h-10 rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:opacity-60 dark:bg-transparent dark:border-white/20 dark:text-white dark:hover:bg-white/5 text-xs'
                  >
                    {subscriptionActionBusy === 'cancel_schedule' ? 'Updating...' : 'Cancel Scheduled Change'}
                  </Button>
                ) : null}

                <Button
                  onClick={isCancelScheduled ? handleResumeSubscription : handleCancelSubscription}
                  disabled={isUpdatingSubscription || !hasSubscription}
                  className='w-full h-10 rounded-xl bg-gray-900 hover:bg-black text-white disabled:opacity-60 text-xs'
                >
                  {(subscriptionActionBusy === 'cancel_period' || subscriptionActionBusy === 'resume')
                    ? 'Updating...'
                    : !hasSubscription
                      ? 'No Active Plan'
                      : isCancelScheduled
                        ? 'Resume Subscription'
                        : 'Cancel At Period End'}
                </Button>

                <Button
                  onClick={handleOpenPortal}
                  className='w-full h-10 rounded-xl bg-transparent border border-gray-300 dark:border-white/20 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-xs'
                >
                  Open Payment Portal
                </Button>
              </div>
            </div>

            <div className='rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#111] p-5'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-sm font-semibold text-gray-900 dark:text-white'>Payment Methods</h2>
                <span className='text-xs text-gray-500 dark:text-gray-400'>{cardCount} card(s)</span>
              </div>

              <div className='space-y-3'>
                {cards.length === 0 ? (
                  <p className='text-xs text-gray-500 dark:text-gray-400'>No card added yet.</p>
                ) : null}

                {cards.map((card) => {
                  const isPrimary = card.id === defaultPaymentMethodId;
                  const isBusy = busyCardId === card.id;
                  return (
                    <div key={card.id} className='rounded-xl border border-gray-200 dark:border-white/15 p-3 bg-gray-50/60 dark:bg-white/[0.02]'>
                      <div className='flex items-start justify-between gap-2 mb-2'>
                        <div>
                          <p className='text-xs font-semibold text-gray-900 dark:text-white'>
                            {formatCardBrand(card.brand)} •••• {card.last4}
                          </p>
                          <p className='text-[11px] text-gray-500 dark:text-gray-400'>Exp {card.expMonth}/{card.expYear}</p>
                        </div>
                        {isPrimary ? (
                          <span className='text-[10px] px-2 py-0.5 rounded-full bg-[#937c60]/10 text-[#937c60] font-semibold uppercase tracking-wider'>
                            Primary
                          </span>
                        ) : null}
                      </div>

                      <div className='flex items-center gap-2'>
                        {!isPrimary ? (
                          <Button
                            onClick={() => handleMakePrimary(card.id)}
                            disabled={isBusy}
                            className='h-7 px-2.5 text-[10px] bg-gray-900 text-white rounded-lg'
                          >
                            {isBusy ? 'Saving...' : 'Set Primary'}
                          </Button>
                        ) : null}
                        <Button
                          onClick={() => handleRemoveCard(card.id)}
                          disabled={isBusy || cards.length <= 1}
                          className='h-7 px-2.5 text-[10px] bg-transparent border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/15'
                        >
                          <Trash2 size={11} className='mr-1' />
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <Button
                  onClick={handleAddCard}
                  disabled={isAddingCard}
                  className='w-full h-10 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold'
                >
                  {isAddingCard ? 'Redirecting...' : 'Add Card'}
                </Button>
              </div>
            </div>

            <a
              href='mailto:billing@manaradesign.ai'
              className='inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#937c60] transition-colors'
            >
              Contact Billing
              <ChevronRight size={13} />
            </a>
          </aside>
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
