import { motion } from 'framer-motion';
import { Check, ChevronRight, CreditCard, Crown, Sparkles, Star } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import TopBar from '../../components/Layout/Topbar';
import { Button } from '../../components/ui/button';
import { addCredits, getCreditLedger, getCreditsBalance } from '../../lib/credits';

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
    features: ['Best for testing', 'Mix and match outputs', 'Credits do not expire'],
  },
  {
    id: 'home',
    name: 'Home',
    icon: Sparkles,
    price: '449',
    credits: 50,
    popular: true,
    features: ['Great for multi-room projects', 'Enough for full packages', 'Credits do not expire'],
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: Crown,
    price: '799',
    credits: 100,
    features: ['Best value', 'Ideal for teams', 'Credits do not expire'],
  },
];

const SubscriptionPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditBalance, setCreditBalance] = useState(() => getCreditsBalance());
  const [creditLedger, setCreditLedger] = useState(() => getCreditLedger());

  const handlePlanOperation = async (plan) => {
    setIsProcessing(true);
    try {
      const result = addCredits(plan.credits, {
        action: 'credit-package',
        packageId: plan.id,
        label: plan.name,
      });
      setCreditBalance(result.balance);
      setCreditLedger(result.ledger);
      toast.success(`${plan.credits} credits added to your balance.`);
    } catch (error) {
      console.error('Credit add error:', error);
      toast.error('Operation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const recentEntries = creditLedger.slice(0, 5);

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#937c60]/10'>
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
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight'>
            Manage <span className='text-[#937c60]'>credits</span>
          </h1>
        </motion.div>

        <div className='grid grid-cols-1 xl:grid-cols-12 gap-12'>
          {/* Plan Selection Grid */}
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
                      onClick={() => handlePlanOperation(plan)}
                      disabled={isProcessing}
                      className={`w-full py-6 rounded-2xl font-bold text-sm transition-all ${
                        plan.popular
                          ? 'bg-gray-900 hover:bg-black text-white' 
                          : 'bg-gray-900 hover:bg-black text-white'
                      }`}
                    >
                      Add Credits
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

          {/* Billing Sidebar */}
          <div className='xl:col-span-3 space-y-6'>
            <div className='bg-white dark:bg-[#111] rounded-[40px] p-8 border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
              <h4 className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-50'>Credits Overview</h4>
              
              <div className='space-y-6'>
                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Current Balance</p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>{creditBalance} credits</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-gray-400 uppercase'>Credits Expiration</p>
                  <div className='flex items-center gap-2'>
                    <CreditCard size={14} className='text-gray-400' />
                    <p className='text-sm font-bold text-gray-900 dark:text-white'>No expiration (for now)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-[#111] rounded-[40px] p-8 border border-gray-100 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
              <h4 className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-50'>Payment Method</h4>

              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-300'>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className='text-sm font-bold text-gray-900 dark:text-white'>Card on file</p>
                    <p className='text-xs text-gray-400'>No card added yet</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='col-span-2'>
                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Card Number</label>
                    <input
                      type='text'
                      placeholder='1234 5678 9012 3456'
                      className='mt-2 w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#937c60]/30'
                      disabled
                    />
                  </div>
                  <div>
                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Expiry</label>
                    <input
                      type='text'
                      placeholder='MM/YY'
                      className='mt-2 w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#937c60]/30'
                      disabled
                    />
                  </div>
                  <div>
                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>CVC</label>
                    <input
                      type='text'
                      placeholder='CVC'
                      className='mt-2 w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#937c60]/30'
                      disabled
                    />
                  </div>
                </div>

                <Button
                  disabled
                  className='w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-xs opacity-60 cursor-not-allowed'
                >
                  Add Card (Coming Soon)
                </Button>
              </div>
            </div>

            <div className='bg-gray-900 dark:bg-black rounded-[40px] p-8 text-white relative overflow-hidden'>
              <div className='relative z-10'>
                <h4 className='text-xs font-bold text-[#937c60] uppercase tracking-widest mb-4'>Recent Activity</h4>
                <div className='space-y-3 text-[11px] text-gray-300'>
                  {recentEntries.length === 0 ? (
                    <p>No credit activity yet.</p>
                  ) : (
                    recentEntries.map((entry) => (
                      <div key={entry.id} className='flex items-center justify-between'>
                        <span className='truncate'>{entry.action || entry.label || entry.type}</span>
                        <span className={entry.type === 'credit' ? 'text-emerald-300' : 'text-amber-300'}>
                          {entry.type === 'credit' ? '+' : '-'}{entry.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
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
