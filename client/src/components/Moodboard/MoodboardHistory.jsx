// File: client/src/components/Moodboard/MoodboardHistory.jsx
// FIXED VERSION - Loading state issue resolved + View/Delete buttons removed
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Search, ChevronDown, Loader } from "lucide-react";
import { getUserMoodboards } from "@/services/moodboardService";
import { BRAND_COLOR } from "./Moodboardconfig";
import toast from "react-hot-toast";

export const MoodboardHistory = ({ isOpen, onClose }) => {
  const [moodboards, setMoodboards] = useState([]);
  const [filteredMoodboards, setFilteredMoodboards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // Track if we've loaded
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (moodboards.length === 0) {
        setPage(1);
        setHasLoaded(false);
      }
    } else {
      // Reset everything when closing
      setHasLoaded(false);
      setMoodboards([]);
      setFilteredMoodboards([]);
      setPage(1);
      setSearchQuery("");
      setSortBy("recent");
      setFilterStatus("all");
    }
  }, [isOpen]);

  // Fetch only when page changes
  useEffect(() => {
    if (isOpen) {
      fetchMoodboards();
    }
  }, [page, isOpen]);

  const fetchMoodboards = async () => {
    try {
      setIsLoading(true);
      const response = await getUserMoodboards({
        page,
        limit: 20,
      });

      if (page === 1) {
        setMoodboards(response.data.moodboards);
      } else {
        setMoodboards((prev) => [...prev, ...response.data.moodboards]);
      }

      setHasMore(page < response.totalPages);
    } catch (error) {
      console.error("Error fetching moodboards:", error);
      toast.error("Failed to load moodboard history");
    } finally {
      setIsLoading(false);
      setHasLoaded(true); // Mark that we've completed the fetch
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = moodboards;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.style?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.roomType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredMoodboards(filtered);
  }, [moodboards, searchQuery, sortBy, filterStatus]);

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      image_generated: "bg-blue-100 text-blue-800",
      generating: "bg-yellow-100 text-yellow-800",
      draft: "bg-gray-100 text-gray-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.draft;
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
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl max-h-[90vh] bg-white pb-10  rounded-2xl shadow-2xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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

            <div className="p-6 border-b border-gray-200 space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
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
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors cursor-pointer pr-10"
                    style={{
                      borderColor: sortBy ? BRAND_COLOR : "#e5e7eb",
                    }}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors cursor-pointer pr-10"
                    style={{
                      borderColor:
                        filterStatus !== "all" ? BRAND_COLOR : "#e5e7eb",
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="image_generated">Image Generated</option>
                    <option value="draft">Draft</option>
                    <option value="generating">Generating</option>
                    <option value="failed">Failed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* ✅ FIX: Only check hasLoaded - show spinner on initial load only */}
            <div className="flex-1 overflow-y-auto flex items-center justify-center min-h-0">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {filteredMoodboards.map((moodboard) => (
                    <motion.div
                      key={moodboard._id}
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
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              moodboard.status
                            )}`}
                          >
                            {moodboard.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(moodboard.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ FIX: Only show Load More after initial load to prevent duplicate 'Loading' text */}
            {hasMore && hasLoaded && (
              <div className="flex justify-center p-4 border-t border-gray-200">
                <button
                  onClick={() => setPage((p) => p + 1)}
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
