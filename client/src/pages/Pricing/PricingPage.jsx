import AvatarOnboardingPopup from '@/components/AddOns/AvatarOnboardingPopup'
import { Label, Reveal } from '@/components/Landing/primitives'
import TopBar from '@/components/Layout/Topbar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowRight, Crown, Sparkles, Star } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Star,
    tagline: 'Great for quick tests',
    price: '199',
    unit: 'AED',
    accent: '#b8a58c',
    description: 'Perfect to get started with room design.',
    credits: 20,
    features: [
      'Best for single room experiments',
      'Mix and match outputs',
      'Includes starter credit pack',
    ],
    cta: 'Unlock This Plan',
  },
  {
    id: 'home',
    name: 'Home',
    icon: Sparkles,
    tagline: 'Most popular for homeowners',
    price: '449',
    unit: 'AED',
    accent: '#c3a886',
    popular: true,
    description: 'Balanced plan for multi-room projects.',
    credits: 50,
    features: [
      'Enough for full room packages',
      'Great for multiple iterations',
      'Includes home credit pack',
    ],
    cta: 'Unlock This Plan',
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: Crown,
    tagline: 'For larger projects',
    price: '799',
    unit: 'AED',
    accent: '#8d775e',
    description: 'Best fit for large or frequent projects.',
    credits: 100,
    features: [
      'Best value per credit',
      'Ideal for teams',
      'Includes plus credit pack',
    ],
    cta: 'Unlock This Plan',
  },
]

const CREDIT_DEFINITIONS = [
  { label: '3D Render Set (1 room)', credits: 3 },
  { label: 'Extra style / variation', credits: 1 },
  { label: '2D Floor Plan / Cut', credits: 4 },
  { label: 'Shopping List + Supplier Suggestions', credits: 2 },
  { label: 'Small revision', credits: 1 },
  { label: 'Full Room Package (all of the above)', credits: 8 },
]

const Decorations = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none'>
    <div className='absolute -top-24 -left-24 w-96 h-96 bg-[#8d775e]/6 rounded-full blur-[100px]' />
    <div className='absolute top-1/2 -right-24 w-80 h-80 bg-[#b8a58c]/6 rounded-full blur-[80px]' />
    <div className='absolute -bottom-24 left-1/3 w-64 h-64 bg-[#c3a886]/8 rounded-full blur-[120px]' />
  </div>
)

const PricingCard = ({ plan, onSelect }) => {
  const isPopular = plan.popular

  return (
    <article
      className={`relative flex flex-col h-full overflow-hidden rounded-xl transition-all duration-500 ${
        isPopular
          ? 'bg-charcoal text-ivory shadow-[0_40px_80px_-30px_rgba(23,22,20,0.55)] lg:-translate-y-4'
          : 'bg-white text-charcoal border border-beige/70 shadow-[0_20px_50px_-35px_rgba(23,22,20,0.4)]'
      }`}
    >
      {isPopular && (
        <div className='absolute top-5 left-0 right-0 flex justify-center z-20'>
          <span className='bg-manara text-white text-[9px] font-semibold uppercase tracking-[0.3em] px-5 py-1.5 rounded-full'>
            Most Popular
          </span>
        </div>
      )}

      <div
        className='flex flex-col h-full p-8 md:p-10'
        style={isPopular ? { paddingTop: '5.5rem' } : undefined}
      >
        <div className='mb-9'>
          <p
            className={`label-meta ${isPopular ? 'text-ivory/50' : 'text-stone'}`}
          >
            {plan.tagline}
          </p>
          <h3
            className={`mt-3 font-serif text-4xl leading-none tracking-[-0.01em] ${
              isPopular ? 'text-ivory' : 'text-charcoal'
            }`}
          >
            {plan.name}
          </h3>
        </div>

        <div className='pt-6 border-t' style={{ borderColor: isPopular ? 'rgba(245,242,236,0.14)' : '#ded6ca' }}>
          <div className='flex items-baseline gap-2'>
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${
                isPopular ? 'text-[#c3a886]' : 'text-manara'
              }`}
            >
              {plan.unit}
            </span>
            <span
              className={`font-serif text-6xl md:text-7xl leading-none tracking-[-0.02em] ${
                isPopular ? 'text-ivory' : 'text-charcoal'
              }`}
            >
              {plan.price}
            </span>
          </div>
          <div className='mt-4 flex items-center gap-2'>
            <span
              className={`inline-flex items-center rounded-full px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                isPopular
                  ? 'bg-ivory/10 text-[#c3a886]'
                  : 'bg-[#f5f2ec] text-manara'
              }`}
            >
              {plan.credits} Credits
            </span>
          </div>
        </div>

        <p
          className={`mt-6 text-sm leading-[1.85] ${
            isPopular ? 'text-ivory/70' : 'text-stone'
          }`}
        >
          {plan.description}
        </p>

        <div className='flex-grow space-y-3.5 mt-8 mb-12'>
          {plan.features.map((feature, idx) => (
            <div key={idx} className='flex items-center gap-3'>
              <span
                className={`mt-0.5 shrink-0 h-1 w-1 rounded-full ${
                  isPopular ? 'bg-[#c3a886]' : 'bg-manara'
                }`}
              />
              <span
                className={`text-sm leading-snug ${
                  isPopular ? 'text-ivory/80' : 'text-charcoal/70'
                }`}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className='mt-auto'>
          <Button
            onClick={onSelect}
            className={`w-full h-[54px] rounded-xl text-[13px] font-semibold tracking-wide transition-all duration-300 border ${
              isPopular
                ? 'bg-manara border-manara text-white hover:bg-[#a08163] hover:border-[#a08163]'
                : 'bg-transparent border-charcoal/25 text-charcoal hover:bg-charcoal hover:text-ivory hover:border-charcoal'
            }`}
          >
            {plan.cta}
            <ArrowRight size={15} className='ml-1.5' />
          </Button>
        </div>
      </div>
    </article>
  )
}

const PricingPage = () => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [selectedPlanName, setSelectedPlanName] = useState('this')
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  const handleSelectPlan = (plan) => {
    if (currentUser) {
      navigate('/subscription', {
        state: {
          fromPricing: true,
          selectedPlanId: plan.id,
        },
      })
      return
    }

    setSelectedPlanName(plan.name)
    setShowAuthPrompt(true)
  }

  return (
    <div className='min-h-screen bg-ivory text-charcoal font-sans transition-colors duration-500'>
      <TopBar />

      <main className='relative pt-[9.5rem] pb-28 px-4 sm:px-6 overflow-hidden'>
        <Decorations />

        <div className='max-w-[1200px] mx-auto relative z-10'>
          <div className='max-w-4xl mx-auto text-center mb-24 md:mb-32'>
            <Reveal>
              <Label>SUBSCRIPTION PLANS</Label>
            </Reveal>

            <Reveal delay={0.1} y={40}>
              <h1 className='mt-8 font-serif font-normal text-charcoal text-5xl sm:text-6xl md:text-7xl lg:text-[84px] leading-[1.02] tracking-[-0.015em]'>
                Light it up,
                <br />
                <span className='italic text-manara'>plan by plan.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.18}>
              <p className='mt-8 mx-auto max-w-xl text-base md:text-[17px] leading-[1.85] text-stone'>
                Pick the plan that fits your design flow. Ready when you are,
                and upgradeable anytime.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className='mt-9 flex flex-wrap items-center justify-center gap-3 text-[9px] font-semibold uppercase tracking-[0.3em]'>
                <span className='inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-white/60 px-5 py-2.5 text-manara'>
                  <Crown size={12} />
                  Marketing Preview
                </span>
                {currentUser ? (
                  <span className='inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-white/60 px-5 py-2.5 text-manara'>
                    Signed In — Continue to Billing
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-white/60 px-5 py-2.5 text-stone'>
                    Sign in to activate a plan
                  </span>
                )}
              </div>
            </Reveal>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-24'>
            {CREDIT_PACKAGES.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.08} y={36}>
                <PricingCard
                  plan={plan}
                  onSelect={() => handleSelectPlan(plan)}
                />
              </Reveal>
            ))}
          </div>

          <div className='max-w-4xl mx-auto mb-28'>
            <Reveal>
              <div className='border border-beige bg-white/70 backdrop-blur-sm rounded-2xl px-7 py-9 md:px-12 md:py-12'>
                <div className='flex items-center gap-4 mb-9'>
                  <div className='h-px w-10 bg-beige' />
                  <Label>Plan Inclusions</Label>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3'>
                  {CREDIT_DEFINITIONS.map((item) => (
                    <div
                      key={item.label}
                      className='flex items-center justify-between border-b border-beige py-3.5 text-sm'
                    >
                      <span className='font-medium text-charcoal/75'>
                        {item.label}
                      </span>
                      <span className='font-serif italic text-manara'>
                        {item.credits} credits
                      </span>
                    </div>
                  ))}
                </div>
                <p className='mt-8 text-[11px] uppercase tracking-[0.25em] text-stone font-medium'>
                  Tap any plan to continue setup in your subscription page.
                </p>
              </div>
            </Reveal>
          </div>

          <div className='flex flex-wrap justify-center items-center gap-12 md:gap-20 mb-2'>
            {['Clear Credit Costs', 'Track Generations', 'Credits Never Expire'].map(
              (item) => (
                <Reveal key={item}>
                  <span className='label-meta text-stone'>{item}</span>
                </Reveal>
              )
            )}
          </div>

          <div className='mt-24 md:mt-32'>
            <Reveal>
              <section className='bg-charcoal text-ivory rounded-2xl px-8 py-14 md:px-20 md:py-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-[0_40px_90px_-40px_rgba(23,22,20,0.7)]'>
                <div className='absolute -top-24 -right-24 w-96 h-96 bg-manara/25 rounded-full blur-[120px] pointer-events-none' />

                <div className='relative z-10 max-w-2xl text-center lg:text-left'>
                  <p className='label-arch-light'>THE MANĀRA DESK</p>
                  <h2 className='mt-5 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-[-0.01em]'>
                    Still not sure about
                    <br className='hidden md:block' />
                    the <span className='italic text-[#c3a886]'>perfect fit?</span>
                  </h2>
                  <p className='mt-6 text-[15px] md:text-base text-ivory/60 leading-[1.85]'>
                    Not sure how many credits you need? We can help estimate
                    your project.
                  </p>
                </div>

                <div className='relative z-10 shrink-0 w-full lg:w-auto'>
                  <Button
                    onClick={() => setIsAvatarOpen(true)}
                    className='group w-full lg:w-auto bg-manara hover:bg-[#a76663] text-white text-[13px] font-semibold tracking-wide px-10 py-5 rounded-xl transition-all'
                  >
                    Book Free Consultation
                    <ArrowRight
                      size={15}
                      className='ml-1 transition-transform group-hover:translate-x-1'
                    />
                  </Button>
                </div>
              </section>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <p className='mt-14 text-center label-meta text-stone/70'>
              MANĀRA — AI-POWERED INTERIOR DESIGN · DUBAI · UAE
            </p>
          </Reveal>
        </div>
      </main>

      <AvatarOnboardingPopup
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        onSubmit={(data) => {
          console.log('Avatar data:', data)
        }}
      />

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className='max-w-md rounded-2xl border border-beige bg-ivory p-0 text-charcoal'>
          <div className='relative overflow-hidden p-8 md:p-10'>
            <div className='pointer-events-none absolute top-0 right-0 w-64 h-64 bg-[#c3a886]/10 rounded-full blur-[80px]' />
            <div className='relative'>
              <DialogHeader>
                <Label>Almost there</Label>
                <DialogTitle className='mt-5 font-serif text-3xl md:text-4xl font-normal tracking-[-0.01em] text-charcoal leading-none'>
                  Create your account to continue
                </DialogTitle>
                <DialogDescription className='pt-4 text-[15px] leading-[1.8] text-stone'>
                  You selected the {selectedPlanName} plan. Create your account
                  now, then subscribe from your billing page.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className='mt-8 flex-col sm:flex-row gap-3'>
                <Button
                  onClick={() => {
                    setShowAuthPrompt(false)
                    navigate('/auth?type=signup')
                  }}
                  className='group h-[50px] flex-1 rounded-xl bg-manara text-white hover:bg-manara'
                >
                  Create Account
                  <ArrowRight
                    size={14}
                    className='ml-2 transition-transform group-hover:translate-x-0.5'
                  />
                </Button>
                <Button
                  onClick={() => {
                    setShowAuthPrompt(false)
                    navigate('/auth?type=login')
                  }}
                  className='h-[50px] flex-1 rounded-xl border border-charcoal/25 bg-transparent text-charcoal hover:bg-white'
                >
                  I Already Have an Account
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PricingPage