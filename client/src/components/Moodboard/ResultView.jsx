// File: project-manara-AI/clieSparklesnt/src/components/Moodboard/ResultView.jsx
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Edit3,
  FileText,
  Maximize2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  BRAND_COLOR,
  BRAND_COLOR_DARK,
  BRAND_COLOR_LIGHT,
} from "./Moodboardconfig";

export const ResultView = ({
  currentMoodboard,
  onRegenerate,
  onDownload,
  onDownloadPDF,
  onBackToCreate,
  loadingState,
  generationPhase,
  showImageModal,
  setShowImageModal,
  showEditModal,
  setShowEditModal,
  setCurrentMoodboard,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!currentMoodboard?.compositeMoodboard?.url) {
    return (
      <div className="min-h-screen pt-32 pb-12 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl bg-white"
          >
            <Sparkles className="w-12 h-12" style={{ color: BRAND_COLOR }} />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Preparing Result
          </h2>
          <p className="text-gray-500 mb-8">
            Initializing your personalized moodboard dashboard...
          </p>
          
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
            <motion.div 
              className="h-full"
              style={{ backgroundColor: BRAND_COLOR }}
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
            Almost Ready
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "materials", label: "Materials" },
    { id: "furniture", label: "Furniture" },
    { id: "lighting", label: "Lighting" },
    { id: "layout", label: "Layout" },
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 lg:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 break-words">
              {currentMoodboard.title}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Created on{" "}
              {new Date(currentMoodboard.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onBackToCreate}
            className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all whitespace-nowrap flex-shrink-0"
          >
            Create New
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative group rounded-xl sm:rounded-2xl overflow-hidden w-full bg-white border border-gray-100 flex justify-center"
            >

              
              <img
                src={currentMoodboard.compositeMoodboard.url}
                alt="Moodboard"
                className="relative z-10 max-w-full h-auto block cursor-pointer hover:scale-[1.01] transition-transform duration-500"
                onClick={() => setShowImageModal(true)}
              />

              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowImageModal(true)}
                  className="p-3 bg-white/95 hover:bg-white rounded-lg border border-gray-100 transition-all"
                  title="View full size"
                >
                  <Maximize2
                    className="w-5 h-5"
                    style={{ color: BRAND_COLOR }}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEditModal(true)}
                  className="p-3 bg-white/95 hover:bg-white rounded-lg border border-gray-100 transition-all"
                  title="Edit moodboard"
                >
                  <Edit3 className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDownload}
                  className="p-3 bg-white/95 hover:bg-white rounded-lg border border-gray-100 transition-all"
                  title="Download"
                >
                  <Download
                    className="w-5 h-5"
                    style={{ color: BRAND_COLOR }}
                  />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="border-b border-gray-200 px-3 sm:px-6 pt-4 sm:pt-6">
                <div className="flex gap-2 overflow-x-auto -mx-3 sm:-mx-6 px-3 sm:px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 sm:px-4 py-3 font-medium text-sm sm:text-base transition-all whitespace-nowrap relative`}
                      style={{
                        color: activeTab === tab.id ? BRAND_COLOR : "#9ca3af",
                      }}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabContent
                      tabId={activeTab}
                      moodboard={currentMoodboard}
                      generationPhase={generationPhase}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 lg:sticky lg:top-32"
            >
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                Actions
              </h3>

              <div className="space-y-2 sm:space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEditModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold rounded-lg transition-all"
                  style={{ backgroundColor: BRAND_COLOR }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = BRAND_COLOR_DARK)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = BRAND_COLOR)
                  }
                >
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Edit Moodboard
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRegenerate}
                  disabled={loadingState === "generating"}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  New Variation
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDownload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download Image
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDownloadPDF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download PDF
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Design Style
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {currentMoodboard.style}
                </p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Room Type
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {currentMoodboard.roomType}
                </p>
              </div>

              {currentMoodboard.colorPalette?.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Color Palette
                  </p>
                  <div className="flex gap-2">
                    {currentMoodboard.colorPalette
                      .slice(0, 5)
                      .map((color, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-8 sm:h-10 rounded shadow border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name} - ${color.hex}`}
                        />
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {showImageModal && currentMoodboard?.compositeMoodboard?.url && (
        <ImageModal
          imageUrl={currentMoodboard.compositeMoodboard.url}
          onClose={() => setShowImageModal(false)}
          onDownload={onDownload}
        />
      )}

      {showEditModal && (
        <EditModal
          moodboard={currentMoodboard}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedMoodboard) => {
            setCurrentMoodboard(updatedMoodboard);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

{
  /* Edit Modal Component */
}
const EditModal = ({ moodboard, onClose, onSave }) => {
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = async () => {
    if (!editPrompt.trim()) {
      toast.error("Please describe the changes you want");
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(`/api/moodboards/${moodboard._id}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageIndex: 0,
          editPrompt: editPrompt.trim(),
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        toast.success("Moodboard edited successfully!");
        onSave(data.data.moodboard);
      } else {
        throw new Error(data.message || "Failed to edit moodboard");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(error.message || "Failed to edit moodboard");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Your Moodboard
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Describe Your Changes
          </label>
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder='Example: "Make it more minimalist", "Add more plants", "Use warmer tones", "Focus on natural materials"...'
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none resize-none h-40 text-gray-900 placeholder-gray-400"
            style={{
              borderColor: editPrompt.trim() ? BRAND_COLOR : "#e5e7eb",
            }}
          />
          <p className="text-xs text-gray-500 mt-2">
            Be specific about what you'd like to change
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isEditing}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={!editPrompt.trim() || isEditing}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition-all"
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})`,
            }}
          >
            {isEditing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                Editing...
              </>
            ) : (
              <>Apply Changes</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

{
  /* Cute Loading Indicator for Tabs */
}
const TabLoadingState = ({ tabName }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-6"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${BRAND_COLOR}20` }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8" style={{ color: BRAND_COLOR }} />
          </motion.div>
        </div>
      </motion.div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Generating {tabName} details
      </h3>
      <p className="text-sm text-gray-600 text-center mb-6">
        It usually takes 10–15 seconds to generate.
      </p>

      <div className="flex gap-2">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: delay,
            }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: BRAND_COLOR }}
          />
        ))}
      </div>
    </motion.div>
  );
};

{
  /* Tab Content Component */
}
const TabContent = ({ tabId, moodboard, generationPhase }) => {
  const narrative = moodboard.designNarrative;
  const colorPalette = moodboard.colorPalette || [];
  const moodDescription =
    moodboard.compositeMoodboard?.metadata?.moodDescription;

  // Check if the tab content is loading
  const isLoading = generationPhase === "descriptions";

  if (tabId === "overview") {
    if (
      isLoading &&
      !narrative?.narrative &&
      !moodDescription &&
      colorPalette.length === 0
    ) {
      return <TabLoadingState tabName="Overview" />;
    }

    return (
      <div className="space-y-6">
        {narrative?.narrative && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Design Narrative
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {narrative.narrative}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {narrative.vibe && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    The Vibe
                  </h4>
                  <p className="text-gray-700 text-sm">{narrative.vibe}</p>
                </div>
              )}
              {narrative.lifestyle && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Lifestyle Fit
                  </h4>
                  <p className="text-gray-700 text-sm">{narrative.lifestyle}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(moodDescription || colorPalette.length > 0) && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            {moodDescription && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {moodDescription.mood}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {moodDescription.feeling}
                </p>
                <p className="text-gray-700">{moodDescription.description}</p>
              </div>
            )}

            {colorPalette.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  Color Palette
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {colorPalette.map((color, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-full h-20 rounded-lg shadow-md border border-gray-200 mb-2 cursor-pointer hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} - ${color.hex}`}
                      />
                      <div className="text-xs font-medium text-gray-900">
                        {color.name}
                      </div>
                      <div className="text-xs text-gray-500">{color.hex}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isLoading &&
          (narrative?.narrative ||
            moodDescription ||
            colorPalette.length > 0) && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">Updating details...</p>
            </div>
          )}
      </div>
    );
  }

  if (tabId === "materials") {
    const hasContent =
      moodboard.materials &&
      Object.values(moodboard.materials).some(
        (items) => items && items.length > 0
      );

    if (isLoading && !hasContent) {
      return <TabLoadingState tabName="Materials" />;
    }

    return (
      <div className="space-y-4">
        {moodboard.materials ? (
          Object.entries(moodboard.materials).map(([key, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={key}>
                <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                  {key.replace("_", " ")}
                </h4>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="font-medium text-gray-900">
                        {item.type}
                      </div>
                      {item.finish && (
                        <div className="text-sm text-gray-600">
                          Finish: {item.finish}
                        </div>
                      )}
                      {item.texture && (
                        <div className="text-sm text-gray-600">
                          Texture: {item.texture}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : isLoading ? (
          <TabLoadingState />
        ) : (
          <p className="text-gray-500">No materials specified</p>
        )}
      </div>
    );
  }

  if (tabId === "furniture") {
    const hasContent = moodboard.furniture?.heroPieces?.length;

    if (isLoading && !hasContent) {
      return <TabLoadingState tabName="Furniture" />;
    }

    return (
      <div>
        {moodboard.furniture?.heroPieces?.length ? (
          <div className="space-y-3">
            {moodboard.furniture.heroPieces.map((piece, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <h4 className="font-semibold text-gray-900 mb-1">
                  {piece.name}
                </h4>
                <p className="text-sm text-gray-600 capitalize mb-2">
                  {piece.category}
                </p>
                {piece.dimensions && (
                  <div className="text-sm text-gray-700 font-mono">
                    {piece.dimensions.length} × {piece.dimensions.width} ×{" "}
                    {piece.dimensions.height} {piece.dimensions.unit || "cm"}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <TabLoadingState />
        ) : (
          <p className="text-gray-500">No furniture specified</p>
        )}
      </div>
    );
  }

  if (tabId === "lighting") {
    const hasContent =
      moodboard.lightingConcept?.dayMood ||
      moodboard.lightingConcept?.nightMood;

    if (isLoading && !hasContent) {
      return <TabLoadingState tabName="Lighting" />;
    }

    return (
      <div className="space-y-4">
        {moodboard.lightingConcept ? (
          <div className="grid md:grid-cols-2 gap-4">
            {moodboard.lightingConcept.dayMood && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Daytime</h3>
                <p className="text-sm text-gray-700">
                  {moodboard.lightingConcept.dayMood.description}
                </p>
              </div>
            )}
            {moodboard.lightingConcept.nightMood && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Nighttime</h3>
                <p className="text-sm text-gray-700">
                  {moodboard.lightingConcept.nightMood.description}
                </p>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <TabLoadingState />
        ) : (
          <p className="text-gray-500">No lighting concept specified</p>
        )}
      </div>
    );
  }

  if (tabId === "layout") {
    const hasContent = moodboard.zones?.length;

    if (isLoading && !hasContent) {
      return <TabLoadingState tabName="Layout" />;
    }

    return (
      <div className="grid md:grid-cols-2 gap-4">
        {moodboard.zones?.length ? (
          moodboard.zones.map((zone, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-3">{zone.name}</h3>
              <div className="space-y-2">
                {zone.purpose && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Purpose</div>
                    <div className="text-sm text-gray-700">{zone.purpose}</div>
                  </div>
                )}
                {zone.focalPoint && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Focal Point
                    </div>
                    <div className="text-sm text-gray-700">
                      {zone.focalPoint}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : isLoading ? (
          <TabLoadingState />
        ) : (
          <p className="text-gray-500">No layout zones specified</p>
        )}
      </div>
    );
  }

  return null;
};

{
  /* Loading Animation Component */
}
const LoadingAnimation = () => (
  <div className="flex flex-col items-center gap-6">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
      <div
        className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderTopColor: BRAND_COLOR }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles
          className="w-8 h-8 animate-pulse"
          style={{ color: BRAND_COLOR }}
        />
      </div>
    </div>
    <div className="flex gap-1">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ backgroundColor: BRAND_COLOR, animationDelay: `${delay}s` }}
        ></div>
      ))}
    </div>
  </div>
);

{
  /* Image Modal Component */
}
const ImageModal = ({ imageUrl, onClose, onDownload }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
    onClick={onClose}
  >
    {/* Background Blur */}
    <div 
      className="absolute inset-0 opacity-20 blur-3xl scale-110"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    />

    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8"
    >
      {/* Controls Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
          <h3 className="text-white font-bold text-lg hidden sm:block">Full Preview</h3>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all"
          >
            <Download className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold hidden sm:inline">Download Image</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 bg-white text-black rounded-full shadow-xl transition-all"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      <img
        src={imageUrl}
        alt="Full View"
        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all"
        style={{ boxShadow: `0 0 50px ${BRAND_COLOR}20` }}
      />
      
      {/* Bottom Info (Optional) */}
      <div className="mt-6 text-white/50 text-xs font-medium uppercase tracking-[0.2em]">
        Design by Manara AI
      </div>
    </motion.div>
  </motion.div>
);
