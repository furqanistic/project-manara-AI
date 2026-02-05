// File: project-manara-AI/client/src/components/Moodboard/ResultView.jsx
import { AnimatePresence, motion } from "framer-motion";
import {
    Download,
    Edit3,
    Maximize2,
    RefreshCw,
    X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Unified View Component
 * Renders all moodboard details in a single sequential flow.
 */
const UnifiedView = ({ moodboard, generationPhase }) => {
  const narrative = moodboard.designNarrative;
  const materials = moodboard.materials;
  const furniture = moodboard.furniture;
  const colorPalette = moodboard.colorPalette || [];
  const moodDescription = moodboard.compositeMoodboard?.metadata?.moodDescription;

  const isLoading = generationPhase === "descriptions";

  return (
    <div className="space-y-12">
      {/* 1. Design Narrative */}
      {(narrative?.narrative || moodDescription) && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h4 className="text-[10px] font-bold tracking-[0.4em] text-[#8d775e] uppercase">
              Design Philosophy
            </h4>
            <div className="flex-1 h-[1px] bg-gray-100 dark:bg-white/5"></div>
          </div>
          
          {narrative?.narrative && (
             <p className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed font-serif">
                "{narrative.narrative}"
             </p>
          )}

          {moodDescription && (
            <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
               <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{moodDescription.mood}</h5>
               <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">{moodDescription.feeling}</p>
               <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{moodDescription.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
             {narrative?.vibe && (
               <div className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-[#8d775e] uppercase tracking-widest block mb-2">Atmosphere</span>
                  <p className="text-sm text-gray-500">{narrative.vibe}</p>
               </div>
             )}
             {narrative?.lifestyle && (
               <div className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-[#8d775e] uppercase tracking-widest block mb-2">Lifestyle</span>
                  <p className="text-sm text-gray-500">{narrative.lifestyle}</p>
               </div>
             )}
          </div>
        </section>
      )}

      {/* 2. Chromatic Spectrum */}
      {colorPalette.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h4 className="text-[10px] font-bold tracking-[0.4em] text-[#8d775e] uppercase">
              Neural Color Map
            </h4>
            <div className="flex-1 h-[1px] bg-gray-100 dark:bg-white/5"></div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {colorPalette.map((color, idx) => (
              <div key={idx} className="space-y-2">
                <div 
                  className="h-16 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-[9px] font-bold text-gray-400 uppercase text-center">{color.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Materiality */}
      {materials && Object.values(materials).some(m => m?.length > 0) && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h4 className="text-[10px] font-bold tracking-[0.4em] text-[#8d775e] uppercase">
              Material Palette
            </h4>
            <div className="flex-1 h-[1px] bg-gray-100 dark:bg-white/5"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(materials).map(([key, items]) => 
              items?.map((item, idx) => (
                <div key={`${key}-${idx}`} className="p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                   <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">{item.type}</div>
                   <div className="flex gap-4">
                      {item.finish && <span className="text-[10px] text-gray-400 uppercase">Finish: <span className="text-gray-600 dark:text-gray-300">{item.finish}</span></span>}
                      {item.texture && <span className="text-[10px] text-gray-400 uppercase">Texture: <span className="text-gray-600 dark:text-gray-300">{item.texture}</span></span>}
                   </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* 4. Furniture Elements */}
      {furniture?.heroPieces?.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h4 className="text-[10px] font-bold tracking-[0.4em] text-[#8d775e] uppercase">
              Curated Furniture
            </h4>
            <div className="flex-1 h-[1px] bg-gray-100 dark:bg-white/5"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {furniture.heroPieces.map((piece, idx) => (
              <div key={idx} className="p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                <span className="text-[9px] font-bold text-[#8d775e] uppercase mb-1 block">{piece.category}</span>
                <h5 className="font-bold text-gray-900 dark:text-white">{piece.name}</h5>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading Placeholder */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
           <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-6 h-6 text-[#8d775e] animate-spin" />
              <p className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.2em]">Updating Synthesis...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export const ResultView = ({
  currentMoodboard,
  onRegenerate,
  onDownload,
  onBackToCreate,
  loadingState,
  generationPhase,
  showImageModal,
  setShowImageModal,
  showEditModal,
  setShowEditModal,
  setCurrentMoodboard,
}) => {
  if (!currentMoodboard?.compositeMoodboard?.url) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#faf8f6] dark:bg-[#0a0a0a]">
         <div className="relative w-24 h-24 mb-8">
            <motion.div
              className="absolute inset-0 rounded-full border-[1px] border-transparent border-t-[#8d775e]"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="/min-logo.png" alt="Manara" className="w-10 h-10 object-contain" />
            </motion.div>
         </div>
         <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Assembling vision...</p>
         <p className="text-sm font-medium text-gray-400">Coordinating neural mappings and architectural data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] transition-colors duration-500 pt-16 sm:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-10 border-b border-gray-100 dark:border-white/5"
        >
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-[1px] bg-[#8d775e]"></div>
              <span className="text-[10px] font-bold tracking-[0.5em] text-[#8d775e] uppercase">Project Report</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2 leading-none uppercase">
                {currentMoodboard.title}
            </h1>
            <p className="text-gray-400 font-medium italic font-serif">A {currentMoodboard.style} {currentMoodboard.roomType} synthesis.</p>
          </div>
          <button
            onClick={onBackToCreate}
            className="px-8 py-4 rounded-xl font-bold bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 hover:text-gray-900 transition-all shadow-sm"
          >
            New Creation
          </button>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Visual & Data */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl bg-white dark:bg-[#111]"
            >
              <img
                src={currentMoodboard.compositeMoodboard.url}
                alt="Moodboard"
                className="w-full h-auto block cursor-pointer hover:scale-[1.01] transition-transform duration-700"
                onClick={() => setShowImageModal(true)}
              />
              <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all z-20">
                <button onClick={() => setShowImageModal(true)} className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white hover:text-[#8d775e] transition-all flex items-center justify-center">
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button onClick={onDownload} className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white hover:text-[#8d775e] transition-all flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-8 sm:p-12 shadow-sm">
                <UnifiedView moodboard={currentMoodboard} generationPhase={generationPhase} />
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-8 lg:sticky lg:top-24 shadow-sm">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#8d775e] mb-8">Synthesis Operations</h3>
              <div className="space-y-4">
                <button onClick={() => setShowEditModal(true)} className="w-full py-4 bg-[#8d775e] text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#8d775e]/20">
                  <Edit3 className="w-5 h-5" /> Refine Architecture
                </button>
                <button onClick={onRegenerate} disabled={loadingState === "generating"} className="w-full py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3">
                  <RefreshCw className={`w-5 h-5 ${loadingState === "generating" ? "animate-spin" : ""}`} /> New Variant
                </button>
                <button onClick={onDownload} className="w-full py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3">
                  <Download className="w-5 h-5" /> Download Asset
                </button>
              </div>

              <div className="mt-12 space-y-6 pt-10 border-t border-gray-50 dark:border-white/5">
                 <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Architecture</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white capitalize">{currentMoodboard.style}</span>
                 </div>
                 <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Spatial Assignment</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white capitalize">{currentMoodboard.roomType}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showImageModal && (
          <ImageModal imageUrl={currentMoodboard.compositeMoodboard.url} onClose={() => setShowImageModal(false)} onDownload={onDownload} />
        )}
        {showEditModal && (
          <EditModal moodboard={currentMoodboard} onClose={() => setShowEditModal(false)} onSave={(u) => { setCurrentMoodboard(u); setShowEditModal(false); }} />
        )}
      </AnimatePresence>
    </div>
  );
};

const EditModal = ({ moodboard, onClose, onSave }) => {
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = async () => {
    if (!editPrompt.trim()) return toast.error("Description required");
    setIsEditing(true);
    try {
      const resp = await fetch(`/api/moodboards/${moodboard._id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIndex: 0, editPrompt: editPrompt.trim() }),
      });
      const data = await resp.json();
      if (data.status === "success") {
        toast.success("Regenerated!");
        onSave(data.data.moodboard);
      } else throw new Error("Failed");
    } catch (e) { toast.error(e.message); }
    finally { setIsEditing(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#111] rounded-[40px] p-10 max-w-xl w-full border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8d775e]/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white relative z-10">Refine <span className="text-[#8d775e] italic">Vision.</span></h2>
        <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} className="w-full h-40 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-[#8d775e]/20 mb-6 relative z-10 transition-all font-medium" placeholder="Describe adjustments..." />
        <div className="flex gap-4 relative z-10">
          <button onClick={onClose} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-900 transition-all">Cancel</button>
          <button onClick={handleEdit} disabled={isEditing || !editPrompt} className="flex-[2] py-4 bg-[#8d775e] text-white font-bold rounded-2xl disabled:opacity-50 shadow-lg shadow-[#8d775e]/20 flex items-center justify-center gap-3">
            {isEditing && <RefreshCw className="w-4 h-4 animate-spin" />}
            {isEditing ? "Synthesizing..." : "Apply Refinement"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ImageModal = ({ imageUrl, onClose, onDownload }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center p-4 sm:p-10" 
    onClick={onClose}
  >
    <motion.div 
       initial={{ scale: 0.95 }} 
       animate={{ scale: 1 }} 
       exit={{ scale: 0.95 }} 
       className="relative max-w-full max-h-full"
       onClick={e => e.stopPropagation()}
    >
        <img src={imageUrl} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/5" />
        <div className="absolute top-4 right-4 flex gap-3">
            <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black transition-all flex items-center justify-center"><Download className="w-5 h-5" /></button>
            <button onClick={onClose} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black transition-all flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>
    </motion.div>
  </motion.div>
);
