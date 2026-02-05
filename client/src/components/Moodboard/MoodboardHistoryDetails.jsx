// File: project-manara-AI/client/src/components/Moodboard/MoodboardHistoryDetails.jsx
import TopBar from "@/components/Layout/Topbar";
import { getMoodboardById } from "@/services/moodboardService";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Download,
  Lightbulb,
  Map,
  Maximize2,
  Package,
  Palette,
  Share2,
  Sofa,
  Sparkles,
  TextIcon,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BeautifulLoader from "./BeautifulLoader";

const useProgressTracking = (moodboardId, onProgress, setStatus) => {
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
      onProgress([]);
      if (setStatus) setStatus("completed");
    });

    eventSource.addEventListener("error", () => {
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [moodboardId, onProgress, setStatus]);
};

const STATUS_COLORS = {
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  image_generated: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  generating: "bg-[#8d775e]/10 text-[#8d775e] border-[#8d775e]/20",
  draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  failed: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export const MoodboardHistoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [moodboard, setMoodboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [progressSteps, setProgressSteps] = useState([]);

  useProgressTracking(
    moodboard?.status === "generating" || moodboard?.status === "image_generated"
      ? id
      : null,
    setProgressSteps,
    (newStatus) => {
      if (newStatus === "completed") {
        fetchMoodboardDetails();
      }
    }
  );

  useEffect(() => {
    fetchMoodboardDetails();
    let interval;
    if (moodboard?.status === "generating") {
      interval = setInterval(fetchMoodboardDetails, 5000);
    }
    return () => clearInterval(interval);
  }, [id, moodboard?.status]);

  const fetchMoodboardDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getMoodboardById(id);
      let moodboardData =
        response.data?.moodboard || response.moodboard || response;

      if (moodboardData._id) {
        setMoodboard({
          ...moodboardData,
          status: moodboardData.status || "draft",
          title: moodboardData.title || "Untitled Moodboard",
          style: moodboardData.style || "Not specified",
          roomType: moodboardData.roomType || "Not specified",
          createdAt: moodboardData.createdAt || new Date().toISOString(),
          updatedAt: moodboardData.updatedAt || new Date().toISOString(),
        });
      } else {
        setError("Invalid moodboard data received");
      }
    } catch (err) {
      setError(err.message || "Failed to load moodboard details");
      toast.error("Failed to load moodboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl, imageName) => {
    try {
      if (!imageUrl) return;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = imageName || "moodboard-image.png";
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("Design cataloged and downloaded.");
    } catch (error) {
       // Support direct base64 download if fetch fails due to CORS
       if (imageUrl.startsWith('data:')) {
            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = imageName || "moodboard-image.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Design cataloged and downloaded.");
            return;
       }
      console.error("Download error:", error);
      toast.error("Failed to download visualization.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Manifestation link copied to clipboard.");
  };

  if (isLoading && !moodboard) {
    return (
      <div className="min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-8 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-2xl"
        >
          <img src="/min-logo.png" alt="Logo" className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center tracking-tight">Reconstructing Vision</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center font-medium">Accessing your neural architectural records...</p>
        <div className="w-48 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-4 mx-auto">
          <motion.div
            className="h-full bg-[#8d775e]"
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (error || !moodboard) {
    return (
       <div className="min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white dark:bg-[#111] rounded-[40px] p-10 max-w-md w-full border border-gray-100 dark:border-white/5 text-center shadow-2xl"
        >
           <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center">
                 <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
           </div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Access Denied</h2>
           <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed">{error || "We couldn't retrieve the design manifestation from our records."}</p>
           <button
              onClick={() => navigate("/moodboard")}
              className="w-full px-8 py-4 rounded-2xl font-bold text-white bg-[#8d775e] shadow-xl shadow-[#8d775e]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
           >
              Return to Studio
           </button>
        </motion.div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] selection:bg-[#8d775e]/10 relative">
      <div className="hidden lg:block">
        <TopBar />
      </div>
      
      {moodboard.status === "generating" && (
        <BeautifulLoader
          progressSteps={progressSteps}
          phase={moodboard.compositeMoodboard?.url ? "descriptions" : "image"}
        />
      )}

      {/* Cinematic Background Elements (Desktop Only) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden lg:block">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8d775e]/5 rounded-full blur-[120px] dark:bg-[#8d775e]/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8d775e]/5 rounded-full blur-[120px] dark:bg-[#8d775e]/10" />
      </div>

       {/* Mobile Header (Non-bleeding) */}
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50 flex items-center justify-between p-3 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
          <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white active:scale-95 transition-transform"
          >
              <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest truncate max-w-[200px]">{moodboard.title}</span>
          <div className="w-10" />
      </div>

      <div className="lg:hidden w-full bg-white dark:bg-[#111]">
            <div className="relative aspect-square w-full overflow-hidden border-b border-gray-100 dark:border-white/5">
                {moodboard.compositeMoodboard?.url ? (
                    <img 
                        src={moodboard.compositeMoodboard.url} 
                        alt={moodboard.title}
                        className="w-full h-full object-cover cursor-zoom-in active:scale-95 transition-transform"
                        onClick={() => setSelectedImage(moodboard.compositeMoodboard?.url)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-[#8d775e]/40" />
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                <div className="absolute inset-0 border border-gray-200/40 dark:border-white/10 pointer-events-none" />
            </div>

            {/* In-page Mobile Actions */}
            <div className="grid grid-cols-2 gap-3 p-4">
                <button
                    onClick={() => handleDownload(moodboard.compositeMoodboard?.url, `${moodboard.title}.png`)}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-[#8d775e] bg-[#8d775e]/5 border border-[#8d775e]/20 active:scale-95 transition-transform"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
                <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 active:scale-95 transition-transform"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
            </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto lg:px-6 lg:pt-20 pb-32 lg:pb-24 z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16  items-start">
          
          {/* Left Column: Image, Actions, Meta (Sticky - Desktop Only) */}
          <div className="lg:col-span-4 lg:space-y-6 lg:sticky lg:top-12 hidden lg:block h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-2">
             {/* Main Image Card */}
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
               className="relative aspect-square bg-white dark:bg-[#111] rounded-[32px] overflow-hidden border border-gray-200/60 dark:border-white/10 shadow-xl group"
             >
               {moodboard.compositeMoodboard?.url ? (
                 <>
                   <img
                     src={moodboard.compositeMoodboard.url}
                     alt={moodboard.title}
                     className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                     onClick={() => setSelectedImage(moodboard.compositeMoodboard.url)}
                   />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                   
                 </>
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-[24px] bg-gray-50 dark:bg-white/5 flex items-center justify-center animate-pulse">
                       <Sparkles className="w-8 h-8 text-[#8d775e]" />
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest">Synthesizing...</p>
                 </div>
               )}
             </motion.div>

             {/* Actions */}
             <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDownload(moodboard.compositeMoodboard?.url, `${moodboard.title}.png`)}
                  className="flex flex-row items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white bg-[#8d775e] hover:bg-[#7a6650] transition-all shadow-lg shadow-[#8d775e]/20"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex flex-row items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
             </div>

             {/* Meta Data */}
             <div className="bg-white dark:bg-[#111] rounded-[24px] p-5 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-2">
                       {moodboard.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                       <span className={`px-2 py-0.5 rounded-md ${STATUS_COLORS[moodboard.status] || STATUS_COLORS.draft} uppercase text-[10px] font-bold tracking-wider`}>
                          {moodboard.status?.replace(/_/g, " ")}
                       </span>
                       <span>•</span>
                       <span>{formatDate(moodboard.createdAt)}</span>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <DetailRow label="Style" value={moodboard.style} icon={Palette} />
                    <DetailRow label="Space" value={moodboard.roomType} icon={Map} />
                 </div>

                 {moodboard.colorPalette?.length > 0 && (
                    <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                       <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-4">Palette</h4>
                       <div className="flex gap-2">
                          {moodboard.colorPalette.slice(0, 5).map((color, idx) => (
                             <div 
                                key={idx}
                                className="h-8 flex-1 rounded-lg border border-gray-100 dark:border-white/10"
                                style={{ backgroundColor: color.hex }}
                                title={color.hex}
                             />
                          ))}
                       </div>
                    </div>
                 )}
             </div>

          </div>

          {/* Right Column (Desktop) / Main Content (Mobile) */}
          <div className="lg:col-span-8 lg:space-y-16 lg:pb-24 p-6 lg:p-0">
             
             {/* Mobile Header Data */}
             <div className="lg:hidden space-y-6 mb-10">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
                       {moodboard.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                       <span className={`px-2 py-0.5 rounded-md ${STATUS_COLORS[moodboard.status] || STATUS_COLORS.draft} uppercase text-[10px] font-bold tracking-wider`}>
                          {moodboard.status?.replace(/_/g, " ")}
                       </span>
                       <span>•</span>
                       <span>{formatDate(moodboard.createdAt)}</span>
                    </div>
                 </div>
                 
                 <div className="flex gap-2 pb-6 border-b border-gray-200 dark:border-white/5 overflow-x-auto no-scrollbar">
                    {moodboard.roomType && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5 whitespace-nowrap">
                            <Map className="w-3 h-3 text-[#8d775e]" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{moodboard.roomType}</span>
                        </div>
                    )}
                    {moodboard.style && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5 whitespace-nowrap">
                            <Palette className="w-3 h-3 text-[#8d775e]" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{moodboard.style}</span>
                        </div>
                    )}
                 </div>
             </div>

             <div className="space-y-12 lg:space-y-16">
                 {/* 1. Overview Section */}
                 <Section title="Design Narrative" icon={TextIcon}>
                    {moodboard.designNarrative?.narrative ? (
                      <OverviewSection moodboard={moodboard} />
                    ) : (
                      <LoadingSection />
                    )}
                 </Section>

                 {/* 2. Materials Section */}
                 <Section title="Material & Textures" icon={Package}>
                    {moodboard.materials ? (
                      <MaterialsSection materials={moodboard.materials} />
                    ) : (
                      <LoadingSection />
                    )}
                 </Section>

                 {/* 3. Furniture Section */}
                 <Section title="Furniture Selection" icon={Sofa}>
                    {moodboard.furniture?.heroPieces?.length > 0 ? (
                      <FurnitureSection furniture={moodboard.furniture} />
                    ) : (
                      <LoadingSection />
                    )}
                 </Section>

                 {/* Lighting and Layout sections removed (not generated) */}
             </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 z-40 safe-area-bottom">
           <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white active:scale-95 transition-transform"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => handleDownload(moodboard.compositeMoodboard?.url, `${moodboard.title}.png`)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white bg-[#8d775e] shadow-lg shadow-[#8d775e]/20 active:scale-95 transition-transform"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
           </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
         {selectedImage && (
            <ImageModal 
                imageUrl={selectedImage} 
                title={moodboard.title} 
                onClose={() => setSelectedImage(null)} 
                onDownload={handleDownload} 
            />
         )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// SMALL COMPONENTS
// ============================================================================

const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-6 lg:space-y-8">
        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4 lg:pb-6">
            <div className="w-10 h-10 rounded-xl bg-[#8d775e]/10 flex items-center justify-center text-[#8d775e]">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
        </div>
        {children}
    </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-white/5 last:border-none group">
    <div className="flex items-center gap-3">
       <div className="w-6 h-6 rounded-md bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
          <Icon className="w-3 h-3" />
       </div>
       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-xs font-bold text-gray-900 dark:text-white capitalize">{value?.replace(/_/g, " ")}</span>
  </div>
);

const ImageModal = ({ imageUrl, title, onClose, onDownload }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-6 backdrop-blur-xl"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center gap-8"
    >
      <button 
        onClick={onClose} 
        className="absolute top-0 right-0 p-4 text-white/40 hover:text-white transition-all transform hover:rotate-90"
      >
        <X className="w-10 h-10" />
      </button>
      
      <div className="relative group max-w-full max-h-[75vh] 
rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
         <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
      </div>

      <div className="flex flex-col items-center gap-4">
          <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
          <button
            onClick={() => onDownload(imageUrl, `${title}.png`)}
            className="px-10 py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#8d775e] hover:text-white transition-all transform active:scale-95 shadow-2xl"
          >
            Download Manifestation
          </button>
      </div>
    </motion.div>
  </motion.div>
);

// ============================================================================
// CONTENT SECTIONS (Previously Tabs)
// ============================================================================

const OverviewSection = ({ moodboard }) => {
  const narrative = moodboard.designNarrative;
  if (!narrative?.narrative) return <EmptyState />;

  return (
    <div className="space-y-8 lg:space-y-10">
      <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium font-['Poppins']">
        {narrative.narrative}
      </p>

      {narrative.keyFeatures?.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {narrative.keyFeatures.map((feature, i) => (
              <div 
                key={i} 
                className="space-y-2 p-5 lg:p-6 bg-white lg:bg-gray-50/50 dark:bg-white/5 rounded-[24px] border border-gray-100 dark:border-white/5"
              >
                 <span className="text-[9px] font-bold text-[#8d775e] uppercase tracking-[0.25em]">Feature {i+1}</span>
                 <h4 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{typeof feature === 'string' ? feature : feature.title}</h4>
                 <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{typeof feature === 'object' && feature.description}</p>
              </div>
            ))}
         </div>
      )}
    </div>
  );
};

const MaterialsSection = ({ materials }) => {
  if (!materials) return <EmptyState message="No material details available." />;
  const categories = Object.entries(materials).filter(([_, items]) => items?.length > 0);
  if (categories.length === 0) return <EmptyState message="No material details available." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {categories.map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] pl-1">{category.replace('_', ' ')}</h4>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div 
                key={idx}
                className="p-5 bg-white dark:bg-white/5 rounded-[20px] border border-gray-100 dark:border-white/5 shadow-sm hover:border-[#8d775e]/30 transition-all"
              >
                <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.name || item.type}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.finish || item.description}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const FurnitureSection = ({ furniture }) => {
  const pieces = Array.isArray(furniture?.heroPieces) ? furniture.heroPieces : [];
  if (pieces.length === 0) return <EmptyState message="No furniture details available." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
      {pieces.map((piece, idx) => (
          <div 
            key={idx}
            className="flex gap-4 lg:gap-5 p-5 lg:p-6 bg-white dark:bg-white/5 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm"
          >
            <div className="shrink-0 w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-[16px] flex items-center justify-center text-[#8d775e]">
               <Sofa className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[9px] font-bold text-[#8d775e] uppercase tracking-[0.2em] mb-1 block">{piece?.category || "Furniture"}</span>
                <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{piece?.name || "Unnamed Piece"}</h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{piece?.description}</p>
            </div>
          </div>
      ))}
    </div>
  );
};

// Components removed: LightingSection & LayoutSection (not generated anymore)

const LoadingSection = () => (
  <div className="py-12 flex flex-col items-center justify-center gap-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 rounded-full border-4 border-[#8d775e]/20 border-t-[#8d775e]"
    />
    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Generating...</p>
  </div>
);

const EmptyState = ({ message = "No associated data found." }) => (
  <div className="py-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[24px] flex items-center justify-center">
    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">{message}</p>
  </div>
);

export default MoodboardHistoryDetails;
