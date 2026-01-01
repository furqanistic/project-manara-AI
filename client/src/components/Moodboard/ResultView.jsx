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
      <div className="min-h-screen pt-32 pb-12 bg-[#faf8f6] dark:bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        {/* Cinematic Ambient Background */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute top-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-[#8d775e]/5 dark:bg-[#8d775e]/10 blur-[140px]' />
          <div className='absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none' 
               style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
        </div>

        <div className="max-w-md w-full mx-auto px-4 text-center relative z-10">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-[32px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#8d775e]/10"
          >
            <img src="/min-logo.png" alt="Manara" className="w-12 h-12 object-contain animate-pulse" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Assembling <span className="text-[#8d775e] font-serif italic">Vision.</span>
          </h2>
          <p className="text-gray-400 dark:text-gray-500 font-medium mb-8">
            Coordinating neural mappings and architectural data...
          </p>
          
          <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-4">
            <motion.div 
              className="h-full bg-[#8d775e]"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#8d775e] font-bold">
            Synchronizing
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
    <div className="min-h-screen pt-24 sm:pt-28 lg:pt-36 pb-24 bg-[#faf8f6] dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-12 border-b border-gray-100 dark:border-white/5"
        >
          <div className="min-w-0">
             <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-[1px] bg-[#8d775e]"></div>
              <span className="text-[10px] font-bold tracking-[0.5em] text-[#8d775e] uppercase">Synthesis Report</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-[0.9]">
              {currentMoodboard.title.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-[#8d775e] font-serif italic" : ""}>
                   {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-lg font-medium">
              Geospatial manifestation generated on{" "}
              <span className="text-gray-900 dark:text-white">
                {new Date(currentMoodboard.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
          <button
            onClick={onBackToCreate}
            className="px-10 py-5 rounded-2xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 transition-all whitespace-nowrap flex-shrink-0 shadow-lg shadow-black/5"
          >
            Initiate New Project
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative group rounded-[48px] overflow-hidden w-full bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 flex justify-center shadow-2xl shadow-[#8d775e]/10"
            >

              
              <img
                src={currentMoodboard.compositeMoodboard.url}
                alt="Moodboard"
                className="relative z-10 max-w-full h-auto block cursor-pointer hover:scale-[1.01] transition-transform duration-500"
                onClick={() => setShowImageModal(true)}
              />

              <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowImageModal(true)}
                  className="w-12 h-12 bg-white/10 dark:bg-white/10 backdrop-blur-xl hover:bg-white dark:hover:bg-white text-[#8d775e] rounded-2xl flex items-center justify-center transition-all shadow-xl"
                  title="Expansion View"
                >
                  <Maximize2 className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEditModal(true)}
                  className="w-12 h-12 bg-white/10 dark:bg-white/10 backdrop-blur-xl hover:bg-white dark:hover:bg-white text-[#8d775e] rounded-2xl flex items-center justify-center transition-all shadow-xl"
                  title="Refine Concepts"
                >
                  <Edit3 className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDownload}
                  className="w-12 h-12 bg-white/10 dark:bg-white/10 backdrop-blur-xl hover:bg-white dark:hover:bg-white text-[#8d775e] rounded-2xl flex items-center justify-center transition-all shadow-xl"
                  title="Extract Assets"
                >
                  <Download className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#111] rounded-[48px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/5"
            >
              <div className="border-b border-gray-50 dark:border-white/5 px-8 pt-8">
                <div className="flex gap-8 overflow-x-auto -mx-8 px-8 no-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-6 font-bold text-[10px] uppercase tracking-[0.3em] transition-all whitespace-nowrap relative`}
                      style={{
                        color: activeTab === tab.id ? "#8d775e" : "#9ca3af",
                      }}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8d775e]"
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

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#111] rounded-[40px] border border-gray-100 dark:border-white/5 p-8 lg:sticky lg:top-36 shadow-2xl shadow-black/5"
            >
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#8d775e] mb-8">
                Neural Operations
              </h3>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEditModal(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold text-white rounded-2xl transition-all shadow-xl shadow-[#8d775e]/20"
                  style={{ backgroundColor: "#8d775e" }}
                >
                  <Edit3 className="w-5 h-5" />
                  Refine Synthesis
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRegenerate}
                  disabled={loadingState === "generating"}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-2xl transition-all disabled:opacity-30"
                >
                  <RefreshCw className="w-5 h-5" />
                  New Variation
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDownload}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-2xl transition-all"
                >
                  <Download className="w-5 h-5" />
                  Extract PNG
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDownloadPDF}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-2xl transition-all"
                >
                  <FileText className="w-5 h-5" />
                  Export Specification
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-[#111] rounded-[32px] p-6 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                  Design Architecture
                </p>
                <p className="text-base font-bold text-gray-900 dark:text-white capitalize">
                  {currentMoodboard.style}
                </p>
              </div>

              <div className="bg-white dark:bg-[#111] rounded-[32px] p-6 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                  Spatial Designation
                </p>
                <p className="text-base font-bold text-gray-900 dark:text-white capitalize">
                  {currentMoodboard.roomType}
                </p>
              </div>

              {currentMoodboard.colorPalette?.length > 0 && (
                <div className="bg-white dark:bg-[#111] rounded-[32px] p-6 border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                    Neural Color Map
                  </p>
                  <div className="flex gap-2">
                    {currentMoodboard.colorPalette
                      .slice(0, 5)
                      .map((color, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-12 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm hover:scale-105 transition-transform cursor-crosshair"
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
        className="bg-white dark:bg-[#111] rounded-[48px] shadow-2xl max-w-2xl w-full p-10 border border-gray-100 dark:border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8d775e]/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Refine <span className="text-[#8d775e] font-serif italic">Concepts.</span>
            </h2>
            <p className="text-sm font-medium text-gray-400 mt-1">Direct the AI to adjust specific architectural elements.</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8 relative z-10">
          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#8d775e] mb-4">
            Directives & Adjustments
          </label>
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder='e.g. "Introduce more biophilic elements", "Shift towards a warmer wood palette", "Make the lighting more dramatic"...'
            className="w-full p-6 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#8d775e]/20 focus:border-[#8d775e] resize-none h-44 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-bold uppercase tracking-wider">
            Natural language descriptions work best for complex refinements.
          </p>
        </div>

        <div className="flex gap-4 relative z-10">
          <button
            onClick={onClose}
            disabled={isEditing}
            className="flex-1 px-8 py-4 rounded-[20px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/5 transition-all disabled:opacity-30"
          >
            Abort
          </button>
          <button
            onClick={handleEdit}
            disabled={!editPrompt.trim() || isEditing}
            className="flex-2 px-10 py-4 rounded-[20px] font-bold text-white shadow-xl shadow-[#8d775e]/20 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
            style={{
              background: `linear-gradient(135deg, #8d775e, #b8a58c)`,
            }}
          >
            {isEditing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
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

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
        Generating {tabName} details
      </h3>
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 text-center mb-8">
        Coordinating metadata for your architectural synthesis...
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
      <div className="space-y-8">
        {narrative?.narrative && (
          <div className="bg-gray-50 dark:bg-black/20 rounded-[32px] p-8 border border-gray-100 dark:border-white/5">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#8d775e] mb-6">
              Design Narrative
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-[1.8] mb-8 text-lg font-medium">
              {narrative.narrative}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {narrative.vibe && (
                <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                  <h4 className="text-[10px] font-bold tracking-widest text-[#8d775e] uppercase mb-3">
                    Atmosphere
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{narrative.vibe}</p>
                </div>
              )}
              {narrative.lifestyle && (
                <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                  <h4 className="text-[10px] font-bold tracking-widest text-[#8d775e] uppercase mb-3">
                    Occupancy Narrative
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{narrative.lifestyle}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(moodDescription || colorPalette.length > 0) && (
          <div className="bg-gray-50 dark:bg-black/20 rounded-[32px] p-8 border border-gray-100 dark:border-white/5">
            {moodDescription && (
              <div className="mb-10 pb-10 border-b border-gray-100 dark:border-white/5">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {moodDescription.mood}
                </h3>
                <p className="text-sm font-bold text-[#8d775e] uppercase tracking-widest mb-6">
                  {moodDescription.feeling}
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{moodDescription.description}</p>
              </div>
            )}

            {colorPalette.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#8d775e] mb-6">
                  Chromatic Spectrum
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {colorPalette.map((color, index) => (
                    <div key={index} className="text-center group">
                      <div
                        className="w-full h-24 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 mb-3 cursor-crosshair group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} - ${color.hex}`}
                      />
                      <div className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        {color.name}
                      </div>
                      <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{color.hex}</div>
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
      <div className="space-y-12">
        {moodboard.materials ? (
          Object.entries(moodboard.materials).map(([key, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={key}>
                <div className="flex items-center gap-4 mb-6">
                  <h4 className="text-[10px] font-bold tracking-[0.4em] text-[#8d775e] uppercase">
                    {key.replace("_", " ")}
                  </h4>
                  <div className="flex-1 h-[1px] bg-gray-100 dark:bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-black/20 rounded-3xl p-6 border border-gray-100 dark:border-white/5 hover:border-[#8d775e]/20 transition-all group"
                    >
                      <div className="font-bold text-gray-900 dark:text-white text-lg mb-4">
                        {item.type}
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {item.finish && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Finish</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.finish}</span>
                          </div>
                        )}
                        {item.texture && (
                          <div className="flex flex-col gap-1">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Texture</span>
                             <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.texture}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : isLoading ? (
          <TabLoadingState />
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">No material metadata synchronization found.</p>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moodboard.furniture.heroPieces.map((piece, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-black/20 rounded-3xl p-8 border border-gray-100 dark:border-white/5 hover:border-[#8d775e]/20 transition-all"
              >
                <div className="flex flex-col gap-4">
                  <div className="p-3 bg-white dark:bg-black/40 rounded-xl w-fit">
                    <span className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.2em]">{piece.category}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xl mb-2">
                      {piece.name}
                    </h4>
                    {piece.dimensions && (
                      <div className="flex items-center gap-3 text-gray-400 font-mono text-xs">
                        <Maximize2 className="w-3 h-3" />
                        <span>{piece.dimensions.length} × {piece.dimensions.width} × {piece.dimensions.height} {piece.dimensions.unit || "cm"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <TabLoadingState />
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">Artifact metadata not found.</p>
          </div>
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
      <div className="space-y-6">
        {moodboard.lightingConcept ? (
          <div className="grid md:grid-cols-2 gap-6">
            {moodboard.lightingConcept.dayMood && (
              <div className="bg-gray-50 dark:bg-black/20 rounded-[32px] p-8 border border-gray-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <RefreshCw className="w-4 h-4" />
                   </div>
                   <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Diurnal Sequence</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {moodboard.lightingConcept.dayMood.description}
                </p>
              </div>
            )}
            {moodboard.lightingConcept.nightMood && (
              <div className="bg-gray-50 dark:bg-black/20 rounded-[32px] p-8 border border-gray-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <RefreshCw className="w-4 h-4" />
                   </div>
                   <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Nocturnal Sequence</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {moodboard.lightingConcept.nightMood.description}
                </p>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <TabLoadingState />
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">Luminous parameters not synchronized.</p>
          </div>
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
      <div className="grid md:grid-cols-2 gap-6">
        {moodboard.zones?.length ? (
          moodboard.zones.map((zone, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-black/20 rounded-[32px] p-8 border border-gray-100 dark:border-white/5 space-y-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{zone.name}</h3>
              <div className="space-y-6">
                {zone.purpose && (
                  <div>
                    <div className="text-[10px] font-bold text-[#8d775e] uppercase tracking-widest mb-2">Primary Intention</div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{zone.purpose}</div>
                  </div>
                )}
                {zone.focalPoint && (
                  <div>
                    <div className="text-[10px] font-bold text-[#8d775e] uppercase tracking-widest mb-2">
                      Focal Convergence
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
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
          <div className="py-20 text-center col-span-2">
            <p className="text-gray-400 font-medium">Spatial zoning data not found.</p>
          </div>
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
  <div className="flex flex-col items-center gap-12 py-12">
    <div className="relative w-24 h-24">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-[1px] border-transparent border-t-[#8d775e]"
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Middle rotating ring */}
      <motion.div
        className="absolute inset-4 rounded-full border-[1px] border-transparent border-b-[#8d775e]/30"
        animate={{ rotate: -360 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Inner logo pulsing */}
      <motion.div 
        className="absolute inset-6 flex items-center justify-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src="/min-logo.png" alt="Manara" className="w-10 h-10 object-contain" />
      </motion.div>
    </div>
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
          style={{ backgroundColor: "#8d775e" }}
        />
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
