// File: project-manara-AI/client/src/components/Moodboard/MoodboardHistory.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Search,
  ChevronDown,
  Loader,
  RotateCcw,
  Filter,
  CheckCircle,
  Image,
  FileText,
  AlertCircle,
  ArrowRight,
  Trash2,
} from "lucide-react";
import {
  getUserMoodboards,
  deleteMoodboard,
} from "@/services/moodboardService";
import { BRAND_COLOR } from "./Moodboardconfig";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-800",
  image_generated: "bg-blue-100 text-blue-800",
  generating: "bg-yellow-100 text-yellow-800",
  draft: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
};

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent", icon: Clock },
  { value: "oldest", label: "Oldest First", icon: RotateCcw },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Status", icon: Filter },
  { value: "completed", label: "Completed", icon: CheckCircle },
  { value: "image_generated", label: "Image Generated", icon: Image },
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

  // Close on outside click
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
        className="appearance-none px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors cursor-pointer flex items-center justify-between bg-white hover:border-gray-300 w-full"
        style={{
          borderColor: value && value !== "all" ? BRAND_COLOR : "#e5e7eb",
        }}
      >
        <div className="flex items-center gap-2">
          {TriggerIcon && (
            <TriggerIcon className="w-4 h-4" style={{ color: BRAND_COLOR }} />
          )}
          <span className="text-sm font-medium text-gray-900">
            {options.find((opt) => opt.value === value)?.label}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 ml-1 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 min-w-max">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition-colors whitespace-nowrap"
            >
              {option.icon && (
                <option.icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: BRAND_COLOR }}
                />
              )}
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
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
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-[90%] max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#fee2e2" }}
              >
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Moodboard
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{title}</strong>"? This
              action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
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

  // Reset UI state when modal closes (keep cached data)
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSortBy("recent");
      setFilterStatus("all");
      setSortOpen(false);
      setFilterOpen(false);
    }
  }, [isOpen]);

  // Fetch moodboards when page changes
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

      // If we got fewer results than the limit, we're on the last page
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

  console.log(moodboards);

  // Filter and sort moodboards
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
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${BRAND_COLOR}20` }}
                >
                  <Clock
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    style={{ color: BRAND_COLOR }}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Moodboard History
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {moodboards.length} total moodboards
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>

            {/* Search & Filters */}
            <div className="p-4 sm:p-6 border-b border-gray-200 space-y-3 sm:space-y-4">
              <div className="flex gap-2 sm:gap-4 flex-col sm:flex-row">
                <div className="flex-1 min-w-0 relative">
                  <Search className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, style, or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors text-sm"
                    style={{
                      borderColor: searchQuery ? BRAND_COLOR : "#e5e7eb",
                    }}
                  />
                </div>

                <div className="flex gap-2 sm:gap-3">
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
            <div className="flex-1 overflow-y-auto min-h-0">
              {!hasLoaded ? (
                <div className="text-center py-2 min-h-[350px] flex items-center justify-center flex-col p-4">
                  <Loader
                    className="w-8 h-8 animate-spin mx-auto mb-3"
                    style={{ color: BRAND_COLOR }}
                  />
                  <p className="text-gray-600 text-sm">Loading moodboards...</p>
                </div>
              ) : filteredMoodboards.length === 0 ? (
                <div className="text-center min-h-[350px] flex items-center justify-center flex-col p-4">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3 blur-sm" />
                  <p className="text-gray-600 text-sm">
                    {searchQuery
                      ? "No moodboards match your search"
                      : "No moodboards yet. Create your first moodboard!"}
                  </p>
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6">
                  {filteredMoodboards.map((moodboard) => (
                    <MoodboardCard
                      key={moodboard._id}
                      moodboard={moodboard}
                      onClick={() => handleCardClick(moodboard._id)}
                      onDelete={handleDeleteMoodboard}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Load More Button */}
            {hasMore && hasLoaded && (
              <div className="flex justify-center p-3 sm:p-4 border-t border-gray-200">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-4  sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: `${BRAND_COLOR}20`,
                    color: BRAND_COLOR,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = `${BRAND_COLOR}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = `${BRAND_COLOR}20`;
                  }}
                >
                  {isLoading ? "Loading..." : "Load More"}
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
const MoodboardCard = ({ moodboard, onClick, onDelete }) => {
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={onClick}
        className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all group cursor-pointer active:scale-95"
        whileHover={{ y: -4 }}
      >
        {moodboard.compositeMoodboard?.url && (
          <div className="relative h-32 bg-black overflow-hidden">
            <img
              src={moodboard.compositeMoodboard.url}
              alt={moodboard.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3">
                <ArrowRight
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: BRAND_COLOR }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1 flex-1">
              {moodboard.title}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 group/delete"
            >
              <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600 transition-colors cursor-pointer" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-3">
            {moodboard.style && (
              <div>
                <p className="text-gray-600 text-xs">Style</p>
                <p className="font-medium text-gray-900 capitalize line-clamp-1 text-xs sm:text-sm">
                  {moodboard.style}
                </p>
              </div>
            )}
            {moodboard.roomType && (
              <div>
                <p className="text-gray-600 text-xs">Room</p>
                <p className="font-medium text-gray-900 capitalize line-clamp-1 text-xs sm:text-sm">
                  {moodboard.roomType.replace("_", " ")}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                STATUS_COLORS[moodboard.status] || STATUS_COLORS.draft
              }`}
            >
              {moodboard.status.replace("_", " ").toUpperCase()}
            </span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {(() => {
                const d = new Date(moodboard.createdAt);
                const day = d.getDate();
                const month = d.toLocaleString("en-US", { month: "long" });
                const year = d.getFullYear();
                return `${day} ${month}, ${year}`;
              })()}
            </span>
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
