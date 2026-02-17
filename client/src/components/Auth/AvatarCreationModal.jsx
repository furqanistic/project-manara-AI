import { useAvatarUpload } from "@/hooks/useAuth";
import { createAvatar } from "@dicebear/core";
import { adventurer, avataaars, lorelei, notionists } from "@dicebear/collection";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, RefreshCw, Sparkles, User } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const svgToDataUri = (svg) => {
  if (!svg) return "";
  try {
    const encoded = window.btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
  } catch (error) {
    return "";
  }
};

const AvatarCreationModal = () => {
  const { currentUser } = useSelector((state) => state.user);
  const avatarMutation = useAvatarUpload();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [avatarName, setAvatarName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("lorelei");
  const [selectedPalette, setSelectedPalette] = useState("sand");
  const [seed, setSeed] = useState(() => Math.random().toString(36).slice(2, 10));

  const totalSteps = 3;

  const styleOptions = useMemo(
    () => [
      { id: "lorelei", label: "Studio", desc: "Modern editorial", style: lorelei },
      { id: "lorelei-soft", label: "Studio Soft", desc: "Gentle & airy", style: lorelei },
      { id: "lorelei-contrast", label: "Studio Contrast", desc: "Bold shadows", style: lorelei },
      { id: "avataaars", label: "Classic", desc: "Iconic profile", style: avataaars },
      { id: "avataaars-clean", label: "Classic Clean", desc: "Minimal details", style: avataaars },
      { id: "notionists", label: "Sketch", desc: "Hand-drawn vibe", style: notionists },
      { id: "notionists-ink", label: "Sketch Ink", desc: "Heavier lines", style: notionists },
      { id: "adventurer", label: "Bold", desc: "Playful & clean", style: adventurer },
      { id: "adventurer-bright", label: "Bold Bright", desc: "Vivid tones", style: adventurer },
    ],
    []
  );

  const paletteOptions = useMemo(
    () => [
      { id: "sand", label: "Sandstone", color: "#d9b99b" },
      { id: "sage", label: "Sage", color: "#b7c6a1" },
      { id: "noir", label: "Noir", color: "#2f2f2f" },
      { id: "terracotta", label: "Terracotta", color: "#e2a07e" },
      { id: "ocean", label: "Ocean", color: "#6fa8c6" },
      { id: "blush", label: "Blush", color: "#e7b8b2" },
      { id: "forest", label: "Forest", color: "#3d5c4d" },
      { id: "dune", label: "Dune", color: "#cdb28a" },
      { id: "sky", label: "Sky", color: "#9ec5e6" },
      { id: "stone", label: "Stone", color: "#a1a1aa" },
    ],
    []
  );

  const currentPalette = paletteOptions.find((opt) => opt.id === selectedPalette) || paletteOptions[0];
  const currentStyle = styleOptions.find((opt) => opt.id === selectedStyle) || styleOptions[0];
  const avatarSvg = useMemo(() => {
    try {
      return createAvatar(currentStyle.style, {
        seed: `${seed}-${selectedStyle}`,
        backgroundColor: [currentPalette.color.replace("#", "")],
        radius: 16,
      }).toString();
    } catch (error) {
      return "";
    }
  }, [currentStyle, seed, currentPalette]);
  const avatarDataUri = useMemo(() => svgToDataUri(avatarSvg), [avatarSvg]);

  const validateStep = (currentStep) => {
    const nextErrors = {};
    if (currentStep === 1 && !selectedStyle) nextErrors.style = "Pick a style.";
    if (currentStep === 2 && !selectedPalette) nextErrors.palette = "Pick a palette.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    try {
      await avatarMutation.mutateAsync({
        svg: avatarSvg,
        meta: {
          name: avatarName.trim(),
          style: selectedStyle,
          palette: selectedPalette,
          seed,
        },
      });
      toast.success("Avatar created! Your style is ready.");
    } catch (error) {
      toast.error("Failed to save your avatar. Please try again.");
    }
  };

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onWheel={(event) => event.preventDefault()}
        onTouchMove={(event) => event.preventDefault()}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-3xl h-[680px] max-h-[90vh] bg-white dark:bg-[#0a0a0a] rounded-[40px] shadow-2xl shadow-black/50 overflow-hidden border border-gray-100 dark:border-white/5"
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        {avatarMutation.isPending && (
          <div className="absolute left-0 right-0 top-0 z-20">
            <div className="h-1.5 bg-gray-100 dark:bg-white/5">
              <motion.div
                className="h-full bg-[#8d775e]"
                initial={{ x: "-60%", width: "60%" }}
                animate={{ x: "140%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-white/5">
          <motion.div
            className="h-full bg-[#8d775e]"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] h-full">
          <div className="hidden lg:flex flex-col p-10 border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="mb-10">
              <div className="w-12 h-12 rounded-2xl bg-[#8d775e] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#8d775e]/20">
                <User size={22} />
              </div>
              <h3 className="text-xl font-bold dark:text-white">Avatar Studio</h3>
              <p className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.2em] mt-1">
                Step {step} of {totalSteps}
              </p>
            </div>

            <div className="mt-auto space-y-6 text-xs text-gray-500">
              <div className="p-4 rounded-2xl bg-white dark:bg-black/30 border border-gray-100 dark:border-white/10">
                <Sparkles className="w-6 h-6 text-[#8d775e] mb-3" />
                <p className="leading-relaxed">
                  Your avatar represents your taste. We use it to personalize inspiration and AI renders.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#8d775e]" />
                Style-driven personalization
              </div>
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full min-h-0">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8d775e]">
                  Avatar
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {step === 1 && "Pick your style aura"}
                  {step === 2 && "Choose palette + accessory"}
                  {step === 3 && "Name your avatar"}
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-[28px] bg-white/70 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl flex items-center justify-center overflow-hidden">
                  {avatarDataUri ? (
                    <img src={avatarDataUri} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xs uppercase tracking-widest text-gray-400">Preview</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {step === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {styleOptions.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setSelectedStyle(style.id);
                            setErrors((prev) => ({ ...prev, style: "" }));
                          }}
                          className={`p-4 rounded-3xl border text-left transition-all ${
                            selectedStyle === style.id
                              ? "bg-[#8d775e]/10 border-[#8d775e] shadow-xl shadow-[#8d775e]/10"
                              : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                          }`}
                        >
                          <p className={`font-bold mb-1 ${selectedStyle === style.id ? "text-[#8d775e]" : "text-gray-900 dark:text-white"}`}>{style.label}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{style.desc}</p>
                        </button>
                      ))}
                      {errors.style && (
                        <p className="text-red-500 text-xs font-semibold uppercase">{errors.style}</p>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-500">Palette</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {paletteOptions.map((palette) => (
                            <button
                              key={palette.id}
                              type="button"
                              onClick={() => {
                                setSelectedPalette(palette.id);
                                setErrors((prev) => ({ ...prev, palette: "" }));
                              }}
                              className={`p-4 rounded-2xl border transition-all ${
                                selectedPalette === palette.id
                                  ? "border-[#8d775e] shadow-lg shadow-[#8d775e]/10"
                                  : "border-gray-100 dark:border-white/10"
                              }`}
                            >
                              <div
                                className="h-16 w-full rounded-xl mb-3"
                                style={{
                                  background: palette.color,
                                }}
                              />
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                {palette.label}
                              </p>
                            </button>
                          ))}
                        </div>
                        {errors.palette && (
                          <p className="text-red-500 text-xs font-semibold uppercase">{errors.palette}</p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                        <div className="text-sm text-gray-500">
                          Want a different look? Shuffle the seed.
                        </div>
                        <button
                          type="button"
                          onClick={() => setSeed(Math.random().toString(36).slice(2, 10))}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-900 text-white text-xs font-semibold shadow-md hover:bg-black transition-all"
                        >
                          <RefreshCw size={14} />
                          Shuffle
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="p-5 sm:p-6 rounded-3xl bg-[#8d775e]/5 border border-[#8d775e]/10 text-center">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 mx-auto rounded-[28px] bg-white shadow-xl flex items-center justify-center overflow-hidden">
                          {avatarDataUri && (
                            <img src={avatarDataUri} alt="Final avatar" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#8d775e] mt-4">
                          Style: {selectedStyle || "Custom"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          Avatar name (optional)
                        </label>
                        <input
                          type="text"
                          value={avatarName}
                          onChange={(e) => setAvatarName(e.target.value)}
                          placeholder="e.g. Nova, Oasis"
                          className="w-full mt-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                  step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
                }`}
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={avatarMutation.isPending}
                className="flex items-center gap-3 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold shadow-xl hover:bg-black dark:hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {avatarMutation.isPending
                  ? "Saving..."
                  : step === totalSteps
                  ? "Finish"
                  : "Continue"}
                {!avatarMutation.isPending &&
                  (step === totalSteps ? <Check size={18} /> : <ChevronRight size={18} />)}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarCreationModal;
