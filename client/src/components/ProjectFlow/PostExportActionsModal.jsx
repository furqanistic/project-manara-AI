import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import React from 'react'

const PostExportActionsModal = ({ open, onContinueRefining, onCreateNewProject, onUpgrade, onClose }) => {
  if (!open) return null

  return (
    <div className='fixed inset-0 z-[110] flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='absolute inset-0 bg-black/70 backdrop-blur-md'
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className='relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white'
      >
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
          aria-label='Close export actions'
        >
          <X size={14} />
        </button>
        <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Export Complete</h3>
        <p className='mt-1 text-sm text-gray-600 dark:text-gray-300'>What would you like to do next?</p>

        <div className='mt-5 space-y-2.5'>
          <button
            onClick={onContinueRefining}
            className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
          >
            Continue refining
          </button>
          <button
            onClick={onCreateNewProject}
            className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
          >
            Create new project
          </button>
          <button
            onClick={onUpgrade}
            className='w-full rounded-xl bg-gray-900 px-4 py-2.5 text-left text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-100'
          >
            Upgrade for higher resolution
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default PostExportActionsModal
