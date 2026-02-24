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
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [busyCardId, setBusyCardId] = useState(null);
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
          .then(() => refreshBillingStatus())
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
    setIsAddingCard(true);
    try {
      const response = await stripeService.createSetupSession();
      if (response?.url) {
        window.location.href = response.url;
        return;
      }
      throw new Error('Missing setup session URL');
    } catch (error) {
      console.error('Setup session error:', error);
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
      toast.error('Please add at least one card before purchasing a plan.');
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

    const confirmed = window.confirm(
      'Cancel at period end? The user keeps access until the next billing date.'
    );
    if (!confirmed) return;

    setIsUpdatingSubscription(true);
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
      setIsUpdatingSubscription(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!hasSubscription) {
      toast.error('No active subscription found.');
      return;
    }

    setIsUpdatingSubscription(true);
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
      setIsUpdatingSubscription(false);
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
                        if (hasSubscription && activePlanId !== plan.id) {
                          handleOpenPortal();
                          return;
                        }
                        handlePlanOperation(plan);
                      }}
                      disabled={Boolean(processingPlanId) || isLoading || (hasSubscription && activePlanId === plan.id)}
                      className='w-full py-6 rounded-2xl font-bold text-sm transition-all bg-gray-900 hover:bg-black text-white disabled:opacity-60'
                    >
                      {processingPlanId === plan.id
                        ? 'Processing...'
                        : hasSubscription && activePlanId === plan.id
                          ? 'Current Plan'
                          : hasSubscription
                            ? 'Change in Payment Portal'
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
            <div className='bg-white dark:bg-[#111] rounded-[40px] p-8 border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
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
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>{formatDate(subscription?.nextBillingDate)}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Renewal</p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>
                    {!hasSubscription ? 'No active renewal' : isCancelScheduled ? 'Will cancel at period end' : 'Auto-renew enabled'}
                  </p>
                </div>

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
                  <Button
                    onClick={isCancelScheduled ? handleResumeSubscription : handleCancelSubscription}
                    disabled={isUpdatingSubscription || !hasSubscription}
                    className='w-full h-9 px-3 text-[11px] rounded-xl bg-gray-900 text-white disabled:opacity-60'
                  >
                    {isUpdatingSubscription
                      ? 'Updating...'
                      : isCancelScheduled
                        ? 'Resume Subscription'
                        : 'Cancel At Period End'}
                  </Button>
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-[#111] rounded-[40px] p-8 border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
              <h4 className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-50'>Payment Method</h4>

              <div className='space-y-4'>
                {cards.length === 0 && !isLoading && (
                  <div className='text-xs text-gray-500'>No card added yet.</div>
                )}

                {cards.map((card) => {
                  const isPrimary = card.id === defaultPaymentMethodId;
                  const isBusy = busyCardId === card.id;
                  return (
                    <div key={card.id} className='rounded-2xl border border-gray-100 dark:border-white/10 p-4 space-y-3'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p className='text-sm font-bold text-gray-900 dark:text-white'>
                            {formatCardBrand(card.brand)} •••• {card.last4}
                          </p>
                          <p className='text-xs text-gray-400'>Exp {card.expMonth}/{card.expYear}</p>
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
                            className='h-8 px-3 text-[11px] bg-gray-900 text-white rounded-xl'
                          >
                            {isBusy ? 'Saving...' : 'Make Primary'}
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRemoveCard(card.id)}
                          disabled={isBusy || cards.length <= 1}
                          className='h-8 px-3 text-[11px] bg-transparent border border-red-200 text-red-600 rounded-xl hover:bg-red-50'
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
                  className='w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-xs'
                >
                  {isAddingCard ? 'Opening Stripe...' : 'Add Card'}
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
                  OpenMy payment portal
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
    </div>
  );
};

export default SubscriptionPage;
