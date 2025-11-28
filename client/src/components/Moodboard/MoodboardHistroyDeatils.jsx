// File: project-manara-AI/client/src/components/Moodboard/MoodboardHistroyDeatils.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Loader,
  AlertCircle,
  Copy,
  Download,
  Share2,
  Maximize2,
  X,
  TextIcon,
  Package,
  Sofa,
  Lightbulb,
  Map,
} from "lucide-react";
import { getMoodboardById } from "@/services/moodboardService";
import { BRAND_COLOR } from "./Moodboardconfig";
import toast from "react-hot-toast";

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

  useEffect(() => {
    fetchMoodboardDetails();
  }, [id]);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: moodboard.title || "Moodboard",
          text: `Check out my moodboard: ${moodboard.title || "Untitled"}`,
          url: window.location.href,
        })
        .catch((err) => console.log("Share cancelled:", err));
    } else {
      toast.error("Share not supported on this device");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: BRAND_COLOR }}
          />
          <p className="text-gray-600">Loading moodboard details...</p>
        </div>
      </div>
    );
  }

  if (error || !moodboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error || "Moodboard not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-4 py-2 rounded-lg font-semibold transition-colors text-white"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex-1 text-center mx-4 line-clamp-1">
            {moodboard.title}
          </h1>

          <div className="w-12" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Left Side - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Composite Image */}
            {moodboard.compositeMoodboard?.url ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group"
              >
                <div className="relative bg-black w-full h-48 sm:h-80 lg:h-96 overflow-hidden">
                  <img
                    src={moodboard.compositeMoodboard.url}
                    alt={moodboard.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() =>
                      setSelectedImage(moodboard.compositeMoodboard.url)
                    }
                    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                  >
                    <Maximize2 className="w-5 h-5 text-gray-900" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleDownload(
                        moodboard.compositeMoodboard.url,
                        `${moodboard.title}-moodboard.png`
                      )
                    }
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm ml-auto"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-gray-500">
                  No moodboard image generated yet
                </p>
              </div>
            )}

            {/* Room Images Grid */}
            {moodboard.roomImages?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
              >
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Room Preview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {moodboard.roomImages.map((image, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group rounded-xl overflow-hidden bg-black cursor-pointer"
                      onClick={() => setSelectedImage(image.url)}
                    >
                      <div className="aspect-video">
                        <img
                          src={image.url}
                          alt={`Room ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Side - Details */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status Card */}
            {moodboard.status && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
              >
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
                  Status
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    STATUS_COLORS[moodboard.status] || STATUS_COLORS.draft
                  }`}
                >
                  {moodboard.status.replace("_", " ").toUpperCase()}
                </span>
              </motion.div>
            )}

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-4"
            >
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Details
              </h3>

              {moodboard.style && moodboard.style !== "Not specified" && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Style
                  </p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {moodboard.style}
                  </p>
                </div>
              )}

              {moodboard.roomType && moodboard.roomType !== "Not specified" && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Room Type
                  </p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {moodboard.roomType.replace(/_/g, " ")}
                  </p>
                </div>
              )}

              {moodboard.moodSummary && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Mood
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {moodboard.moodSummary}
                  </p>
                </div>
              )}

              {moodboard.createdAt && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Created
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(moodboard.createdAt)}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        {moodboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
          >
            {/* Tab Navigation */}
            <div className="flex gap-3 sm:gap-1 mb-8 overflow-x-auto pb-2 border-b border-gray-200">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-3 font-medium transition-all whitespace-nowrap border-b-2 text-sm sm:text-base ${
                      activeTab === tab.id
                        ? "text-gray-900 border-gray-900"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && (
                  <OverviewTab moodboard={moodboard} />
                )}
                {activeTab === "materials" && (
                  <MaterialsTab materials={moodboard.materials} />
                )}
                {activeTab === "furniture" && (
                  <FurnitureTab furniture={moodboard.furniture} />
                )}
                {activeTab === "lighting" && (
                  <LightingTab lightingConcept={moodboard.lightingConcept} />
                )}
                {activeTab === "layout" && (
                  <LayoutTab zones={moodboard.zones} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <img
              src={selectedImage}
              alt="Fullscreen preview"
              className="w-full h-full object-contain rounded-lg"
            />

            <button
              onClick={() =>
                handleDownload(selectedImage, `${moodboard.title}-image.png`)
              }
              className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// TAB COMPONENTS
// ============================================================================

const OverviewTab = ({ moodboard }) => {
  const narrative = moodboard.designNarrative;
  const colorPalette = moodboard.colorPalette || [];
  const moodDescription =
    moodboard.compositeMoodboard?.metadata?.moodDescription;

  return (
    <div className="space-y-8">
      {narrative && narrative.narrative && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Design Concept
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-6">
            {narrative.narrative}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {narrative.vibe && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  The Vibe
                </h4>
                <p className="text-gray-800">{narrative.vibe}</p>
              </div>
            )}
            {narrative.lifestyle && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Lifestyle Fit
                </h4>
                <p className="text-gray-800">{narrative.lifestyle}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {(moodDescription || colorPalette.length > 0) && (
        <section className="space-y-6">
          {moodDescription && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {moodDescription.mood}
                </h3>
                <p className="text-sm text-gray-600">
                  {moodDescription.feeling}
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                {moodDescription.description}
              </p>
              {moodDescription.keywords && (
                <div className="flex flex-wrap gap-2">
                  {moodDescription.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {colorPalette.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                Color Palette
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                {colorPalette.map((color, index) => (
                  <div key={index}>
                    <div
                      className="w-full aspect-square rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-transform hover:shadow-md hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} - ${color.hex}`}
                    />
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {color.name}
                      </div>
                      <div className="text-xs text-gray-500">{color.hex}</div>
                      <div className="text-xs text-gray-500">
                        {color.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const MaterialsTab = ({ materials }) => {
  if (
    !materials ||
    Object.keys(materials).every((k) => !materials[k]?.length)
  ) {
    return <EmptyState message="No materials specified" />;
  }

  const categories = [
    { key: "floors", label: "Flooring" },
    { key: "walls", label: "Walls" },
    { key: "tiles", label: "Tiles" },
    { key: "fabrics", label: "Fabrics" },
    { key: "metals", label: "Metals" },
    { key: "woods", label: "Woods" },
  ];

  const maintenanceColors = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    high: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const items = materials[category.key];
        if (!items?.length) return null;

        return (
          <section key={category.key}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {category.label}
            </h3>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="font-semibold text-gray-900 mb-3">
                    {item.type}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                    {item.finish && (
                      <div>
                        <span className="text-gray-600">Finish: </span>
                        <span className="text-gray-900">{item.finish}</span>
                      </div>
                    )}
                    {item.color && (
                      <div>
                        <span className="text-gray-600">Color: </span>
                        <span className="text-gray-900">{item.color}</span>
                      </div>
                    )}
                  </div>

                  {item.texture && (
                    <div className="text-sm mb-3">
                      <span className="text-gray-600">Texture: </span>
                      <span className="text-gray-900">{item.texture}</span>
                    </div>
                  )}

                  {item.maintenance && (
                    <div className="mb-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          maintenanceColors[item.maintenance] ||
                          maintenanceColors.medium
                        }`}
                      >
                        {item.maintenance.toUpperCase()} MAINTENANCE
                      </span>
                    </div>
                  )}

                  {item.source && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      Source: {item.source}
                    </div>
                  )}

                  {item.notes && (
                    <div className="text-xs text-gray-600 mt-2 italic">
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

const FurnitureTab = ({ furniture }) => {
  if (!furniture?.heroPieces?.length)
    return <EmptyState message="No furniture specified" />;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Pieces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {furniture.heroPieces.map((piece, idx) => (
            <div
              key={idx}
              className="p-5 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 text-base">
                  {piece.name}
                </h4>
                <p className="text-gray-600 text-sm capitalize mt-1">
                  {piece.category}
                </p>
              </div>

              {piece.dimensions && (
                <div className="bg-white rounded p-3 mb-3 border border-gray-200 text-sm">
                  <div className="text-xs text-gray-600 mb-1">Dimensions</div>
                  <div className="font-mono text-gray-900">
                    {piece.dimensions.length} × {piece.dimensions.width} ×{" "}
                    {piece.dimensions.height} {piece.dimensions.unit || "cm"}
                  </div>
                </div>
              )}

              {piece.scaleNotes && (
                <p className="text-sm text-gray-700 mb-3 italic">
                  "{piece.scaleNotes}"
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs pt-3 border-t border-gray-200 gap-2">
                {piece.placement && (
                  <span className="text-gray-600">{piece.placement}</span>
                )}
                {piece.source && (
                  <span className="text-gray-500">
                    {piece.brand && `${piece.brand} • `}
                    {piece.source}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {furniture.alternates?.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alternative Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {furniture.alternates.map((piece, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <h4 className="font-semibold text-gray-900 mb-1">
                  {piece.name}
                </h4>
                <p className="text-gray-600 text-sm mb-3 capitalize">
                  {piece.category}
                </p>

                {piece.dimensions && (
                  <div className="text-xs text-gray-600 mb-2 font-mono">
                    {piece.dimensions.length}×{piece.dimensions.width}×
                    {piece.dimensions.height} {piece.dimensions.unit || "cm"}
                  </div>
                )}

                {piece.source && (
                  <div className="text-xs text-gray-500">
                    {piece.brand && `${piece.brand} • `}
                    {piece.source}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const LightingTab = ({ lightingConcept }) => {
  if (!lightingConcept)
    return <EmptyState message="No lighting concept specified" />;

  const hasLighting =
    lightingConcept.ambient?.length > 0 ||
    lightingConcept.task?.length > 0 ||
    lightingConcept.accent?.length > 0;

  return (
    <div className="space-y-8">
      {(lightingConcept.dayMood || lightingConcept.nightMood) && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lighting Moods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lightingConcept.dayMood && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Daytime
                </h4>
                <p className="text-gray-700 text-sm mb-3">
                  {typeof lightingConcept.dayMood === "object"
                    ? lightingConcept.dayMood.description ||
                      lightingConcept.dayMood.name
                    : lightingConcept.dayMood}
                </p>
                {lightingConcept.dayMood.lightingNotes && (
                  <p className="text-xs text-gray-600 italic">
                    {lightingConcept.dayMood.lightingNotes}
                  </p>
                )}
              </div>
            )}

            {lightingConcept.nightMood && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Nighttime
                </h4>
                <p className="text-gray-700 text-sm mb-3">
                  {typeof lightingConcept.nightMood === "object"
                    ? lightingConcept.nightMood.description ||
                      lightingConcept.nightMood.name
                    : lightingConcept.nightMood}
                </p>
                {lightingConcept.nightMood.lightingNotes && (
                  <p className="text-xs text-gray-600 italic">
                    {lightingConcept.nightMood.lightingNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {hasLighting && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Light Fixtures
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {lightingConcept.ambient?.length > 0 && (
              <LightingCategory
                title="Ambient"
                lights={lightingConcept.ambient}
              />
            )}
            {lightingConcept.task?.length > 0 && (
              <LightingCategory title="Task" lights={lightingConcept.task} />
            )}
            {lightingConcept.accent?.length > 0 && (
              <LightingCategory
                title="Accent"
                lights={lightingConcept.accent}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
};

const LightingCategory = ({ title, lights }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {lights.map((light, idx) => (
          <div
            key={idx}
            className="bg-white rounded p-3 border border-gray-200"
          >
            <div className="font-medium text-gray-900 text-sm mb-1">
              {light.name}
            </div>
            {light.placement && (
              <div className="text-xs text-gray-600 mb-2">
                {light.placement}
              </div>
            )}
            <div className="flex gap-2 text-xs text-gray-500">
              {light.kelvin && <span>{light.kelvin}K</span>}
              {light.lumens && <span>• {light.lumens}lm</span>}
            </div>
            {light.notes && (
              <div className="text-xs text-gray-600 mt-2 italic">
                {light.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const LayoutTab = ({ zones }) => {
  if (!zones?.length) return <EmptyState message="No layout zones specified" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {zones.map((zone, idx) => (
        <div
          key={idx}
          className="p-5 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {zone.name}
          </h3>

          <div className="space-y-4">
            {zone.purpose && (
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
                  Purpose
                </div>
                <div className="text-gray-900 text-sm">{zone.purpose}</div>
              </div>
            )}

            {zone.focalPoint && (
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
                  Focal Point
                </div>
                <div className="text-gray-900 text-sm">{zone.focalPoint}</div>
              </div>
            )}

            {zone.flowDirection && (
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
                  Flow
                </div>
                <div className="text-gray-900 text-sm italic">
                  {zone.flowDirection}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-12 text-gray-500">
    <p className="text-sm">{message}</p>
  </div>
);

export default MoodboardHistroyDeatils;
