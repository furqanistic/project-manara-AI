// File: project-manara-AI/client/src/components/Moodboard/MoodboardHistroyDeatils.jsx
import TopBar from "@/components/Layout/Topbar";
import { getMoodboardById } from "@/services/moodboardService";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Copy,
  Download,
  Lightbulb,
  Map,
  Maximize2,
  Package,
  Sofa,
  Sparkles,
  TextIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BeautifulLoader from "./BeautifulLoader";
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from "./Moodboardconfig";

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
  completed: "bg-green-100 text-green-800",
  image_generated: "bg-blue-100 text-blue-800",
  generating: "bg-yellow-100 text-yellow-800",
  draft: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
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

export const MoodboardHistroyDeatils = () => {
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
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading && !moodboard) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 bg-gray-50 border border-gray-100"
        >
          <Sparkles className="w-12 h-12" style={{ color: BRAND_COLOR }} />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Preparing Details</h2>
        <p className="text-gray-500 mb-8 text-center">Fetching your personalized interior vision...</p>
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4 mx-auto">
          <motion.div
            className="h-full"
            style={{ backgroundColor: BRAND_COLOR }}
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (error || !moodboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-100 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error || "We couldn't find the moodboard you're looking for."}</p>
          <button
            onClick={() => navigate("/moodboard")}
            className="w-full px-6 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            Return to Generator
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <TopBar />
      
      {moodboard.status === "generating" && (
        <BeautifulLoader
          progressSteps={progressSteps}
          phase={moodboard.compositeMoodboard?.url ? "descriptions" : "image"}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        {/* Breadcrumb-style Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Collection
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight mb-2">
                {moodboard.title}
              </h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[moodboard.status] || STATUS_COLORS.draft}`}>
                  {moodboard.status?.replace(/_/g, " ")}
                </span>
                <span className="text-gray-300">•</span>
                <p className="text-gray-500 text-sm font-medium">
                  {moodboard.roomType?.replace(/_/g, " ")} Style
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <button
                onClick={() => handleDownload(moodboard.compositeMoodboard?.url, `${moodboard.title}.png`)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Side: Hero Image and Previews */}
          <div className="lg:col-span-8 space-y-10">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 group relative"
            >
              <div className="relative aspect-auto min-h-[400px] flex items-center justify-center bg-[#fcfcfc]">
                {moodboard.compositeMoodboard?.url ? (
                  <>
                    <img
                      src={moodboard.compositeMoodboard.url}
                      alt={moodboard.title}
                      className="max-w-full h-auto block"
                    />
                    <button
                      onClick={() => setSelectedImage(moodboard.compositeMoodboard.url)}
                      className="absolute top-6 right-6 p-3 bg-white/95 hover:bg-white rounded-2xl border border-gray-100 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    >
                      <Maximize2 className="w-5 h-5 text-gray-900" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-20">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-gray-300" />
                     </div>
                     <p className="text-gray-400 font-medium tracking-tight">Image is being generated...</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Sub-Images (if any) */}
            {moodboard.roomImages?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {moodboard.roomImages.map((image, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 group cursor-pointer"
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-6 right-6 p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                       <Maximize2 className="w-4 h-4 text-gray-900" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
             <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 space-y-8"
             >
                <div className="space-y-6">
                   <div>
                      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-3">Specification</h4>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-500">Style</span>
                            <span className="text-sm font-bold text-gray-900">{moodboard.style}</span>
                         </div>
                         <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-500">Room</span>
                            <span className="text-sm font-bold text-gray-900">{moodboard.roomType?.replace(/_/g, " ")}</span>
                         </div>
                         <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-500">Created</span>
                            <span className="text-sm font-bold text-gray-900">{formatDate(moodboard.createdAt)}</span>
                         </div>
                      </div>
                   </div>

                   {moodboard.moodSummary && (
                      <div className="pt-2">
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-3">Atmosphere</h4>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                          "{moodboard.moodSummary}"
                        </p>
                      </div>
                   )}

                   {moodboard.colorPalette?.length > 0 && (
                      <div className="pt-2">
                         <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-4">Color DNA</h4>
                         <div className="flex gap-2.5">
                            {moodboard.colorPalette.slice(0, 5).map((color, idx) => (
                               <div 
                                  key={idx}
                                  className="w-full h-12 rounded-xl border border-gray-100 shadow-inner"
                                  style={{ backgroundColor: color.hex }}
                                  title={`${color.name}: ${color.hex}`}
                               />
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             </motion.div>


          </div>
        </div>

        {/* Deep Details Section (Tabs) */}
        <div className="mt-20">
           <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
              <div className="flex px-2 sm:px-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-4 transition-all relative whitespace-nowrap group cursor-pointer`}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? "" : "text-gray-400 group-hover:text-gray-600"}`} style={{ color: isActive ? BRAND_COLOR : undefined }} />
                      <span className={`text-sm font-semibold tracking-tight transition-colors ${isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5" 
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-8 sm:p-12">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
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

      {/* Overlays */}
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

const TabLoadingState = ({ tabName }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed bottom-12 right-12 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-2xl flex items-center gap-6 z-[40]"
  >
    <div className="relative">
       <div className="w-12 h-12 rounded-2xl border-2 border-gray-100 animate-spin" style={{ borderTopColor: BRAND_COLOR }} />
       <Sparkles className="absolute inset-0 m-auto w-5 h-5" style={{ color: BRAND_COLOR }} />
    </div>
    <div>
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Generating {tabName}</h4>
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">Please wait a moment...</p>
    </div>
  </motion.div>
);

const ImageModal = ({ imageUrl, title, onClose, onDownload }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
    >
      <button onClick={onClose} className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition-colors">
        <X className="w-10 h-10" />
      </button>
      <img src={imageUrl} alt={title} className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => onDownload(imageUrl, `${title}.png`)}
          className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
        >
          Save to Device
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ============ Tab Sub-Components (Simplified for reference) ============
const OverviewTab = ({ moodboard }) => {
  const narrative = moodboard.designNarrative;
  if (!narrative?.narrative) return <EmptyState message="Generating design narrative..." />;

  return (
    <div className="space-y-12 max-w-4xl">
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">The Vision</h3>
        <p className="text-lg text-gray-600 leading-relaxed font-medium">
          {narrative.narrative}
        </p>
      </section>

      {narrative.keyFeatures?.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
           {narrative.keyFeatures.map((feature, i) => (
             <div key={i} className="space-y-2">
                <span className="text-[10px] font-bold text-[#937c60] uppercase tracking-widest">Feature {i+1}</span>
                <h4 className="text-lg font-semibold text-gray-900">{typeof feature === 'string' ? feature : feature.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{typeof feature === 'object' && feature.description}</p>
             </div>
           ))}
        </section>
      )}
    </div>
  );
};

const MaterialsTab = ({ materials }) => {
  if (!materials) return <EmptyState message="Selecting materials..." />;
  const categories = Object.entries(materials).filter(([_, items]) => items?.length > 0);
  if (categories.length === 0) return <EmptyState message="Cataloging materials..." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {categories.map(([category, items]) => (
        <div key={category} className="space-y-6">
          <h4 className="text-[11px] font-bold text-[#937c60] uppercase tracking-[0.2em]">{category.replace('_', ' ')}</h4>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="font-semibold text-gray-900 text-sm mb-1">{item.name || item.type}</div>
                <div className="text-xs text-gray-500 mb-2">{item.finish || item.description}</div>
                {item.application && (
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.application}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const FurnitureTab = ({ furniture }) => {
  const pieces = Array.isArray(furniture?.heroPieces) ? furniture.heroPieces : [];
  if (pieces.length === 0) return <EmptyState message="Curating furniture..." />;

  // Helper to format dimensions object to string
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {pieces.map((piece, idx) => {
        const dimensions = formatDimensions(piece?.dimensions);
        return (
          <div key={idx} className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
               <Sofa className="w-6 h-6 text-gray-300" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{piece?.name || "Unnamed Piece"}</h4>
              <span className="text-[10px] font-bold text-[#937c60] uppercase tracking-[0.2em]">{piece?.category || "Furniture"}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{piece?.description || "No description available."}</p>
            {(piece?.material || dimensions) && (
              <div className="pt-4 flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50">
                 {piece.material && (
                   <span className="truncate max-w-[150px]">{typeof piece.material === 'object' ? piece.material.name : piece.material}</span>
                 )}
                 {piece.material && dimensions && <span>•</span>}
                 {dimensions && <span className="truncate">{dimensions}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const LightingTab = ({ lightingConcept }) => {
  if (!lightingConcept) return <EmptyState message="Designing lighting concept..." />;

  const renderValue = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.description || val.name || JSON.stringify(val);
    return null;
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {['dayMood', 'nightMood'].map((mood) => {
          const content = renderValue(lightingConcept[mood]);
          if (!content) return null;
          
          return (
             <div key={mood} className={`p-8 rounded-[2rem] border ${mood === 'dayMood' ? 'bg-orange-50/30 border-orange-100' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <h4 className={`text-sm font-bold uppercase tracking-widest mb-4 ${mood === 'dayMood' ? 'text-orange-600' : 'text-slate-100'}`}>{mood === 'dayMood' ? 'Daylight Strategy' : 'After Dark'}</h4>
                <p className={`text-base font-medium leading-relaxed ${mood === 'dayMood' ? 'text-orange-900/70' : 'text-slate-400'}`}>
                  {content}
                </p>
             </div>
          );
        })}
      </div>
    </div>
  );
};

const LayoutTab = ({ zones }) => {
  const zoneList = Array.isArray(zones) ? zones : [];
  if (zoneList.length === 0) return <EmptyState message="Planning layout..." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {zoneList.map((zone, idx) => (
        <div key={idx} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
             <h4 className="text-xl font-bold text-gray-900 tracking-tight">{zone?.name || `Zone ${idx + 1}`}</h4>
             <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
          </div>
          <div className="space-y-4">
             {zone?.purpose && (
               <div>
                  <span className="text-[10px] font-bold text-[#937c60] uppercase tracking-widest">Purpose</span>
                  <p className="text-sm font-medium text-gray-600 mt-1">{zone.purpose}</p>
               </div>
             )}
             {zone?.flowDirection && (
               <div>
                  <span className="text-[10px] font-bold text-[#937c60] uppercase tracking-widest">Mood</span>
                  <p className="text-sm font-medium text-gray-600 mt-1">{zone.flowDirection}</p>
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
       <div className="w-2 h-2 rounded-full bg-gray-200 animate-ping" />
    </div>
    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">{message}</p>
  </div>
);

export default MoodboardHistroyDeatils;
