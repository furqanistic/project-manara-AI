// File: project-manara-AI/client/src/components/Moodboard/MoodboardHistoryDetails.jsx
import TopBar from "@/components/Layout/Topbar";
import { getMoodboardById } from "@/services/moodboardService";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
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
import { BRAND_COLOR } from "./Moodboardconfig";

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
  generating: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  failed: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const TABS = [
  { id: "overview", label: "Overview", icon: TextIcon },
  { id: "materials", label: "Materials", icon: Package },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "lighting", label: "Lighting", icon: Lightbulb },
  { id: "layout", label: "Layout", icon: Map },
];

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
  const [activeTab, setActiveTab] = useState("overview");
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
    <div className="min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] selection:bg-[#8d775e]/10">
      <TopBar />
      
      {moodboard.status === "generating" && (
        <BeautifulLoader
          progressSteps={progressSteps}
          phase={moodboard.compositeMoodboard?.url ? "descriptions" : "image"}
        />
      )}

      {/* Cinematic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8d775e]/5 rounded-full blur-[120px] dark:bg-[#8d775e]/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8d775e]/5 rounded-full blur-[120px] dark:bg-[#8d775e]/10" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Architectural Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div className="space-y-6">
            <button
               onClick={() => navigate(-1)}
               className="group flex items-center gap-3 text-[10px] font-bold text-gray-400 hover:text-[#8d775e] transition-all uppercase tracking-[0.2em]"
            >
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               Back to Synthesis Archive
            </button>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                  <span className={`px-3 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border backdrop-blur-md ${STATUS_COLORS[moodboard.status] || STATUS_COLORS.draft}`}>
                    {moodboard.status?.replace(/_/g, " ")}
                  </span>
                  <div className="h-px w-8 bg-gray-200 dark:bg-white/10" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Record ID: {moodboard._id.slice(-6).toUpperCase()}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
                {moodboard.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                   <Palette className="w-4 h-4 text-[#8d775e]" />
                   <span className="text-sm font-semibold">{moodboard.style}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/10" />
                <div className="flex items-center gap-2">
                   <Map className="w-4 h-4 text-[#8d775e]" />
                   <span className="text-sm font-semibold capitalize">{moodboard.roomType?.replace(/_/g, " ")} Design</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm"
              >
                <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Share
              </button>
              <button
                onClick={() => handleDownload(moodboard.compositeMoodboard?.url, `${moodboard.title}.png`)}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-white bg-[#8d775e] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#8d775e]/20"
              >
                <Download className="w-4 h-4" />
                Download Visualization
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Side: Neural Workspace */}
          <div className="lg:col-span-8 space-y-10">
            {/* Main Manifestation Canvas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square bg-white dark:bg-[#111] rounded-[48px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group"
            >
              {moodboard.compositeMoodboard?.url ? (
                <>
                  <img
                    src={moodboard.compositeMoodboard.url}
                    alt={moodboard.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <button
                    onClick={() => setSelectedImage(moodboard.compositeMoodboard.url)}
                    className="absolute top-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
                  >
                    <Maximize2 className="w-6 h-6" />
                  </button>

                  <div className="absolute bottom-8 left-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                     <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                        <p className="text-white/80 text-sm font-medium leading-relaxed italic line-clamp-2">
                           "{moodboard.moodSummary || 'Neural architectural synthesis complete. All spatial parameters verified.'}"
                        </p>
                     </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                   <div className="w-20 h-20 rounded-[32px] bg-gray-50 dark:bg-white/5 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-10 h-10 text-[#8d775e]" />
                   </div>
                   <p className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">Synthesizing Visualization...</p>
                </div>
              )}
            </motion.div>

            {/* Neural Sub-Archives */}
            {moodboard.roomImages?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {moodboard.roomImages.map((image, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="relative aspect-square rounded-[36px] overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 group cursor-pointer shadow-lg"
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={`Archival Record ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.2s]"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                          <Maximize2 className="w-5 h-5" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Design Specification */}
          <div className="lg:col-span-4 space-y-8">
             <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#111] rounded-[40px] p-8 border border-gray-100 dark:border-white/5 shadow-xl space-y-10 relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8d775e]/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                
                <div className="relative space-y-10">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em]">Manifest Parameters</h4>
                      <div className="space-y-1">
                         <DetailRow label="Design Style" value={moodboard.style} icon={Palette} />
                         <DetailRow label="Spatial Function" value={moodboard.roomType?.replace(/_/g, " ")} icon={Map} />
                         <DetailRow label="Synthesized On" value={formatDate(moodboard.createdAt)} icon={Calendar} />
                      </div>
                   </div>

                   {moodboard.moodSummary && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em]">Atmospheric Tone</h4>
                        <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100/50 dark:border-white/5">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                              "{moodboard.moodSummary}"
                            </p>
                        </div>
                      </div>
                   )}

                   {moodboard.colorPalette?.length > 0 && (
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em]">Chromatic DNA</h4>
                         <div className="flex gap-3">
                            {moodboard.colorPalette.slice(0, 5).map((color, idx) => (
                               <div 
                                  key={idx}
                                  className="group relative flex-1 aspect-[1/2] rounded-2xl border border-gray-100 dark:border-white/10 shadow-md transition-all hover:scale-105"
                                  style={{ backgroundColor: color.hex }}
                               >
                                  <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">{color.hex}</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             </motion.div>

             <div className="bg-[#8d775e] rounded-[40px] p-8 text-white shadow-2xl shadow-[#8d775e]/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-[2s]" />
                <div className="relative space-y-4">
                   <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.25em]">Synthesis Logic</h4>
                   <p className="text-lg font-bold leading-tight">Neural generation based on {moodboard.style} parameters within a {moodboard.roomType} context.</p>
                   <div className="pt-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                         <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">Architectural Intelligence</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Deep Synthesis Data (Tabs) */}
        <div className="mt-24">
           <div className="bg-white dark:bg-[#111] rounded-[48px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl">
              <div className="flex px-4 sm:px-10 border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar bg-gray-50/50 dark:bg-black/20">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-6 sm:px-8 py-6 transition-all relative whitespace-nowrap group cursor-pointer`}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#8d775e]" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`} />
                      <span className={`text-xs font-bold uppercase tracking-[0.15em] transition-colors ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-[#8d775e] shadow-[0_0_15px_rgba(141,119,94,0.5)]" 
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-8 sm:p-16">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {activeTab === "overview" && <OverviewTab moodboard={moodboard} />}
                      {activeTab === "materials" && <MaterialsTab materials={moodboard.materials} />}
                      {activeTab === "furniture" && <FurnitureTab furniture={moodboard.furniture} />}
                      {activeTab === "lighting" && <LightingTab lightingConcept={moodboard.lightingConcept} />}
                      {activeTab === "layout" && <LayoutTab zones={moodboard.zones} />}
                    </motion.div>
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>

      {/* Neural Overlays */}
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

      {moodboard?.status === "image_generated" && activeTab !== "overview" && (
        <TabLoadingState tabName={activeTab} />
      )}
    </div>
  );
};

// ============================================================================
// MODAL & SMALL COMPONENTS
// ============================================================================

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5 last:border-none group">
    <div className="flex items-center gap-3">
       <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#8d775e] group-hover:bg-[#8d775e]/10 transition-all">
          <Icon className="w-4 h-4" />
       </div>
       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{value?.replace(/_/g, " ")}</span>
  </div>
);

const TabLoadingState = ({ tabName }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed bottom-12 right-12 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-[32px] p-6 border border-gray-100 dark:border-white/10 shadow-2xl flex items-center gap-6 z-[40]"
  >
    <div className="relative">
       <div className="w-14 h-14 rounded-2xl border-2 border-[#8d775e]/20 border-t-[#8d775e] animate-spin" />
       <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#8d775e]" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em]">Deciphering {tabName}</h4>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Extracting neural design metadata...</p>
    </div>
  </motion.div>
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
      
      <div className="relative group max-w-full max-h-[75vh] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
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

// ============ Tab Sub-Components ============
const OverviewTab = ({ moodboard }) => {
  const narrative = moodboard.designNarrative;
  if (!narrative?.narrative) return <EmptyState message="Synthesizing design narrative..." />;

  return (
    <div className="space-y-16 max-w-5xl">
      <section className="space-y-8">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-[#8d775e]/10 flex items-center justify-center text-[#8d775e]">
              <TextIcon className="w-5 h-5" />
           </div>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">The Vision Narrative</h3>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium font-['Poppins']">
          {narrative.narrative}
        </p>
      </section>

      {narrative.keyFeatures?.length > 0 && (
        <section className="space-y-10 pt-16 border-t border-gray-100 dark:border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {narrative.keyFeatures.map((feature, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-3 p-8 bg-gray-50/50 dark:bg-white/5 rounded-[32px] border border-gray-100/50 dark:border-white/5"
                >
                   <span className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.25em]">Dimension {i+1}</span>
                   <h4 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{typeof feature === 'string' ? feature : feature.title}</h4>
                   <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{typeof feature === 'object' && feature.description}</p>
                </motion.div>
              ))}
           </div>
        </section>
      )}
    </div>
  );
};

const MaterialsTab = ({ materials }) => {
  if (!materials) return <EmptyState message="Selecting material essence..." />;
  const categories = Object.entries(materials).filter(([_, items]) => items?.length > 0);
  if (categories.length === 0) return <EmptyState message="Cataloging material DNA..." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {categories.map(([category, items], catIdx) => (
        <div key={category} className="space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-[#8d775e] rounded-full" />
             <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">{category.replace('_', ' ')}</h4>
          </div>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                className="p-6 bg-white dark:bg-white/5 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm hover:border-[#8d775e]/30 transition-all group"
              >
                <div className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-[#8d775e] transition-colors">{item.name || item.type}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-4 leading-relaxed">{item.finish || item.description}</div>
                {item.application && (
                   <div className="inline-flex px-3 py-1 bg-[#8d775e]/10 rounded-lg text-[9px] font-bold text-[#8d775e] uppercase tracking-widest">{item.application}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const FurnitureTab = ({ furniture }) => {
  const pieces = Array.isArray(furniture?.heroPieces) ? furniture.heroPieces : [];
  if (pieces.length === 0) return <EmptyState message="Curating bespoke pieces..." />;

  const formatDimensions = (dim) => {
    if (!dim) return "";
    if (typeof dim === "string") return dim;
    if (typeof dim === "object") {
      const { length, width, height, unit } = dim;
      const parts = [length, width, height].filter(Boolean);
      if (parts.length === 0) return "";
      return `${parts.join(" x ")} ${unit || ""}`.trim();
    }
    return "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {pieces.map((piece, idx) => {
        const dimensions = formatDimensions(piece?.dimensions);
        return (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 space-y-6 shadow-sm group hover:border-[#8d775e]/30 transition-all flex flex-col h-full"
          >
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-[24px] flex items-center justify-center text-[#8d775e] group-hover:scale-110 transition-transform duration-500">
               <Sofa className="w-8 h-8" />
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <span className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.25em] mb-2 block">{piece?.category || "Furniture"}</span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">{piece?.name || "Unnamed Piece"}</h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{piece?.description || "No description available."}</p>
            </div>
            {(piece?.material || dimensions) && (
              <div className="pt-6 flex flex-wrap gap-4 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] border-t border-gray-100 dark:border-white/5">
                 {piece.material && (
                   <span className="truncate max-w-[150px]">{typeof piece.material === 'object' ? piece.material.name : piece.material}</span>
                 )}
                 {piece.material && dimensions && <span className="text-[#8d775e]">•</span>}
                 {dimensions && <span className="truncate">{dimensions}</span>}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const LightingTab = ({ lightingConcept }) => {
  if (!lightingConcept) return <EmptyState message="Designing photonic logic..." />;

  const renderValue = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.description || val.name || JSON.stringify(val);
    return null;
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {['dayMood', 'nightMood'].map((mood) => {
          const content = renderValue(lightingConcept[mood]);
          if (!content) return null;
          
          return (
             <motion.div 
               key={mood}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className={`p-12 rounded-[48px] border relative overflow-hidden group ${
                 mood === 'dayMood' 
                   ? 'bg-amber-500/5 border-amber-500/10' 
                   : 'bg-indigo-950/20 border-indigo-900/20'
               }`}
             >
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-transform duration-[3s] group-hover:scale-150 ${
                   mood === 'dayMood' ? 'bg-amber-400' : 'bg-indigo-400'
                }`} />
                
                <div className="relative space-y-6">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                         mood === 'dayMood' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                         <Lightbulb className="w-6 h-6" />
                      </div>
                      <h4 className={`text-xs font-bold uppercase tracking-[0.25em] ${mood === 'dayMood' ? 'text-amber-600' : 'text-indigo-300'}`}>
                         {mood === 'dayMood' ? 'Daylight Strategy' : 'Luminance Post-Dusk'}
                      </h4>
                   </div>
                   <p className={`text-lg font-medium leading-relaxed ${mood === 'dayMood' ? 'text-amber-900/70 dark:text-amber-100/60' : 'text-indigo-100/60'}`}>
                     {content}
                   </p>
                </div>
             </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const LayoutTab = ({ zones }) => {
  const zoneList = Array.isArray(zones) ? zones : [];
  if (zoneList.length === 0) return <EmptyState message="Architecting spatial flow..." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {zoneList.map((zone, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-10 bg-gray-50 dark:bg-white/5 rounded-[48px] border border-gray-100 dark:border-white/5 space-y-8 shadow-sm group hover:border-[#8d775e]/30 transition-all"
        >
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black flex items-center justify-center border border-gray-100 dark:border-white/10 text-[#8d775e] font-bold text-lg shadow-sm">
                   {idx + 1}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">{zone?.name || `Zone ${idx + 1}`}</h4>
             </div>
          </div>
          <div className="space-y-6">
             {zone?.purpose && (
               <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.2em]">Primary Intent</span>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{zone.purpose}</p>
               </div>
             )}
             {zone?.flowDirection && (
               <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Neural Mood</span>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">"{zone.flowDirection}"</p>
               </div>
             )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-24 bg-gray-50/50 dark:bg-white/5 rounded-[48px] border border-dashed border-gray-200 dark:border-white/10">
    <div className="w-20 h-20 bg-white dark:bg-black rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-white/10 shadow-xl">
       <div className="w-3 h-3 rounded-full bg-[#8d775e] animate-ping" />
    </div>
    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">{message}</p>
  </div>
);

export default MoodboardHistoryDetails;
