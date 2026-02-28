import { useOnboarding } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, Home, Sparkles, Users } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const OnboardingModal = () => {
  const [step, setStep] = useState(1);
  const onboardingMutation = useOnboarding();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    householdSize: "",
    homeType: "",
    preferences: [],
    flow: {
      version: "simplified-v1",
      basicComplete: false,
    },
  });

  const totalSteps = 3;

  const householdOptions = useMemo(
    () => [
      { id: "1", label: "Just me", desc: "Living solo" },
      { id: "2", label: "Two people", desc: "Partner or roommate" },
      { id: "3-4", label: "3-4 people", desc: "Small family" },
      { id: "5+", label: "5+ people", desc: "Big household" },
    ],
    []
  );

  const homeTypeOptions = useMemo(
    () => [
      { id: "apartment", label: "Apartment", desc: "City living" },
      { id: "villa", label: "Villa", desc: "Spacious standalone" },
      { id: "townhouse", label: "Townhouse", desc: "Multi-level home" },
      { id: "studio", label: "Studio", desc: "Compact & efficient" },
      { id: "penthouse", label: "Penthouse", desc: "Premium views" },
    ],
    []
  );

  const preferenceOptions = useMemo(
    () => [
      { id: "minimal", label: "Minimal", desc: "Clean lines" },
      { id: "cozy", label: "Cozy", desc: "Warm textures" },
      { id: "luxury", label: "Luxury", desc: "Premium finishes" },
      { id: "family", label: "Family-friendly", desc: "Durable & safe" },
      { id: "nature", label: "Nature-forward", desc: "Organic materials" },
      { id: "bold", label: "Bold", desc: "Statement pieces" },
      { id: "tech", label: "Tech-forward", desc: "Smart home" },
    ],
    []
  );

  const validateStep = (currentStep) => {
    const nextErrors = {};
    if (currentStep === 1 && !formData.householdSize) {
      nextErrors.householdSize = "Select a household size.";
    }
    if (currentStep === 2 && !formData.homeType) {
      nextErrors.homeType = "Select a home type.";
    }
    if (currentStep === 3 && formData.preferences.length === 0) {
      nextErrors.preferences = "Pick at least one preference.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    try {
      await onboardingMutation.mutateAsync({
        ...formData,
        flow: {
          ...formData.flow,
          basicComplete: true,
        },
      });
      toast.success("Welcome to Manara! Your profile is ready.");
    } catch (error) {
      toast.error("Failed to save your profile. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Household Size</h2>
            <p className="text-sm text-readable-secondary">Pick the option that fits your home best.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {householdOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateFormData("householdSize", opt.id)}
                  className={`p-4 rounded-3xl border text-left transition-all ${
                    formData.householdSize === opt.id
                      ? "bg-[#8d775e]/10 border-[#8d775e] shadow-xl shadow-[#8d775e]/5"
                      : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                  }`}
                >
                  <p className={`font-bold mb-1 ${formData.householdSize === opt.id ? "text-[#8d775e]" : "text-gray-900 dark:text-white"}`}>{opt.label}</p>
                  <p className="text-[10px] text-readable-muted uppercase tracking-widest">{opt.desc}</p>
                </button>
              ))}
            </div>
            {errors.householdSize && (
              <p className="text-red-500 text-xs font-semibold uppercase">{errors.householdSize}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Type of Home</h2>
            <p className="text-sm text-readable-secondary">Choose your primary home type.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {homeTypeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateFormData("homeType", opt.id)}
                  className={`p-4 rounded-3xl border text-left transition-all ${
                    formData.homeType === opt.id
                      ? "bg-[#8d775e]/10 border-[#8d775e] shadow-xl shadow-[#8d775e]/5"
                      : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                  }`}
                >
                  <p className={`font-bold mb-1 ${formData.homeType === opt.id ? "text-[#8d775e]" : "text-gray-900 dark:text-white"}`}>{opt.label}</p>
                  <p className="text-[10px] text-readable-muted uppercase tracking-widest">{opt.desc}</p>
                </button>
              ))}
            </div>
            {errors.homeType && (
              <p className="text-red-500 text-xs font-semibold uppercase">{errors.homeType}</p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">General Preferences</h2>
            <p className="text-sm text-readable-secondary">Pick a few vibes that represent your style.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {preferenceOptions.map((opt) => {
                const isSelected = formData.preferences.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (isSelected) {
                        updateFormData(
                          "preferences",
                          formData.preferences.filter((item) => item !== opt.id)
                        );
                      } else {
                        updateFormData("preferences", [...formData.preferences, opt.id]);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-[#8d775e] text-white border-[#8d775e]"
                        : "bg-white dark:bg-white/5 text-readable-secondary border-gray-100 dark:border-white/10"
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-70">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
            {errors.preferences && (
              <p className="text-red-500 text-xs font-semibold uppercase">{errors.preferences}</p>
            )}
            <div className="p-5 rounded-[28px] bg-[#8d775e]/5 border border-[#8d775e]/10 text-center">
              <Sparkles className="w-8 h-8 text-[#8d775e] mx-auto mb-3" />
              <p className="text-readable-secondary text-sm leading-relaxed">
                These choices help us shape your avatar and recommendations.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepIcon = (s) => {
    switch (s) {
      case 1: return Users;
      case 2: return Home;
      case 3: return Sparkles;
      default: return Sparkles;
    }
  };

  const StepIcon = getStepIcon(step);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-[40px] shadow-2xl shadow-black/50 overflow-hidden border border-gray-100 dark:border-white/5"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-white/5">
            <motion.div 
                className="h-full bg-[#8d775e]" 
                initial={{ width: "0%" }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] h-[85vh] md:h-[650px]">
          {/* Sidebar - Desktop Only */}
          <div className="hidden md:flex flex-col p-8 border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="mb-12">
                <div className="w-12 h-12 rounded-2xl bg-[#8d775e] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#8d775e]/20">
                    <StepIcon size={24} />
                </div>
                <h3 className="text-xl font-bold dark:text-white">Onboarding</h3>
                <p className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.2em] mt-1">Step {step} of {totalSteps}</p>
            </div>

            <div className="mt-auto space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#8d775e] flex items-center justify-center text-[10px] font-bold text-[#8d775e]">
                        {step}
                    </div>
                    <span className="text-xs font-bold text-readable-secondary">Current Step</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-200 dark:bg-white/10 ml-4" />
                <div className="flex items-center gap-3 opacity-30">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-white/20 flex items-center justify-center text-[10px] font-bold text-readable-muted">
                        {step < 10 ? step + 1 : 10}
                    </div>
                    <span className="text-xs font-bold text-readable-muted">Next Step</span>
                </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-col p-8 md:p-12 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Controls */}
            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                  step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-white/5 text-readable-secondary"
                }`}
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={onboardingMutation.isPending}
                className="flex items-center gap-3 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold shadow-xl hover:bg-black dark:hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {onboardingMutation.isPending ? "Saving..." : step === totalSteps ? "Finish" : "Continue"}
                {!onboardingMutation.isPending && (step === totalSteps ? <Check size={18} /> : <ChevronRight size={18} />)}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
