// File: project-manara-AI/client/src/components/Moodboard/MoodboardHistory.jsx
import {
  deleteMoodboard,
  getUserMoodboards,
} from "@/services/moodboardService";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Image as ImageIcon,
  Layout,
  Loader,
  Palette,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BRAND_COLOR } from "./Moodboardconfig";

const STATUS_COLORS = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  image_generated: "bg-amber-50 text-amber-700 border-amber-100",
  generating: "bg-blue-50 text-blue-700 border-blue-100",
  draft: "bg-slate-50 text-slate-700 border-slate-100",
  failed: "bg-rose-50 text-rose-700 border-rose-100",
};

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent", icon: Clock },
  { value: "oldest", label: "Oldest First", icon: RotateCcw },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Status", icon: Filter },
  { value: "completed", label: "Completed", icon: CheckCircle },
  { value: "image_generated", label: "Image Generated", icon: ImageIcon },
  { value: "draft", label: "Draft", icon: FileText },
  { value: "generating", label: "Generating", icon: Loader },
  { value: "failed", label: "Failed", icon: AlertCircle },
];

// Custom Dropdown Component
const CustomDropdown = ({
  value,
  onChange,
  options,
  isOpen,
  setIsOpen,
  triggerIcon: TriggerIcon,
  onOpen,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            onOpen();
            setIsOpen(true);
          }
        }}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-[#937c60]/20 outline-none"
      >
        <div className="flex items-center gap-2.5">
          {TriggerIcon && (
            <TriggerIcon className="w-4 h-4" style={{ color: BRAND_COLOR }} />
          )}
          <span className="text-sm font-medium text-gray-700">
            {options.find((opt) => opt.value === value)?.label}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl  z-[120] py-1.5 overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left ${
                  value === option.value
                    ? "bg-[#937c60]/5 text-[#937c60]"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                {option.icon && (
                  <option.icon className={`w-4 h-4 ${value === option.value ? "text-[#937c60]" : "text-gray-400"}`} />
                )}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Confirmation Dialog Component
const DeleteConfirmationDialog = ({
  isOpen,
  title,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[130]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl  z-[140] w-[90%] max-w-sm p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-rose-50">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Moodboard</h3>
                <p className="text-sm text-gray-500">This action is permanent</p>
              </div>
            </div>

            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{title}"</span>? All related data and generations will be removed.
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 border border-gray-200"
              >
                Keep it
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const MoodboardHistory = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [moodboards, setMoodboards] = useState([]);
  const [filteredMoodboards, setFilteredMoodboards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSortBy("recent");
      setFilterStatus("all");
      setSortOpen(false);
      setFilterOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchMoodboards();
    }
  }, [page, isOpen]);

  const fetchMoodboards = async () => {
    try {
      setIsLoading(true);
      const response = await getUserMoodboards({ page, limit: 20 });
      setMoodboards((prev) =>
        page === 1
          ? response.data.moodboards
          : [...prev, ...response.data.moodboards]
      );
      const receivedCount = response.data.moodboards.length;
      const isLastPage = receivedCount < 20;
      setHasMore(!isLastPage && page < response.totalPages);
    } catch (error) {
      console.error("Error fetching moodboards:", error);
      toast.error("Failed to load moodboard history");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  const handleDeleteMoodboard = (moodboardId) => {
    setMoodboards((prev) => prev.filter((m) => m._id !== moodboardId));
  };

  useEffect(() => {
    let filtered = moodboards;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.style?.toLowerCase().includes(query) ||
          m.roomType?.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

    setFilteredMoodboards(filtered);
  }, [moodboards, searchQuery, sortBy, filterStatus]);

  const handleLoadMore = () => setPage((p) => p + 1);

  const handleCardClick = (moodboardId) => {
    onClose();
    navigate(`/moodboards/${moodboardId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-48%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-48%", x: "-50%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 w-[95%] max-w-5xl h-[90vh] bg-stone-50 rounded-3xl  z-[110] flex flex-col overflow-hidden border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section with solid background */}
            <div className="bg-white px-6 py-6 border-b border-stone-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#937c60]/5 rounded-full blur-3xl -mr-32 -mt-32" />
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#937c60]/5 rounded-full blur-3xl -ml-24 -mb-24" />
               
               <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#937c60]">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                      Moodboard Library
                    </h2>
                    <p className="text-sm font-medium text-stone-500">
                      Explore and manage your {moodboards.length} creative visions
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-all duration-200 hover:rotate-90 group"
                >
                  <X className="w-5 h-5 group-hover:text-stone-900" />
                </button>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="p-6 bg-white border-b border-stone-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400 group-focus-within:text-[#937c60] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by title, style, or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#937c60]/20 focus:border-[#937c60] transition-all text-sm group-hover:border-stone-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:w-[400px]">
                  <CustomDropdown
                    value={sortBy}
                    onChange={setSortBy}
                    options={SORT_OPTIONS}
                    isOpen={sortOpen}
                    setIsOpen={setSortOpen}
                    triggerIcon={Clock}
                    onOpen={() => setFilterOpen(false)}
                  />
                  <CustomDropdown
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={FILTER_OPTIONS}
                    isOpen={filterOpen}
                    setIsOpen={setFilterOpen}
                    triggerIcon={Filter}
                    onOpen={() => setSortOpen(false)}
                  />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-stone-50/50 relative">
              {!hasLoaded ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#937c60]/20 blur-xl rounded-full" />
                    <Loader className="w-12 h-12 text-[#937c60] animate-spin relative" />
                  </div>
                  <p className="mt-4 text-stone-500 font-medium">Curating your library...</p>
                </div>
              ) : filteredMoodboards.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                    <ImageIcon className="w-10 h-10 text-stone-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-800 mb-2">
                    {searchQuery ? "No results found" : "Your library is empty"}
                  </h3>
                  <p className="text-stone-500 max-w-xs mx-auto">
                    {searchQuery 
                      ? "Try adjusting your filters or search keywords to find what you're looking for." 
                      : "Start your design journey by creating your first moodboard today!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                  {filteredMoodboards.map((moodboard, index) => (
                    <MoodboardCard
                      key={moodboard._id}
                      moodboard={moodboard}
                      index={index}
                      onClick={() => handleCardClick(moodboard._id)}
                      onDelete={handleDeleteMoodboard}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Load More */}
            {hasMore && hasLoaded && (
              <div className="p-4 bg-white border-t border-stone-200 flex justify-center  ">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-[#937c60] transition-all duration-300 disabled:opacity-50 flex items-center gap-2 group  "
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  )}
                  {isLoading ? "Fetching more..." : "Load More Designs"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Extracted card component for better readability
const MoodboardCard = ({ moodboard, index, onClick, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteMoodboard(moodboard._id);
      toast.success("Moodboard deleted successfully");
      onDelete(moodboard._id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting moodboard:", error);
      toast.error("Failed to delete moodboard");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.3) }}
        onClick={onClick}
        className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden hover: hover:border-[#937c60]/40 transition-all duration-500 cursor-pointer flex flex-col h-full"
      >
        {/* Image Container with Fixed Aspect Ratio and Blurred Background Fix */}
        <div className="relative aspect-video bg-stone-100 overflow-hidden">
          {moodboard.compositeMoodboard?.url ? (
            <>
              {/* Blurred background for padding (fixes square image in 16:9 issue) */}
              <img
                src={moodboard.compositeMoodboard.url}
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125"
                alt=""
              />
              <img
                src={moodboard.compositeMoodboard.url}
                alt={moodboard.title}
                className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
              <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-xs font-medium uppercase tracking-widest">No Preview</p>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-rose-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 "
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
             <div className="flex-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md mb-2 ${
                  STATUS_COLORS[moodboard.status]?.replace('bg-', 'bg-') || "bg-white/20 text-white border-white/20"
                }`}>
                  {moodboard.status.replace("_", " ").toUpperCase()}
                </span>
                <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 group-hover:text-[#e5d5c5] transition-colors">
                  {moodboard.title}
                </h3>
             </div>
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                <ArrowRight className="w-5 h-5" />
             </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-stone-500">
                  <Layout className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Space</span>
                </div>
                <p className="text-sm font-semibold text-stone-800 capitalize truncate">
                  {moodboard.roomType?.replace("_", " ") || "Not Specified"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-stone-500">
                  <Palette className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Style</span>
                </div>
                <p className="text-sm font-semibold text-stone-800 capitalize truncate">
                  {moodboard.style || "Custom Style"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-stone-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {new Date(moodboard.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        title={moodboard.title}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isDeleting={isDeleting}
      />
    </>
  );
};
