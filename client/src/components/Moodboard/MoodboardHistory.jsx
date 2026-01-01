// File: project-manara-AI/client/src/components/Moodboard/MoodboardHistory.jsx
import { useDeleteMoodboard, useUserMoodboards } from "@/hooks/useMoodboard";
import { deleteMoodboard } from "@/services/moodboardService";
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
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  image_generated: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  generating: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  failed: "bg-rose-500/10 text-rose-500 border-rose-500/20",
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
        className="flex items-center justify-between w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-[#8d775e]/30 transition-all focus:ring-2 focus:ring-[#8d775e]/20 outline-none"
      >
        <div className="flex items-center gap-2.5">
          {TriggerIcon && (
            <TriggerIcon className="w-4 h-4 text-[#8d775e]" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl shadow-black/20 z-[120] py-1.5 overflow-hidden"
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
                    ? "bg-[#8d775e]/10 text-[#8d775e]"
                    : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                }`}
              >
                {option.icon && (
                  <option.icon className={`w-4 h-4 ${value === option.value ? "text-[#8d775e]" : "text-gray-400"}`} />
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#111] rounded-[32px] z-[140] w-[90%] max-w-sm p-8 overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Library Item</h3>
                <p className="text-sm text-rose-500/60 font-bold uppercase tracking-wider">Permanent Action</p>
              </div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{title}"</span>? This will purge all associated architectural data.
            </p>

            <div className="flex gap-4">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
              >
                {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Deleting..." : "Confirm"}
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
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Use React Query for fetching
  const { data, isLoading } = useUserMoodboards(page, 12);
  const deleteMutation = useDeleteMoodboard();

  const moodboards = data?.data?.moodboards || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalResults || 0;

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSortBy("recent");
      setFilterStatus("all");
      setSortOpen(false);
      setFilterOpen(false);
      setPage(1);
    }
  }, [isOpen]);

  const filteredMoodboards = moodboards
    .filter((m) => {
      const matchesSearch = !searchQuery.trim() || 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.style?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.roomType?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === "all" || m.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

  const handleCardClick = (moodboardId) => {
    onClose();
    navigate(`/moodboards/${moodboardId}`);
  };

  const handleDeleteMoodboard = async (moodboardId) => {
    try {
      await deleteMutation.mutateAsync(moodboardId);
      toast.success("Moodboard purged from vault");
    } catch (error) {
      toast.error("Failed to delete moodboard");
    }
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
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-1/2 left-1/2 w-[95%] max-w-6xl h-[85vh] bg-[#faf8f6] dark:bg-[#0a0a0a] rounded-[48px] z-[110] flex flex-col overflow-hidden border border-gray-200 dark:border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 relative overflow-hidden flex-shrink-0">
               <div className="absolute top-0 right-0 w-80 h-80 bg-[#8d775e]/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
               
               <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-[18px] bg-[#8d775e] flex items-center justify-center shadow-lg shadow-[#8d775e]/20">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Synthesis <span className="text-[#8d775e] font-serif italic">Vault.</span>
                    </h2>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      Repository of {totalItems} neural architectural visions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 rounded-full transition-all group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="px-8 py-4 bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-gray-100 dark:border-white/5 relative z-20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8d775e] transition-colors" />
                  <input
                    type="text"
                    placeholder="Query by title, style, or room type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8d775e]/20 focus:border-[#8d775e] transition-all text-sm group-hover:border-gray-300 dark:group-hover:border-white/20 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 md:w-[450px]">
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
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/40 relative no-scrollbar">
              {isLoading ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="aspect-square rounded-[24px] bg-white dark:bg-[#111] animate-pulse border border-gray-100 dark:border-white/5" />
                  ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-6">
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

            {/* Pagination UI */}
            <div className="px-10 py-6 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/5 flex items-center justify-between flex-shrink-0">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Manifesting {filteredMoodboards.length} of {totalItems} concepts
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-[#8d775e] border border-gray-200 dark:border-white/10 transition-all disabled:opacity-30"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${
                          page === pageNum 
                            ? "bg-[#8d775e] text-white border-[#8d775e] shadow-lg shadow-[#8d775e]/20" 
                            : "bg-white dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10 hover:border-[#8d775e]/30"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-[#8d775e] border border-gray-200 dark:border-white/10 transition-all disabled:opacity-30"
                >
                  <ChevronDown className="w-5 h-5 -rotate-90" />
                </button>
              </div>
            </div>
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
        className="group relative bg-white dark:bg-[#111] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden hover:border-[#8d775e]/40 transition-all duration-500 cursor-pointer flex flex-col h-full shadow-sm hover:shadow-2xl hover:shadow-[#8d775e]/10"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 dark:bg-white/5 overflow-hidden">
          {moodboard.compositeMoodboard?.url ? (
            <img
              src={moodboard.compositeMoodboard.url}
              alt={moodboard.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
              <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Visualization</p>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md text-white hover:bg-rose-500 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center overflow-hidden"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
             <div className="flex-1 min-w-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-bold border backdrop-blur-md mb-3 ${
                  STATUS_COLORS[moodboard.status] || "bg-white/20 text-white border-white/20"
                }`}>
                  {moodboard.status.replace("_", " ").toUpperCase()}
                </span>
                <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-[#8d775e] transition-colors">
                  {moodboard.title}
                </h3>
             </div>
             <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500 translate-x-4 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5" />
             </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Layout className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Spatial Use</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize truncate">
                  {moodboard.roomType?.replace("_", " ") || "Undefined"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Palette className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Design Style</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize truncate">
                  {moodboard.style || "Custom"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
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
