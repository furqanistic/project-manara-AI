// File: project-manara-AI/client/src/pages/AIBuilders/MoodboardGenerator.jsx
import TopBar from "@/components/Layout/Topbar";
import BeautifulLoader from "@/components/Moodboard/BeautifulLoader.jsx";
import { MoodboardHistory } from "@/components/Moodboard/MoodboardHistory";
import { ResultView } from "@/components/Moodboard/ResultView.jsx";
import { StepSpace } from "@/components/Moodboard/StepSpace.jsx";
import {
    useCreateMoodboard,
    useGenerateMoodboard,
    useGenerateMoodboardDescriptions,
} from "@/hooks/useMoodboard";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    CheckCircle2,
    Clock,
    Download,
    Edit3,
    Plus,
    Share2,
    Sparkles,
    Trash2,
    Wand2,
    X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    BRAND_COLOR,
    BRAND_COLOR_DARK,
    BRAND_COLOR_LIGHT,
    COLOR_PALETTES,
    DESIGN_STYLES,
    SPACE_TYPES,
    getColorDescriptionForPalette,
} from "../../components/Moodboard/Moodboardconfig.js";

const MoodboardGenerator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedColor, setSelectedColor] = useState("Neutral Tones");
  const [changes, setChanges] = useState("");
  const [currentMoodboard, setCurrentMoodboard] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingState, setLoadingState] = useState(null);
  const [progressSteps, setProgressSteps] = useState([]);
  const [generationPhase, setGenerationPhase] = useState(null); // 'image' or 'descriptions'
  const [showHistory, setShowHistory] = useState(false); // NEW: History modal state
  const createMutation = useCreateMoodboard();
  const generateMutation = useGenerateMoodboard();
  const generateDescriptionsMutation = useGenerateMoodboardDescriptions();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!changes.trim()) {
      toast.error("Please describe your design requirements", { id: 'missing-requirements' });
      return;
    }

    try {
      // ========== PHASE 1: Generate Image (Fast) ==========
      setLoadingState("generating");
      setGenerationPhase("image");
      setProgressSteps(["Creating moodboard draft"]);

      // Safety timeout: Clear loading state after 60s if nothing happens
      const safetyTimeout = setTimeout(() => {
        setLoadingState(null);
        setGenerationPhase(null);
      }, 60000);

      const spaceValue =
        SPACE_TYPES.find((s) => s.name === selectedSpace)?.value ||
        "living_room";
      const styleValue =
        DESIGN_STYLES.find((s) => s.label === selectedStyle)?.value || "modern";

      const colorDescription = getColorDescriptionForPalette(selectedColor);

      const selectedPalette = COLOR_PALETTES.find(
        (p) => p.name === selectedColor
      );
      const paletteColors = selectedPalette ? selectedPalette.colors : [];

      const createPayload = {
        title: `${selectedStyle || "Modern"} ${selectedSpace}`,
        style: styleValue,
        roomType: spaceValue,
        colorPreferences: [selectedColor],
        paletteColors: paletteColors, // Pass the hex colors
        customPrompt: changes.trim(),
        layout: "collage",
        imageCount: 1,
        // Let AI choose aspect ratio naturally
      };

      const createResult = await createMutation.mutateAsync(createPayload);
      const moodboardId = createResult.data.moodboard._id;

      setProgressSteps(["Moodboard created", "Generating image..."]);

      const enhancedCustomPrompt = `${changes.trim()}. Color scheme: ${colorDescription}`;

      const generatePayload = {
        customPrompt: enhancedCustomPrompt,
        imageCount: 1,
        // Let AI choose aspect ratio naturally
      };

      // Generate image (Phase 1)
      const generateResult = await generateMutation.mutateAsync({
        moodboardId,
        data: generatePayload,
      });

      // Clear the safety timeout if we finished Phase 1
      if (safetyTimeout) clearTimeout(safetyTimeout);

      // Image is ready! Show it to the user
      setCurrentMoodboard(generateResult.data.moodboard);
      setProgressSteps(["Image generated", "Colors extracted", "Image ready!"]);
      setLoadingState(null);
      setGenerationPhase(null);
      toast.success("Moodboard image ready! Loading details...", { id: 'image-ready' });
      navigate(`/moodboards/${moodboardId}`);

      // ========== PHASE 2: Generate Descriptions (Background) ==========
      // Start Phase 2 immediately but don't block the UI
      setGenerationPhase("descriptions");

      try {
        const descriptionsResult =
          await generateDescriptionsMutation.mutateAsync(moodboardId);

        // Update moodboard with all descriptions
        setCurrentMoodboard(descriptionsResult.data.moodboard);
        setGenerationPhase(null);
        toast.success("All details generated successfully!", { id: 'all-gen-success' });
      } catch (descError) {
        console.error("Description generation error:", descError);
        setGenerationPhase(null);
        // Don't show error toast - image is already shown
        toast("Some details couldn't be generated, but your image is ready!", {
          icon: "⚠️",
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      setProgressSteps([]);
      setLoadingState(null);
      setGenerationPhase(null);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate moodboard",
          { id: 'gen-error' }
      );
    }
  };

  const handleRegenerate = async () => {
    if (!currentMoodboard) {
      toast.error("No moodboard to regenerate", { id: 'no-moodboard' });
      return;
    }

    try {
      setLoadingState("generating");

      const colorDescription = getColorDescriptionForPalette(selectedColor);
      const enhancedCustomPrompt = changes.trim()
        ? `${changes.trim()}. Color scheme: ${colorDescription}`
        : currentMoodboard.prompt;

      const generatePayload = {
        customPrompt: enhancedCustomPrompt,
        imageCount: 1,
        aspectRatio: "16:9",
      };

      const generateResult = await generateMutation.mutateAsync({
        moodboardId: currentMoodboard._id,
        data: generatePayload,
      });

      setCurrentMoodboard(generateResult.data.moodboard);
      setLoadingState(null);
      toast.success("Moodboard regenerated successfully!");
    } catch (error) {
      console.error("Regeneration error:", error);
      setLoadingState(null);
      toast.error("Failed to regenerate moodboard", { id: 'regen-error' });
    }
  };

  const downloadMoodboardImage = () => {
    if (!currentMoodboard?.compositeMoodboard?.url) return;

    const link = document.createElement("a");
    link.href = currentMoodboard.compositeMoodboard.url;
    link.download = `moodboard-${currentMoodboard._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded successfully!", { id: 'download-success' });
  };

  const downloadMoodboardPDF = async () => {
    if (!currentMoodboard) return;

    try {
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      toast.loading("Generating PDF...", { id: "pdf-generation" });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(147, 124, 96);
      pdf.text(currentMoodboard.title, margin, 20);

      // Date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Created: ${new Date(currentMoodboard.createdAt).toLocaleDateString()}`,
        margin,
        28
      );

      // Image
      if (currentMoodboard.compositeMoodboard?.url) {
        const imgData = currentMoodboard.compositeMoodboard.url;
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (imgWidth * 9) / 16;
        pdf.addImage(imgData, "PNG", margin, 35, imgWidth, imgHeight);
      }

      let yPosition = 35 + ((pageWidth - 2 * margin) * 9) / 16 + 15;

      // Style and Room Type
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Style: ${currentMoodboard.style}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Room Type: ${currentMoodboard.roomType}`, margin, yPosition);
      yPosition += 10;

      // Design Narrative
      if (currentMoodboard.designNarrative?.narrative) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(147, 124, 96);
        pdf.text("Design Narrative", margin, yPosition);
        yPosition += 7;

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        const narrativeLines = pdf.splitTextToSize(
          currentMoodboard.designNarrative.narrative,
          pageWidth - 2 * margin
        );
        pdf.text(narrativeLines, margin, yPosition);
        yPosition += narrativeLines.length * 5 + 10;
      }

      // Color Palette
      if (currentMoodboard.colorPalette?.length > 0) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(147, 124, 96);
        pdf.text("Color Palette", margin, yPosition);
        yPosition += 10;

        currentMoodboard.colorPalette.slice(0, 5).forEach((color, idx) => {
          const hexColor = color.hex.replace("#", "");
          const r = parseInt(hexColor.substr(0, 2), 16);
          const g = parseInt(hexColor.substr(2, 2), 16);
          const b = parseInt(hexColor.substr(4, 2), 16);

          pdf.setFillColor(r, g, b);
          pdf.rect(margin + idx * 35, yPosition, 30, 15, "F");

          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0);
          pdf.text(color.name, margin + idx * 35, yPosition + 20);
          pdf.text(color.hex, margin + idx * 35, yPosition + 25);
        });

        yPosition += 35;
      }

      // Materials
      if (currentMoodboard.materials) {
        const materialsEntries = Object.entries(currentMoodboard.materials);
        const hasContent = materialsEntries.some(
          ([_, items]) => items && items.length > 0
        );

        if (hasContent) {
          pdf.addPage();
          yPosition = 20;

          pdf.setFontSize(16);
          pdf.setTextColor(147, 124, 96);
          pdf.text("Materials", margin, yPosition);
          yPosition += 10;

          materialsEntries.forEach(([key, items]) => {
            if (!items || items.length === 0) return;

            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.text(
              key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
              margin,
              yPosition
            );
            yPosition += 7;

            items.forEach((item) => {
              if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
              }

              pdf.setFontSize(10);
              pdf.text(`• ${item.type}`, margin + 5, yPosition);
              yPosition += 5;
            });

            yPosition += 5;
          });
        }
      }

      // Furniture
      if (currentMoodboard.furniture?.heroPieces?.length > 0) {
        pdf.addPage();
        yPosition = 20;

        pdf.setFontSize(16);
        pdf.setTextColor(147, 124, 96);
        pdf.text("Furniture", margin, yPosition);
        yPosition += 10;

        currentMoodboard.furniture.heroPieces.forEach((piece) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`• ${piece.name}`, margin, yPosition);
          yPosition += 6;

          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`  Category: ${piece.category}`, margin, yPosition);
          yPosition += 10;
        });
      }

      pdf.save(`moodboard-${currentMoodboard._id}.pdf`);
      toast.success("PDF downloaded successfully!", { id: "pdf-generation" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", { id: "pdf-generation" });
    }
  };

  // Handle selecting a moodboard from history
  const handleSelectFromHistory = (moodboard) => {
    setCurrentMoodboard(moodboard);
    setCurrentStep(3);
    toast.success(`Loaded: ${moodboard.title}`, { id: 'history-load' });
  };

  const steps = [
    { number: 1, title: "Spatial Base", phase: "Baseline" },
    { number: 2, title: "Aesthetic DNA", phase: "Styling" },
    { number: 3, title: "Vision & Tone", phase: "Curation" },
  ];

  const onSelectSpace = (spaceName) => {
    setSelectedSpace(spaceName);
    setTimeout(() => {
      setCurrentStep(1);
    }, 400);
  };

  const onSelectStyle = (styleLabel) => {
    setSelectedStyle(styleLabel);
    setTimeout(() => {
      setCurrentStep(2);
    }, 400);
  };

  const useProgressTracking = (moodboardId, onProgress) => {
    useEffect(() => {
      if (!moodboardId) return;
  
      const eventSource = new EventSource(
        `/api/moodboards/${moodboardId}/progress-stream`
      );
  
      eventSource.addEventListener("progress", (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // If it's a status update, update the progress steps
          if (data.type === 'status' || !data.type) {
            onProgress(data.currentSteps);
          }
          
          // If it's a data update, merge it into our current moodboard state
          if (data.type === 'update' && data.fieldData) {
            setCurrentMoodboard(prev => ({
              ...prev,
              ...data.fieldData
            }));
          }
        } catch (error) {
          console.error("Error parsing progress event:", error);
        }
      });
  
      eventSource.addEventListener("complete", () => {
        eventSource.close();
        onProgress([]); // Clear progress
        setLoadingState(null); // Ensure loader is cleared
      });
  
      eventSource.addEventListener("error", () => {
        eventSource.close();
        setLoadingState(null); // Clear loader on error
      });
  
      return () => {
        eventSource.close();
      };
    }, [moodboardId, onProgress]);
  };

  const isGenerating = createMutation.isPending || generateMutation.isPending;

  return (
    <>
      <TopBar />
      {loadingState === "generating" && (
        <BeautifulLoader
          progressSteps={progressSteps}
          phase={generationPhase}
        />
      )}
      <div className="min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] relative transition-colors duration-500 flex flex-col pt-12 sm:pt-20 pb-12">
        {/* Cinematic Ambient Background */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute top-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-[#8d775e]/5 dark:bg-[#8d775e]/10 blur-[140px]' />
          <div className='absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#b8a58c]/3 dark:bg-[#b8a58c]/5 blur-[120px]' />
          <div className='absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none' 
               style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
        </div>

        <div className="relative z-10 w-full">
          {currentStep < 3 ? (
          <WizardFlow
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            steps={steps}
            selectedSpace={selectedSpace}
            setSelectedSpace={onSelectSpace}
            selectedStyle={selectedStyle}
            setSelectedStyle={onSelectStyle}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            changes={changes}
            setChanges={setChanges}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        ) : (
          <ResultView
            currentMoodboard={currentMoodboard}
            onRegenerate={handleRegenerate}
            onDownload={downloadMoodboardImage}
            onDownloadPDF={downloadMoodboardPDF}
            onBackToCreate={() => setCurrentStep(0)}
            loadingState={loadingState}
            generationPhase={generationPhase}
            showImageModal={showImageModal}
            setShowImageModal={setShowImageModal}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            setCurrentMoodboard={setCurrentMoodboard}
          />
        )}



          {/* NEW: Floating History Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(true)}
            className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl hover:shadow-brand transition-all z-30 bg-[#8d775e] text-white"
            title="View moodboard history"
          >
            <Clock className="w-6 h-6" />
          </motion.button>

          {/* NEW: History Modal */}
          <MoodboardHistory
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            onSelectMoodboard={handleSelectFromHistory}
          />
        </div>
      </div>
    </>
  );
};

const WizardFlow = ({
  currentStep,
  setCurrentStep,
  steps,
  selectedSpace,
  setSelectedSpace,
  selectedStyle,
  setSelectedStyle,
  selectedColor,
  setSelectedColor,
  changes,
  setChanges,
  onGenerate,
  isGenerating,
}) => {
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!selectedSpace;
      case 1:
        return !!selectedStyle;
      case 2:
        return !!selectedColor && changes.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#111] rounded-[30px] sm:rounded-[40px] shadow-2xl shadow-[#8d775e]/5 border border-gray-100 dark:border-white/5 p-6 sm:p-10 relative overflow-hidden"
            >
              {/* Absolute Navigation Controls */}
              <div className="absolute top-6 left-6 z-20">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0 || isGenerating}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-20"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {currentStep === 2 && (
                <div className="absolute top-6 right-6 z-20">
                  <button
                    onClick={onGenerate}
                    disabled={!canProceed() || isGenerating}
                    className="flex items-center gap-2 px-4 sm:px-6 h-10 sm:h-12 rounded-xl font-bold text-white shadow-xl transition-all disabled:opacity-30 group overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, #8d775e, #b8a58c)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        <span className="text-sm sm:text-base">Create</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="pt-8 sm:pt-4"> {/* Added padding to prevent overlap with absolute buttons */}
                {currentStep === 0 && (
                  <StepSpace
                    selectedSpace={selectedSpace}
                    setSelectedSpace={setSelectedSpace}
                  />
                )}

                {currentStep === 1 && (
                  <StepStyle
                    selectedStyle={selectedStyle}
                    setSelectedStyle={setSelectedStyle}
                  />
                )}

                {currentStep === 2 && (
                  <StepColorsAndVision
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    changes={changes}
                    setChanges={setChanges}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const StepStyle = ({ selectedStyle, setSelectedStyle }) => {
  const styleIcons = {
    "Modern Minimalist": "⬜",
    Contemporary: "✨",
    Scandinavian: "🧊",
    Industrial: "⚙️",
    Traditional: "👑",
    Transitional: "⚖️",
    "Mid-Century Modern": "🛋️",
    Bohemian: "🌸",
    "Art Deco": "💎",
    "Industrial Chic": "🏭",
    Rustic: "🌾",
    Coastal: "🌊",
    Mediterranean: "☀️",
    Japanese: "🌸",
    Luxury: "✨",
  };

  return (
    <div className="max-w-5xl mx-auto pt-10 sm:pt-0">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="w-8 h-[1px] bg-[#8d775e]"></div>
          <span className="text-[9px] font-bold tracking-[0.5em] text-[#8d775e] uppercase">Aesthetic Curation</span>
          <div className="w-8 h-[1px] bg-[#8d775e]"></div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Design <span className="text-[#8d775e] font-serif italic">Styles.</span>
        </h2>
        <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">
          Choose the architectural DNA for your space.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {DESIGN_STYLES.map((style) => (
          <motion.button
            key={style.value}
            onClick={() => setSelectedStyle(style.label)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 border text-center group ${
              selectedStyle === style.label 
                ? "bg-[#8d775e]/10 border-[#8d775e]" 
                : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-[#8d775e]/30"
            }`}
          >
            <div className="relative z-10 mb-2 sm:mb-3 bg-gray-50 dark:bg-black/20 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <div className="text-xl sm:text-2xl">
                {styleIcons[style.label] || "🎨"}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className={`font-bold text-[10px] sm:text-sm mb-1 transition-colors truncate ${
                selectedStyle === style.label ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
              }`}>
                {style.label}
              </h3>
              <p className="hidden sm:block text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-60">
                {style.description}
              </p>
            </div>

            {selectedStyle === style.label && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-4 right-4 z-20"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#8d775e] shadow-lg shadow-[#8d775e]/20">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        {selectedStyle ? (
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d775e]">
            Trajectory set: {selectedStyle}
          </span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Select a style to continue</span>
        )}
      </motion.div>
    </div>
  );
};

const StepColorsAndVision = ({
  selectedColor,
  setSelectedColor,
  changes,
  setChanges,
}) => {
  const suggestions = [
    "Natural lighting", "Minimalist furniture", "Indoor plants",
    "Cozy atmosphere", "Industrial accents", "Wooden elements",
    "Open space concept", "Professional office", "Warm textures",
    "Modern lighting fixtures", "Sustainable materials", "Bold colors"
  ];

  const addSuggestion = (suggestion) => {
    if (changes.includes(suggestion)) return;
    setChanges(prev => prev ? `${prev}, ${suggestion}` : suggestion);
  };

  return (
    <div className="max-w-6xl mx-auto pt-10 sm:pt-0">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="w-8 h-[1px] bg-[#8d775e]"></div>
          <span className="text-[9px] font-bold tracking-[0.5em] text-[#8d775e] uppercase">SENSORY MAPPING</span>
          <div className="w-8 h-[1px] bg-[#8d775e]"></div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Colors & <span className="text-[#8d775e] font-serif italic">Vision.</span>
        </h2>
        <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">
          Define the chromatic spectrum and conceptual requirements.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-50/50 dark:bg-black/20 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#8d775e] mb-4 sm:mb-6">
            Color Palette
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-3 max-h-[300px] sm:max-h-[480px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            {COLOR_PALETTES.map((palette) => (
              <motion.button
                key={palette.name}
                onClick={() => setSelectedColor(palette.name)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`p-3 rounded-xl border transition-all text-left bg-white`}
                style={{
                  borderColor: selectedColor === palette.name ? BRAND_COLOR : "#f3f4f6",
                  boxShadow: selectedColor === palette.name 
                    ? `0 4px 12px ${BRAND_COLOR}15` 
                    : "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <h3 className={`font-bold text-[10px] sm:text-[13px] truncate ${
                    selectedColor === palette.name ? "text-gray-900" : "text-gray-500"
                  }`}>
                    {palette.name}
                  </h3>
                  {selectedColor === palette.name && (
                    <CheckCircle2 className="w-4 h-4" style={{ color: BRAND_COLOR }} />
                  )}
                </div>
                <div className="flex gap-0.5 h-2 sm:h-4 rounded-md overflow-hidden">
                  {palette.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Your Design Vision *
            </label>
            <textarea
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder='Example: "Modern office with natural wood, warm lighting, cozy atmosphere..."'
              className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-brand-color focus:outline-none resize-none h-48 text-gray-900 transition-all placeholder-gray-400 bg-gray-50/50"
              style={{
                borderColor: changes.trim() ? BRAND_COLOR : "#f3f4f6",
              }}
            />
            <div className="flex justify-between mt-2">
              <p className="text-[11px] text-gray-400">
                {changes.length} characters
              </p>
              <button 
                onClick={() => setChanges("")}
                className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                disabled={!changes}
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => addSuggestion(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-100 text-gray-600 hover:border-brand-color hover:text-brand-color transition-all shadow-sm"
                  style={{ 
                    '--brand-color': BRAND_COLOR,
                    borderColor: changes.includes(s) ? BRAND_COLOR : "#f3f4f6",
                    color: changes.includes(s) ? BRAND_COLOR : "#4b5563",
                    backgroundColor: changes.includes(s) ? `${BRAND_COLOR}05` : "white"
                  }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodboardGenerator;
