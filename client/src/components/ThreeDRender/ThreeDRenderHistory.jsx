import api from "@/config/config";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
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

// Confirmation Dialog Component
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#111] rounded-[32px] shadow-2xl z-[210] w-[90%] max-w-sm p-8 overflow-hidden border border-gray-100 dark:border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete from History?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              This will permanently remove the 3D render from your history. This action is irreversible.
            </p>

            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm"
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


export const ThreeDRenderHistory = ({ isOpen, onClose, onLoadItem }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      const response = await api.get('/3d/my-models');
      if (response.data && response.data.data) {
        setHistoryItems(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
      toast.error("Failed to load history");
    }
  };

  const handleDelete = async (id) => {
    try {
        await api.delete(`/3d/${id}`);
        const updated = historyItems.filter(item => item._id !== id);
        setHistoryItems(updated);
        toast.success("Record deleted from history");
    } catch (err) {
        console.error("Failed to delete item", err);
        toast.error("Failed to delete item");
    }
  };

  useEffect(() => {
    let result = historyItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.style || "").toLowerCase().includes(q) ||
        (new Date(item.timestamp || item.createdAt).toLocaleDateString().includes(q))
      );
    }
    setFilteredItems(result.slice(0, 5));
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
            className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md z-[150]"
          />

          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed top-0 right-0 w-full sm:w-[500px] h-full bg-[#faf8f6] dark:bg-[#0a0a0a] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[160] flex flex-col border-l border-gray-100 dark:border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 pt-12 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <div className='flex items-center gap-2 mb-1'>
                    <div className='w-8 h-[1px] bg-[#8d775e]'></div>
                    <span className='text-[9px] font-bold tracking-[0.4em] text-[#8d775e] uppercase'>3D Design History</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">History</h2>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-2xl transition-all text-gray-400 group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8d775e] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search history..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[20px] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8d775e]/20 transition-all font-medium"
                  />
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4 scrollbar-hide">
              {filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-30">
                  <div className='p-6 bg-white dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10'>
                    <ImageIcon className="w-10 h-10 text-[#8d775e]" />
                  </div>
                  <p className='text-sm font-medium'>No history found</p>
                </div>
              ) : (
                filteredItems.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={item._id}
                  >
                    <HistoryCard 
                        item={item} 
                        onLoad={() => {
                            onLoadItem(item);
                            onClose();
                        }}
                        onDelete={() => handleDelete(item._id)}
                    />
                  </motion.div>
                ))
              )}
            </div>

            {/* View All Footer */}
            {historyItems.length > 5 && (
              <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                <button 
                  onClick={() => {
                    onClose();
                    window.location.href = '/projects';
                  }}
                  className="w-full py-4 rounded-[20px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm font-bold text-[#8d775e] hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                >
                  View All in Projects Vault
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const HistoryCard = ({ item, onLoad, onDelete }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Use the first generated image for thumbnail
  const displayImage = item.versions?.[0]?.image || item.image;

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!displayImage) {
      toast.error("Image data missing");
      return;
    }
    const link = document.createElement('a');
    link.href = displayImage.url || `data:${displayImage.mimeType};base64,${displayImage.data}`;
    link.download = `manara-render-${Date.now()}.png`;
    link.click();
  };

  return (
    <>
      <div 
        onClick={onLoad}
        className="group bg-white dark:bg-white/5 rounded-[28px] border border-gray-100 dark:border-white/5 overflow-hidden hover:border-[#8d775e]/30 dark:hover:border-[#8d775e]/30 hover:shadow-2xl hover:shadow-[#8d775e]/5 transition-all cursor-pointer flex gap-5 p-4"
      >
        {/* Thumbnail */}
        <div className="w-28 h-28 bg-stone-100 dark:bg-stone-900 rounded-[20px] shrink-0 overflow-hidden border border-gray-100 dark:border-white/5 relative">
          {displayImage ? (
            <img 
              src={displayImage.url || `data:${displayImage.mimeType};base64,${displayImage.data}`} 
              alt="Render Thumbnail" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5">
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
          )}
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all' />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div className='space-y-2'>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug uppercase tracking-tight">
              {item.style || "3D Render"}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8d775e] uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                <span>{new Date(item.timestamp || item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                <span>{new Date(item.timestamp || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            {item.versions?.length > 1 && (
              <div className="text-[9px] font-bold text-[#8d775e] bg-[#8d775e]/10 px-2 py-0.5 rounded-full inline-block uppercase tracking-widest">
                {item.versions.length} Versions
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
             <button 
               onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
               className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
               title="Discard Record"
             >
               <Trash2 className="w-4 h-4" />
             </button>
             <button 
               onClick={handleDownload}
               className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-[#8d775e] hover:bg-[#8d775e]/10 rounded-xl transition-all"
               title="Download Render"
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
  );
};
