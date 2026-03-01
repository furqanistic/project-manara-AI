import React from 'react'

const NextStepCTA = ({ nextStepLabel, onClick, disabled = false }) => {
  return (
    <div className='rounded-2xl border border-[#8d775e]/20 bg-[#8d775e]/5 p-4'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d775e]'>What Happens Next</p>
      <p className='mt-1 text-sm font-semibold text-readable-primary'>
        {nextStepLabel || 'All workflow steps are complete'}
      </p>
      <button
        type='button'
        onClick={onClick}
        disabled={disabled || !nextStepLabel}
        className='mt-3 inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200'
      >
        Continue
      </button>
    </div>
  )
}

export default NextStepCTA
