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
  CheckCircle2,
  Clock,
  Sparkles,
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
  const [selectedSpace, setSelectedSpace] = useState("Living Room");
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
      toast.error("Please describe your design requirements");
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
      toast.success("Moodboard image ready! Loading details...");
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
        toast.success("All details generated successfully!");
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
          "Failed to generate moodboard"
      );
    }
  };

  const handleRegenerate = async () => {
    if (!currentMoodboard) {
      toast.error("No moodboard to regenerate");
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
      toast.error("Failed to regenerate moodboard");
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
    toast.success("Image downloaded successfully!");
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

  // NEW: Handle selecting a moodboard from history
  const handleSelectFromHistory = (moodboard) => {
    setCurrentMoodboard(moodboard);
    setCurrentStep(3);
    toast.success(`Loaded: ${moodboard.title}`);
  };

  const steps = [
    { number: 1, title: "Space" },
    { number: 2, title: "Style" },
    { number: 3, title: "Colors" },
    { number: 4, title: "Vision" },
  ];

  const useProgressTracking = (moodboardId, onProgress) => {
    useEffect(() => {
      if (!moodboardId) return;

      const eventSource = new EventSource(
        `/api/moodboards/${moodboardId}/progress-stream`
      );

      eventSource.addEventListener("progress", (event) => {
        try {
          const data = JSON.parse(event.data);
          onProgress(data.currentSteps);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {currentStep < 3 ? (
          <WizardFlow
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            steps={steps}
            selectedSpace={selectedSpace}
            setSelectedSpace={setSelectedSpace}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
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
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow z-30"
          style={{ backgroundColor: BRAND_COLOR }}
          title="View moodboard history"
        >
          <Clock className="w-6 h-6 text-white" />
        </motion.button>

        {/* NEW: History Modal */}
        <MoodboardHistory
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onSelectMoodboard={handleSelectFromHistory}
        />
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
    <div className="h-screen flex flex-col pt-28">
      <div className="max-w-6xl mx-auto px-6 w-full flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1">
              <motion.div
                className="flex items-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all flex-shrink-0`}
                  style={{
                    backgroundColor:
                      currentStep >= idx ? BRAND_COLOR : "#e5e7eb",
                    color: currentStep >= idx ? "white" : "#9ca3af",
                  }}
                >
                  {currentStep > idx ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className="ml-3 text-sm font-semibold"
                  style={{
                    color: currentStep >= idx ? BRAND_COLOR : "#9ca3af",
                  }}
                >
                  {step.title}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 rounded transition-all`}
                    style={{
                      backgroundColor:
                        currentStep > idx ? BRAND_COLOR : "#e5e7eb",
                    }}
                  />
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-10"
            >
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
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 mt-6 justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isGenerating}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            {currentStep < 2 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed() || isGenerating}
                className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white hover:shadow-lg disabled:opacity-50 transition-all"
                style={{ backgroundColor: BRAND_COLOR }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = BRAND_COLOR_DARK)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = BRAND_COLOR)
                }
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onGenerate}
                disabled={!canProceed() || isGenerating}
                className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white hover:shadow-lg disabled:opacity-50 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})`,
                }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Moodboard
                  </>
                )}
              </button>
            )}
          </div>
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
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Design style?
        </h2>
        <p className="text-base text-gray-500">
          Choose the aesthetic that resonates with you
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {DESIGN_STYLES.map((style) => (
          <motion.button
            key={style.value}
            onClick={() => setSelectedStyle(style.label)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 rounded-xl transition-all duration-300 border text-center group`}
            style={{
              borderColor: selectedStyle === style.label ? BRAND_COLOR : "#f3f4f6",
              backgroundColor: selectedStyle === style.label ? `${BRAND_COLOR}05` : "#ffffff",
              boxShadow: selectedStyle === style.label 
                ? `0 10px 20px ${BRAND_COLOR}10` 
                : "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div className="relative z-10 mb-2">
              <div className="text-2xl">
                {styleIcons[style.label] || "🎨"}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className={`font-bold text-sm mb-0.5 transition-colors ${
                selectedStyle === style.label ? "text-gray-900" : "text-gray-600"
              }`}>
                {style.label}
              </h3>
            </div>

            {selectedStyle === style.label && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 z-20"
              >
                <div className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: BRAND_COLOR }}>
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
        className="mt-8 text-center text-sm text-gray-500"
      >
        {selectedStyle ? (
          <span>
            Selected:{" "}
            <span style={{ color: BRAND_COLOR }} className="font-semibold">
              {selectedStyle}
            </span>
          </span>
        ) : (
          <span>Select a style to continue →</span>
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
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Colors & Your Vision
        </h2>
        <p className="text-base text-gray-500">
          Select your palette and describe your design goals
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <label className="block text-sm font-bold text-gray-900 mb-4">
            Color Palette
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold text-[13px] truncate ${
                    selectedColor === palette.name ? "text-gray-900" : "text-gray-500"
                  }`}>
                    {palette.name}
                  </h3>
                  {selectedColor === palette.name && (
                    <CheckCircle2 className="w-4 h-4" style={{ color: BRAND_COLOR }} />
                  )}
                </div>
                <div className="flex gap-0.5 h-4 rounded-md overflow-hidden">
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
