import { useOnboarding } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import {
    Accessibility,
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Check,
    ChevronRight,
    Cloud,
    CreditCard,
    Home,
    Layout,
    Palette,
    Settings,
    Sparkles,
    Target,
    User
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const OnboardingModal = () => {
  const [step, setStep] = useState(1);
  const onboardingMutation = useOnboarding();
  const [formData, setFormData] = useState({
    // Step 1: Identity & Household
    identity: {
      pronouns: "",
      ages: "",
      household: "",
      pets: ""
    },
    // Step 2: Job & Routine
    routine: {
      wfh: "no",
      hoursAtHome: "",
      hobbies: []
    },
    // Step 3: Lifestyle Priorities
    priorities: {
      vibe: "luxury", // luxury vs durability
      maintenance: "low", // low vs statement
      sustainability: "medium"
    },
    // Step 4: Accessibility & Comfort
    comfort: {
      allergies: "",
      textures: "",
      acoustics: "",
      footwear: "barefoot"
    },
    // Step 5: Aesthetic
    aesthetic: {
      styleTags: [],
      references: ["", "", ""],
      antiReference: ""
    },
    // Step 6: Color & Finishes
    colors: {
      favored: "",
      avoid: "",
      finishes: []
    },
    // Step 7: Storage
    storage: {
      painPoints: ""
    },
    // Step 8: Tech
    tech: {
      smartHome: "no",
      avRequirements: "",
      hiddenCables: "yes"
    },
    // Step 9: Budget & Timeline
    planning: {
      budgetRange: "",
      timeline: "",
      mustHitDates: ""
    },
    // Step 10: Decision Style
    decision: {
      iterationStyle: "fast",
      authority: ""
    }
  });

  const totalSteps = 10;

  const handleNext = () => {
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

  const updateFormData = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      await onboardingMutation.mutateAsync(formData);
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
            <h2 className="text-2xl font-bold dark:text-white">Identity & Household</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Gender / Pronouns</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. She/Her"
                  value={formData.identity.pronouns}
                  onChange={(e) => updateFormData("identity", "pronouns", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Ages of Residents</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. 32, 28, 5"
                  value={formData.identity.ages}
                  onChange={(e) => updateFormData("identity", "ages", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Who else lives here? (Kids/Elders)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white h-24 resize-none"
                  placeholder="Tell us about your household..."
                  value={formData.identity.household}
                  onChange={(e) => updateFormData("identity", "household", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Any pets?</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. Golden Retriever, 2 Cats"
                  value={formData.identity.pets}
                  onChange={(e) => updateFormData("identity", "pets", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Job & Routine</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <span className="font-medium dark:text-white">Do you work from home?</span>
                <div className="flex bg-white dark:bg-black/20 p-1 rounded-xl shadow-inner">
                  {["yes", "no"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateFormData("routine", "wfh", opt)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.routine.wfh === opt 
                        ? "bg-[#8d775e] text-white shadow-md" 
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Typical hours spent at home</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. Weeknights + Weekends"
                  value={formData.routine.hoursAtHome}
                  onChange={(e) => updateFormData("routine", "hoursAtHome", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Hobbies (comma separated)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="Hosting, Gaming, Cooking, Yoga..."
                  onChange={(e) => updateFormData("routine", "hobbies", e.target.value.split(",").map(s => s.trim()))}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Lifestyle Priorities</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-500 block text-center">Material Vibe</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "durability", label: "Durability Focus", desc: "Built to last, easy clean" },
                    { id: "luxury", label: "Luxury Focus", desc: "Premium, delicate materials" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => updateFormData("priorities", "vibe", opt.id)}
                      className={`p-4 rounded-3xl border text-left transition-all ${
                        formData.priorities.vibe === opt.id 
                        ? "bg-[#8d775e]/10 border-[#8d775e] shadow-xl shadow-[#8d775e]/5" 
                        : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                      }`}
                    >
                      <p className={`font-bold mb-1 ${formData.priorities.vibe === opt.id ? "text-[#8d775e]" : "text-gray-900 dark:text-white"}`}>{opt.label}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-500 block text-center">Maintenance Level</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "low", label: "Low Maintenance", desc: "Functional simplicity" },
                    { id: "statement", label: "Statement Pieces", desc: "Form over function" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => updateFormData("priorities", "maintenance", opt.id)}
                      className={`p-4 rounded-3xl border text-left transition-all ${
                        formData.priorities.maintenance === opt.id 
                        ? "bg-[#8d775e]/10 border-[#8d775e] shadow-xl shadow-[#8d775e]/5" 
                        : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                      }`}
                    >
                      <p className={`font-bold mb-1 ${formData.priorities.maintenance === opt.id ? "text-[#8d775e]" : "text-gray-900 dark:text-white"}`}>{opt.label}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Accessibility & Comfort</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Any Allergies?</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. Dust, Wool, Specific scents"
                  value={formData.comfort.allergies}
                  onChange={(e) => updateFormData("comfort", "allergies", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Textures you love or avoid?</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. Love velvet, Never linen"
                  value={formData.comfort.textures}
                  onChange={(e) => updateFormData("comfort", "textures", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Acoustics & Privacy needs</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. Soundproof office, open living area"
                  value={formData.comfort.acoustics}
                  onChange={(e) => updateFormData("comfort", "acoustics", e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-500">At-home Culture</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "barefoot", label: "Barefoot/Socks", desc: "Soft, warm flooring focus" },
                    { id: "slippers", label: "Slippers/Shoes", desc: "Durable, easy-clean floors" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => updateFormData("comfort", "footwear", opt.id)}
                      className={`p-4 rounded-3xl border text-left transition-all ${
                        formData.comfort.footwear === opt.id 
                        ? "bg-[#8d775e]/10 border-[#8d775e] shadow-xl shadow-[#8d775e]/5" 
                        : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                      }`}
                    >
                      <p className={`font-bold mb-1 ${formData.comfort.footwear === opt.id ? "text-[#8d775e]" : "text-gray-900 dark:text-white"}`}>{opt.label}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Aesthetic Vision</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Style Tags (Select 3-5)</label>
                <div className="flex flex-wrap gap-2">
                  {["Japandi", "Minimalist", "Mid-Century", "Industrial", "Bohemian", "Art Deco", "Scandinavian", "Contemporary"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const current = formData.aesthetic.styleTags;
                        if (current.includes(tag)) {
                          updateFormData("aesthetic", "styleTags", current.filter(t => t !== tag));
                        } else if (current.length < 5) {
                          updateFormData("aesthetic", "styleTags", [...current, tag]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        formData.aesthetic.styleTags.includes(tag)
                        ? "bg-[#8d775e] text-white"
                        : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t dark:border-white/5">
                <label className="text-sm font-medium text-gray-500">3 Reference Links (Inspiration)</label>
                {formData.aesthetic.references.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                    placeholder={`Link ${idx + 1}`}
                    value={val}
                    onChange={(e) => {
                      const newRefs = [...formData.aesthetic.references];
                      newRefs[idx] = e.target.value;
                      updateFormData("aesthetic", "references", newRefs);
                    }}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">The "Anti-Reference" (What you hate)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="Link or description of what to avoid..."
                  value={formData.aesthetic.antiReference}
                  onChange={(e) => updateFormData("aesthetic", "antiReference", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Color & Finishes</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Favored Hues (Your happy colors)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. Sage green, Terracotta, Cream"
                  value={formData.colors.favored}
                  onChange={(e) => updateFormData("colors", "favored", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">No-Go Colors</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="Colors you absolutely dislike..."
                  value={formData.colors.avoid}
                  onChange={(e) => updateFormData("colors", "avoid", e.target.value)}
                />
              </div>
              <div className="space-y-2 pt-4 border-t dark:border-white/5">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Preferred Metals & Finishes</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Brushed Brass", "Matte Black", "Chrome", "Copper", "Natural Wood", "Concrete"].map(finish => (
                    <button
                      key={finish}
                      onClick={() => {
                        const current = formData.colors.finishes;
                        if (current.includes(finish)) {
                          updateFormData("colors", "finishes", current.filter(f => f !== finish));
                        } else {
                          updateFormData("colors", "finishes", [...current, finish]);
                        }
                      }}
                      className={`p-3 rounded-2xl border text-sm font-bold transition-all ${
                        formData.colors.finishes.includes(finish)
                        ? "bg-[#8d775e] text-white border-[#8d775e]"
                        : "bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10"
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Storage Pain Points</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 block">What constantly clutters your home?</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white h-48 resize-none"
                  placeholder="e.g. Mail/Papers on the counter, shoes in the hall, kids toys everywhere..."
                  value={formData.storage.painPoints}
                  onChange={(e) => updateFormData("storage", "painPoints", e.target.value)}
                />
                <p className="text-[10px] text-gray-400 uppercase tracking-widest pt-2">Knowing your clutter helps us design better storage solutions.</p>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Technology & AV</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <div className="space-y-1">
                  <p className="font-bold dark:text-white">Smart Home Integration</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Voice control, automated lights, etc.</p>
                </div>
                <div className="flex bg-white dark:bg-black/20 p-1 rounded-xl shadow-inner shrink-0">
                  {["yes", "no"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateFormData("tech", "smartHome", opt)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.tech.smartHome === opt 
                        ? "bg-[#8d775e] text-white shadow-md" 
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">AV Requirements</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. Home theater, multi-room audio, gaming setup"
                  value={formData.tech.avRequirements}
                  onChange={(e) => updateFormData("tech", "avRequirements", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <div className="space-y-1">
                  <p className="font-bold dark:text-white">Hidden Cable Management</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Is clean cable routing a priority?</p>
                </div>
                <div className="flex bg-white dark:bg-black/20 p-1 rounded-xl shadow-inner shrink-0">
                  {["yes", "no"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateFormData("tech", "hiddenCables", opt)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.tech.hiddenCables === opt 
                        ? "bg-[#8d775e] text-white shadow-md" 
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Budget & Timeline</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Ballpark Budget Range (AED)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. 50,000 - 100,000"
                  value={formData.planning.budgetRange}
                  onChange={(e) => updateFormData("planning", "budgetRange", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Expected Timeline</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="e.g. 3 months, immediate"
                  value={formData.planning.timeline}
                  onChange={(e) => updateFormData("planning", "timeline", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Must-hit dates (Move-in, Baby due, etc.)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                  placeholder="Dates that shouldn't be missed..."
                  value={formData.planning.mustHitDates}
                  onChange={(e) => updateFormData("planning", "mustHitDates", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Decision Style</h2>
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-500 block text-center">Collaboration Preference</label>
                    <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: "fast", label: "Fast Iterations", desc: "Show me ideas quickly" },
                        { id: "thorough", label: "Thorough Options", desc: "Detailed deep-dives" }
                    ].map(opt => (
                        <button
                        key={opt.id}
                        onClick={() => updateFormData("decision", "iterationStyle", opt.id)}
                        className={`p-4 rounded-3xl border text-left transition-all ${
                            formData.decision.iterationStyle === opt.id 
                            ? "bg-[#8d775e]/10 border-[#8d775e] shadow-xl shadow-[#8d775e]/5" 
                            : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                        }`}
                        >
                        <p className={`font-bold mb-1 ${formData.decision.iterationStyle === opt.id ? "text-[#8d775e]" : "text-gray-900 dark:text-white"}`}>{opt.label}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{opt.desc}</p>
                        </button>
                    ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Who signs off on final decisions?</label>
                    <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 outline-none transition-all dark:text-white"
                    placeholder="e.g. Me, My partner, Both"
                    value={formData.decision.authority}
                    onChange={(e) => updateFormData("decision", "authority", e.target.value)}
                    />
                </div>

                <div className="p-6 rounded-[32px] bg-[#8d775e]/5 border border-[#8d775e]/10 text-center">
                    <Sparkles className="w-10 h-10 text-[#8d775e] mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        You're all set! Completing this profile helps Manara AI provide bespoke architectural syntheses tailored to your unique lifestyle.
                    </p>
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepIcon = (s) => {
    switch (s) {
      case 1: return User;
      case 2: return Briefcase;
      case 3: return Target;
      case 4: return Accessibility;
      case 5: return Layout;
      case 6: return Palette;
      case 7: return Cloud;
      case 8: return Settings;
      case 9: return CreditCard;
      case 10: return Check;
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
                <p className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.2em] mt-1">Step {step} of 10</p>
            </div>

            <div className="mt-auto space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#8d775e] flex items-center justify-center text-[10px] font-bold text-[#8d775e]">
                        {step}
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Current Step</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-200 dark:bg-white/10 ml-4" />
                <div className="flex items-center gap-3 opacity-30">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-white/20 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {step < 10 ? step + 1 : 10}
                    </div>
                    <span className="text-xs font-bold text-gray-400">Next Step</span>
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
                  step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
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
