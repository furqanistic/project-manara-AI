import { motion } from "framer-motion";
import { FolderPlus, Sparkles } from "lucide-react";
import React from "react";

const FirstProjectPromptModal = ({ onStartProject }) => {
  const MotionDiv = motion.div;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <MotionDiv
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg rounded-[36px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-8 shadow-2xl"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8d775e] text-white shadow-lg shadow-[#8d775e]/20">
          <FolderPlus size={24} />
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-[#8d775e]">
          Onboarding Complete
        </p>
        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Create your first project
        </h2>
        <p className="mt-3 text-center text-sm text-readable-secondary">
          Your profile is ready. Start with a project workspace to unlock all Manara tools.
        </p>

        <button
          type="button"
          onClick={onStartProject}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Sparkles size={16} />
          Start Project
        </button>
      </MotionDiv>
    </div>
  );
};

export default FirstProjectPromptModal;
