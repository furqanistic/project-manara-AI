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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Discard Record?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              This will permanently remove the snapshot from your architectural vault. This action is irreversible.
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

export const FloorPlanHistory = ({ isOpen, onClose, onLoadItem }) => {
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
      const response = await api.get('/floorplans/user');
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
        await api.delete(`/floorplans/${id}`);
        const updated = historyItems.filter(item => item._id !== id);
        setHistoryItems(updated);
        toast.success("Record discarded from vault");
    } catch (err) {
        console.error("Failed to delete record", err);
        toast.error("Failed to delete record");
    }
  };

  useEffect(() => {
    let result = historyItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.prompt || "").toLowerCase().includes(q) ||
        (new Date(item.timestamp || item.createdAt).toLocaleDateString().includes(q))
      );
    }
    setFilteredItems(result.slice(0, 5));
  }, [historyItems, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
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
                    <div className='w-8 h-[0.5px] bg-[#8d775e]/50'></div>
                    <span className='text-[8px] font-bold tracking-[0.3em] text-[#8d775e] uppercase'>Recent Work</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">History</h2>
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
                    placeholder="Search your vault..." 
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
                  <p className='text-sm font-medium'>Vault is currently empty</p>
                </div>
              ) : (
                filteredItems.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={item._id}
                  >
                    <HistoryCard 
                        item={item} 
                        dateText={formatDate(item.timestamp || item.createdAt)}
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
            <div className="p-6 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={() => {
                  onClose();
                  window.location.href = '/projects';
                }}
                className="w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 group"
              >
                View Full Projects Vault
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const HistoryCard = ({ item, dateText, onLoad, onDelete }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    let imageUrl = item.thumbnail || (item.image && (item.image.url || `data:${item.image.mimeType};base64,${item.image.data}`));
    
    if (!imageUrl) {
      toast.error("Snapshot data missing");
      return;
    }

    const toastId = toast.loading("Preparing download...");

    try {
      // 1. Data URL branch
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `manara-snapshot-${Date.now()}.png`;
        link.click();
        toast.success("Download started", { id: toastId });
        return;
      }

      // 2. Cloudinary specific force-download (server-side)
      if (imageUrl.includes('cloudinary.com')) {
        // Inject fl_attachment into the URL for Cloudinary
        // Typical structure: .../upload/v123456/path/to/image.jpg
        // We want: .../upload/fl_attachment/v123456/path/to/image.jpg
        imageUrl = imageUrl.replace('/upload/', '/upload/fl_attachment/');
      }

      // 3. Attempt Blob fetch for local save (best for naming)
      try {
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (!response.ok) throw new Error('Network response was not ok');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `manara-snapshot-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success("Download started", { id: toastId });
      } catch (innerErr) {
        // 4. Fallback: If blob fetch fails, just try opening the transformed URL
        // With fl_attachment, Cloudinary should force a download header
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = '_blank';
        link.download = `manara-snapshot-${Date.now()}.png`;
        link.click();
        toast.success("Download initiated", { id: toastId });
      }
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Unable to force download. Opening snapshot...", { id: toastId });
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <>
      <div 
        onClick={onLoad}
        className="group bg-white dark:bg-white/5 rounded-[28px] border border-gray-100 dark:border-white/5 overflow-hidden hover:border-[#8d775e]/30 dark:hover:border-[#8d775e]/30 hover:shadow-2xl hover:shadow-[#8d775e]/5 transition-all cursor-pointer flex items-center gap-5 p-4"
      >
        {/* Thumbnail */}
        <div className="w-20 h-20 bg-stone-100 dark:bg-stone-900 rounded-2xl shrink-0 overflow-hidden border border-gray-100 dark:border-white/5 relative">
          {item.thumbnail || item.image ? (
            <img 
              src={item.thumbnail || item.image.url || `data:${item.image.mimeType};base64,${item.image.data}`} 
              alt="Synthesis Thumbnail" 
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5">
              <ImageIcon className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
          <div className='space-y-1'>
            <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 line-clamp-1 leading-none group-hover:text-[#8d775e] transition-colors">
              {item.name?.split(' - ')[0] || item.prompt}
            </p>
            <span className='text-[10px] font-medium text-gray-400'>{dateText}</span>
          </div>
          
          <div className="flex gap-2 mt-3">
             <button 
               onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
               className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all rounded-lg"
               title="Discard Snapshot"
             >
               <Trash2 className="w-3.5 h-3.5" />
             </button>
             <button 
               onClick={handleDownload}
               className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-[#8d775e] transition-all rounded-lg"
               title="Download Assets"
             >
               <Download className="w-3.5 h-3.5" />
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
