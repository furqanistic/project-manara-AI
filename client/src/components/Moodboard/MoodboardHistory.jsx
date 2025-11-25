// File: project-manara-AI/client/src/components/Moodboard/MoodboardHistory.jsx
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { getUserMoodboards } from "@/services/moodboardService";
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
  return (
    <div className="relative">
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

export const MoodboardHistory = ({ isOpen, onClose }) => {
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
      setHasMore(page < response.totalPages);
    } catch (error) {
      console.error("Error fetching moodboards:", error);
      toast.error("Failed to load moodboard history");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

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
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${BRAND_COLOR}20` }}
                >
                  <Clock className="w-6 h-6" style={{ color: BRAND_COLOR }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Moodboard History
                  </h2>
                  <p className="text-sm text-gray-600">
                    {moodboards.length} total moodboards
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Search & Filters */}
            <div className="p-6 border-b border-gray-200 space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, style, or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors"
                    style={{
                      borderColor: searchQuery ? BRAND_COLOR : "#e5e7eb",
                    }}
                  />
                </div>

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

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {!hasLoaded ? (
                <div className="text-center">
                  <Loader
                    className="w-8 h-8 animate-spin mx-auto mb-3"
                    style={{ color: BRAND_COLOR }}
                  />
                  <p className="text-gray-600">Loading moodboards...</p>
                </div>
              ) : filteredMoodboards.length === 0 ? (
                <div className="text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3 blur-sm" />
                  <p className="text-gray-600">
                    {searchQuery
                      ? "No moodboards match your search"
                      : "No moodboards yet. Create your first moodboard!"}
                  </p>
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {filteredMoodboards.map((moodboard) => (
                    <MoodboardCard key={moodboard._id} moodboard={moodboard} />
                  ))}
                </div>
              )}
            </div>

            {/* Load More Button */}
            {hasMore && hasLoaded && (
              <div className="flex justify-center p-4 border-t border-gray-200">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
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
const MoodboardCard = ({ moodboard }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {moodboard.compositeMoodboard?.url && (
        <div className="relative h-32 bg-black overflow-hidden">
          <img
            src={moodboard.compositeMoodboard.url}
            alt={moodboard.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
          {moodboard.title}
        </h3>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {moodboard.style && (
            <div>
              <p className="text-gray-600">Style</p>
              <p className="font-medium text-gray-900 capitalize line-clamp-1">
                {moodboard.style}
              </p>
            </div>
          )}
          {moodboard.roomType && (
            <div>
              <p className="text-gray-600">Room</p>
              <p className="font-medium text-gray-900 capitalize line-clamp-1">
                {moodboard.roomType.replace("_", " ")}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              STATUS_COLORS[moodboard.status] || STATUS_COLORS.draft
            }`}
          >
            {moodboard.status.replace("_", " ").toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(moodboard.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
