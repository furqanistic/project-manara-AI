import { useOnboarding } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  UserCheck,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const USER_TYPES = [
  {
    id: "homeowner",
    label: "Homeowner",
    description: "Design and renovate your own home",
    icon: Home,
  },
  {
    id: "interior_designer",
    label: "Interior Designer",
    description: "Run client design projects faster",
    icon: Briefcase,
  },
  {
    id: "business_developer",
    label: "Business / Developer",
    description: "Manage portfolios and development workflows",
    icon: Building2,
  },
];

const QUESTION_BANK = {
  homeowner: [
    {
      id: "owner_status",
      prompt: "Are you the property owner?",
      options: ["Yes", "No"],
    },
    {
      id: "volume",
      prompt: "How many rooms are you planning?",
      options: ["1 room", "2-3 rooms", "4-6 rooms", "7+ rooms"],
    },
    {
      id: "duration",
      prompt: "How long do you plan to use Manara?",
      options: ["Less than 1 month", "1-3 months", "3-12 months", "12+ months"],
    },
  ],
  interior_designer: [
    {
      id: "owner_status",
      prompt: "Will you use Manara for client-owned properties?",
      options: ["Yes", "No"],
    },
    {
      id: "volume",
      prompt: "How many projects are you planning soon?",
      options: ["1 project", "2-5 projects", "6-15 projects", "16+ projects"],
    },
    {
      id: "duration",
      prompt: "How long do you plan to use Manara?",
      options: ["Less than 1 month", "1-3 months", "3-12 months", "12+ months"],
    },
  ],
  business_developer: [
    {
      id: "owner_status",
      prompt: "Are these properties owned or managed by your business?",
      options: ["Yes", "No"],
    },
    {
      id: "volume",
      prompt: "How many projects/properties are you planning?",
      options: ["1-2", "3-10", "11-30", "31+"],
    },
    {
      id: "duration",
      prompt: "How long do you plan to use Manara?",
      options: ["Less than 1 month", "1-3 months", "3-12 months", "12+ months"],
    },
  ],
};

const BILLING_REGIONS = [
  "Middle East",
  "North America",
  "Europe",
  "Asia Pacific",
  "Africa",
  "Latin America",
];

const REQUIRED_MARK = <span className="ml-1 text-red-500">*</span>;

const OnboardingModal = () => {
  const MotionDiv = motion.div;
  const onboardingMutation = useOnboarding();

  const [step, setStep] = useState(1);
  const [startedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    userType: "",
    qualificationAnswers: {
      owner_status: "",
      volume: "",
      duration: "",
    },
    country: "",
    city: "",
    billingRegion: "",
    emailConfirmed: false,
  });

  const totalSteps = 3;

  const activeQuestions = useMemo(() => {
    if (!formData.userType) return [];
    return QUESTION_BANK[formData.userType] || [];
  }, [formData.userType]);

  useEffect(() => {
    if (!formData.userType) return;
    setFormData((prev) => ({
      ...prev,
      qualificationAnswers: {
        owner_status: "",
        volume: "",
        duration: "",
      },
    }));
  }, [formData.userType]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updateQuestion = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      qualificationAnswers: {
        ...prev.qualificationAnswers,
        [questionId]: value,
      },
    }));
    if (errors.qualificationAnswers) {
      setErrors((prev) => ({ ...prev, qualificationAnswers: "" }));
    }
  };

  const validateStep = (currentStep) => {
    const nextErrors = {};

    if (currentStep === 1 && !formData.userType) {
      nextErrors.userType = "Select one user type to continue.";
    }

    if (currentStep === 2) {
      const unanswered = activeQuestions.filter(
        (question) => !formData.qualificationAnswers[question.id]
      );
      if (unanswered.length > 0) {
        nextErrors.qualificationAnswers = "Answer all 3 qualification questions.";
      }
    }

    if (currentStep === 3) {
      if (!formData.country.trim()) nextErrors.country = "Country is required.";
      if (!formData.city.trim()) nextErrors.city = "City is required.";
      if (!formData.billingRegion.trim()) {
        nextErrors.billingRegion = "Billing region is required.";
      }
      if (!formData.emailConfirmed) {
        nextErrors.emailConfirmed = "Confirm your billing email to continue.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const completionSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAt) / 1000)
      );
      const qualificationQuestions = activeQuestions.slice(0, 3).map((question) => ({
        id: question.id,
        prompt: question.prompt,
        answer: formData.qualificationAnswers[question.id],
      }));

      await onboardingMutation.mutateAsync({
        userType: formData.userType,
        qualification: {
          questions: qualificationQuestions,
          completionSeconds,
        },
        requiredProfile: {
          country: formData.country.trim(),
          city: formData.city.trim(),
          billingRegion: formData.billingRegion,
          emailConfirmed: formData.emailConfirmed,
        },
        stripeMetadata: {
          userType: formData.userType,
          country: formData.country.trim(),
          city: formData.city.trim(),
          billingRegion: formData.billingRegion,
        },
        flow: {
          version: "onboarding-v2",
          basicComplete: true,
          qualificationComplete: true,
          billingComplete: true,
        },
      });

      toast.success("Great start. Let’s set up your avatar next.");
    } catch {
      toast.error("Failed to save onboarding. Please try again.");
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Choose your user type</h2>
            <p className="text-xs text-readable-secondary mt-1.5">
              This choice personalizes the next questions in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {USER_TYPES.map((option) => {
              const Icon = option.icon;
              const selected = formData.userType === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateField("userType", option.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? "bg-[#8d775e]/10 border-[#8d775e] shadow-xl shadow-[#8d775e]/10"
                      : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 rounded-2xl p-2.5 ${
                        selected
                          ? "bg-[#8d775e] text-white"
                          : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${selected ? "text-[#8d775e]" : "text-readable-primary"}`}>
                        {option.label}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-readable-muted mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.userType && (
            <p className="text-red-500 text-xs font-semibold uppercase">{errors.userType}</p>
          )}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Qualification questions</h2>
            <p className="text-xs text-readable-secondary mt-1.5">
              3 quick questions tailored to your role.
            </p>
          </div>

          <div className="space-y-3">
            {activeQuestions.slice(0, 3).map((question, index) => (
              <div key={question.id} className="rounded-2xl border border-gray-100 dark:border-white/10 p-4 bg-white dark:bg-white/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d775e] mb-2">
                  Question {index + 1}
                </p>
                <p className="text-xs font-semibold text-readable-primary mb-2.5">{question.prompt}</p>
                <div className="flex flex-wrap gap-1.5">
                  {question.options.map((option) => {
                    const selected = formData.qualificationAnswers[question.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateQuestion(question.id, option)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                          selected
                            ? "bg-[#8d775e] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {errors.qualificationAnswers && (
            <p className="text-red-500 text-xs font-semibold uppercase">{errors.qualificationAnswers}</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Required billing details</h2>
          <p className="text-xs text-readable-secondary mt-1.5">
            Required for invoicing and checkout setup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-readable-muted">
              Country{REQUIRED_MARK}
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => updateField("country", e.target.value)}
              placeholder="Enter country"
              className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
            />
            {errors.country && <p className="mt-2 text-red-500 text-xs font-semibold uppercase">{errors.country}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-readable-muted">
              City{REQUIRED_MARK}
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Enter city"
              className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
            />
            {errors.city && <p className="mt-2 text-red-500 text-xs font-semibold uppercase">{errors.city}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-readable-muted">
            Intended Billing Region{REQUIRED_MARK}
          </label>
          <select
            value={formData.billingRegion}
            onChange={(e) => updateField("billingRegion", e.target.value)}
            className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
          >
            <option value="">Select billing region</option>
            {BILLING_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors.billingRegion && (
            <p className="mt-2 text-red-500 text-xs font-semibold uppercase">{errors.billingRegion}</p>
          )}
        </div>

        <div className="rounded-xl border border-[#8d775e]/20 bg-[#8d775e]/5 p-3.5">
          <label className="inline-flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.emailConfirmed}
              onChange={(e) => updateField("emailConfirmed", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#8d775e]"
            />
            <span className="text-xs text-readable-primary">
              Confirm this account email will be used for invoices and billing communication{REQUIRED_MARK}
            </span>
          </label>
          {errors.emailConfirmed && (
            <p className="mt-2 text-red-500 text-xs font-semibold uppercase">{errors.emailConfirmed}</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] p-3 flex items-center gap-2.5">
          <Clock3 size={16} className="text-[#8d775e]" />
          <p className="text-xs text-readable-secondary">Fast flow target: under 60 seconds for qualification.</p>
        </div>
      </div>
    );
  };

  const getStepIcon = (stepNumber) => {
    if (stepNumber === 1) return UserCheck;
    if (stepNumber === 2) return Check;
    return MapPin;
  };

  const StepIcon = getStepIcon(step);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onWheel={(event) => event.preventDefault()}
        onTouchMove={(event) => event.preventDefault()}
      />

      <MotionDiv
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0a0a0a] rounded-[40px] shadow-2xl shadow-black/50 overflow-hidden border border-gray-100 dark:border-white/5"
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-white/5">
          <MotionDiv
            className="h-full bg-[#8d775e]"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] h-[82vh] md:h-[600px] max-h-[90vh]">
          <div className="hidden md:flex flex-col p-6 border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#8d775e] flex items-center justify-center text-white mb-3 shadow-lg shadow-[#8d775e]/20">
                <StepIcon size={18} />
              </div>
              <h3 className="text-lg font-bold dark:text-white">Onboarding</h3>
              <p className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.2em] mt-1">
                Step {step} of {totalSteps}
              </p>
            </div>

            <div className="mt-auto space-y-2 text-[11px] text-readable-secondary">
              <p className="font-semibold">Professional setup includes:</p>
              <p>1. User type split</p>
              <p>2. 3 qualification questions</p>
              <p>3. Billing-ready profile data</p>
            </div>
          </div>

          <div className="flex flex-col min-h-0 p-5 md:p-7 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
              <AnimatePresence mode="wait">
                <MotionDiv
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderStep()}
                </MotionDiv>
              </AnimatePresence>
            </div>

            <div className="pt-5 mt-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  step === 1
                    ? "opacity-0 pointer-events-none"
                    : "hover:bg-gray-100 dark:hover:bg-white/5 text-readable-secondary"
                }`}
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={onboardingMutation.isPending}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold shadow-xl hover:bg-black dark:hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {onboardingMutation.isPending
                  ? "Saving..."
                  : step === totalSteps
                  ? "Continue to Avatar"
                  : "Continue"}
                {!onboardingMutation.isPending &&
                  (step === totalSteps ? <Check size={18} /> : <ChevronRight size={18} />)}
              </button>
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default OnboardingModal;
