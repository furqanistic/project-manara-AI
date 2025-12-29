import { motion } from 'framer-motion';
import {
    Check,
    ChevronRight,
    CreditCard,
    Crown,
    ExternalLink,
    Sparkles,
    Star,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import TopBar from '../../components/Layout/Topbar';
import { Button } from '../../components/ui/button';
import { stripeService } from '../../services/stripeService';

const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    icon: Star,
    price: '8,999',
    priceId: 'price_1Qpsm7F9uY9uY9uY9uY9uY9u', // Replace with real ID
    features: ['1 Room Design', 'AI Mood Boards', 'Standard Support'],
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Sparkles,
    price: '15,999',
    priceId: 'price_1Qpsm7F9uY9uY9uY9uY9uY9v', // Replace with real ID
    popular: true,
    features: ['2-3 Rooms Design', 'HD 3D Renders', 'Priority Support'],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    icon: Crown,
    price: '24,999',
    priceId: 'price_1Qpsm7F9uY9uY9uY9uY9uY9w', // Replace with real ID
    features: ['Whole Home Design', 'Dedicated Manager', '24/7 VIP Support'],
  },
];

const SubscriptionPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derive current status
  const currentPriceId = currentUser?.stripePriceId;
  const isActive = currentUser?.subscriptionStatus === 'active' || currentUser?.subscriptionStatus === 'trialing';

  const handlePlanOperation = async (plan) => {
    if (plan.priceId === currentPriceId && isActive) return;
    
    setIsProcessing(true);
    const loadingToast = toast.loading(isActive ? 'Preperating plan switch...' : 'Initiating checkout...');
    
    try {
      const response = await stripeService.createCheckoutSession(plan.priceId);
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Stripe error:', error);
      toast.error('Operation failed. Please try again.');
    } finally {
      setIsProcessing(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleManageBilling = async () => {
    setIsProcessing(true);
    try {
      const response = await stripeService.createPortalSession();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Could not load billing portal');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='min-h-screen bg-[#faf8f6] font-["Poppins"] selection:bg-[#937c60]/10'>
      <TopBar />
      
      <main className='max-w-[1400px] mx-auto pt-40 pb-24 px-8 md:px-16 relative z-10'>
        {/* Simplified Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-20'
        >
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-[1px] bg-[#937c60] opacity-40'></div>
            <span className='text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase'>Account Management</span>
          </div>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 tracking-tight'>
            Select your <span className='text-[#937c60]'>plan</span>
          </h1>
        </motion.div>

        <div className='grid grid-cols-1 xl:grid-cols-12 gap-12'>
          {/* Plan Selection Grid */}
          <div className='xl:col-span-9'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {PLANS.map((plan) => {
                const isCurrent = plan.priceId === currentPriceId && isActive;
                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -5 }}
                    className={`relative p-8 rounded-[40px] bg-white border transition-all duration-300 flex flex-col ${
                      isCurrent 
                        ? 'border-[#937c60] shadow-[0_20px_50px_rgba(147,124,96,0.1)]' 
                        : 'border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:border-gray-200'
                    }`}
                  >
                    {isCurrent && (
                      <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-[#937c60] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest'>
                        Current Plan
                      </div>
                    )}
                    
                    <div className='mb-8'>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isCurrent ? 'bg-[#937c60] text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <plan.icon size={24} />
                      </div>
                      <h3 className='text-xl font-bold text-gray-900 mb-1'>{plan.name}</h3>
                      <div className='flex items-baseline gap-1'>
                        <span className='text-3xl font-bold text-gray-900'>{plan.price}</span>
                        <span className='text-xs font-bold text-gray-400 uppercase'>AED</span>
                      </div>
                    </div>

                    <ul className='space-y-4 mb-10 flex-grow'>
                      {plan.features.map((f, i) => (
                        <li key={i} className='flex items-center gap-3 text-sm text-gray-500 font-medium'>
                          <Check size={14} className={isCurrent ? 'text-[#937c60]' : 'text-gray-300'} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handlePlanOperation(plan)}
                      disabled={isCurrent || isProcessing}
                      className={`w-full py-6 rounded-2xl font-bold text-sm transition-all ${
                        isCurrent 
                          ? 'bg-gray-50 text-gray-400 border-none cursor-default' 
                          : 'bg-gray-900 hover:bg-black text-white'
                      }`}
                    >
                      {isCurrent ? 'Active Now' : 'Select Plan'}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Billing Sidebar */}
          <div className='xl:col-span-3 space-y-6'>
            <div className='bg-white rounded-[40px] p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]'>
              <h4 className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-50'>Billing Overview</h4>
              
              <div className='space-y-6'>
                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Next Payment</p>
                  <p className='text-sm font-bold text-gray-900'>{isActive ? formatDate(currentUser.subscriptionCurrentPeriodEnd) : 'No pending'}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Saved Method</p>
                  <div className='flex items-center gap-2'>
                    <CreditCard size={14} className='text-gray-400' />
                    <p className='text-sm font-bold text-gray-900'>Stored Securely</p>
                  </div>
                </div>

                <Button
                  onClick={handleManageBilling}
                  disabled={isProcessing}
                  className='w-full bg-white border border-gray-100 hover:bg-gray-50 text-gray-900 py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm'
                >
                  Billing Portal
                  <ExternalLink size={14} className='opacity-30' />
                </Button>
              </div>
            </div>

            <div className='bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden'>
              <div className='relative z-10'>
                <h4 className='text-xs font-bold text-[#937c60] uppercase tracking-widest mb-4'>Expert Support</h4>
                <p className='text-sm text-gray-400 leading-relaxed mb-6'>Need help with your enterprise setup or bulk licenses?</p>
                <a 
                  href="mailto:billing@manaradesign.ai"
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
