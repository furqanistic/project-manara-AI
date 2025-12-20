import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Download,
    Image as ImageIcon,
    Search,
    Trash2,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Confirmation Dialog Component (simplified from MoodboardHistory)
const DeleteConfirmationDialog = ({
  isOpen,
  title,
  onConfirm,
  onCancel,
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-[140] w-[90%] max-w-sm p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Floor Plan?</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete this floor plan? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const FloorPlanHistory = ({ isOpen, onClose, onLoadItem }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('fp_history_gallery');
      if (saved) {
        setHistoryItems(JSON.parse(saved).reverse()); // Newest first
      } else {
        setHistoryItems([]);
      }
    } catch (err) {
      console.error("Failed to load history", err);
      setHistoryItems([]);
    }
  };

  const handleDelete = (id) => {
    const updated = historyItems.filter(item => item.id !== id);
    setHistoryItems(updated);
    localStorage.setItem('fp_history_gallery', JSON.stringify(updated.reverse())); // Save back in chronological order? Or just save updated list?
    // Actually, let's keep the internal state as reverse (display order) and save it correctly. 
    // Ideally, we should just read/write the same structure. 
    // Let's assume list is stored newest-first or oldest-first. 
    // Let's store newest-first in state, and when saving, save it as is.
    localStorage.setItem('fp_history_gallery', JSON.stringify(updated.reverse())); // Re-reverse to keep original order if needed, or just save 'updated' if we consistently use newest-first.
    // Simpler: Just save 'updated'.
    localStorage.setItem('fp_history_gallery', JSON.stringify(updated));
    toast.success("Floor plan deleted");
  };

  useEffect(() => {
    let result = historyItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.prompt || "").toLowerCase().includes(q) ||
        (new Date(item.timestamp).toLocaleDateString().includes(q))
      );
    }
    setFilteredItems(result);
  }, [historyItems, searchQuery]);

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
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-full sm:w-[450px] h-full bg-white shadow-2xl z-[110] flex flex-col border-l border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#fbf9f7]">
              <div>
                <h2 className="text-xl font-bold text-stone-800">History</h2>
                <p className="text-sm text-stone-500">Your generated floor plans</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-stone-100">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Search prompts..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#937c60]/20"
                  />
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10 text-stone-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No history found</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <HistoryCard 
                    key={item.id} 
                    item={item} 
                    onLoad={() => {
                      onLoadItem(item);
                      onClose();
                    }}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const HistoryCard = ({ item, onLoad, onDelete }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = `data:${item.image.mimeType};base64,${item.image.data}`;
    link.download = `floor-plan-${item.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div 
        onClick={onLoad}
        className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex gap-3 p-3"
      >
        {/* Thumbnail */}
        <div className="w-24 h-24 bg-stone-100 rounded-lg shrink-0 overflow-hidden border border-stone-100">
          <img 
            src={`data:${item.image.mimeType};base64,${item.image.data}`} 
            alt="Thumbnail" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <p className="text-sm font-medium text-stone-800 line-clamp-2 leading-snug mb-1">
              {item.prompt}
            </p>
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <Clock className="w-3 h-3" />
              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
             <button 
               onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
               className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
               title="Delete"
             >
               <Trash2 className="w-4 h-4" />
             </button>
             <button 
               onClick={handleDownload}
               className="p-1.5 text-stone-400 hover:text-[#937c60] hover:bg-[#937c60]/10 rounded-lg transition-colors"
               title="Download"
             >
               <Download className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog 
        isOpen={deleteOpen}
        onConfirm={onDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}
