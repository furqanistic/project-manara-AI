import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import React from "react";

const CreditConfirmModal = ({
  isOpen,
  cost,
  balance,
  actionLabel,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-[28px] bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#8d775e]/15 flex items-center justify-center text-[#8d775e]">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#8d775e]">
                      Credits
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Confirm usage
                    </h3>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {actionLabel}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This action will use <span className="font-semibold">{cost}</span> credits.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>Balance</span>
                  <span className="text-gray-900 dark:text-white">{balance} credits</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-gray-900 text-white hover:bg-black transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreditConfirmModal;
