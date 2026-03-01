import { PROJECT_FLOW_STEPS } from '@/lib/projectFlow'
import { ChevronDown } from 'lucide-react'
import React from 'react'

const ProjectFlowIndicator = ({
  flowProgress,
  variant = 'compact',
  className = '',
  onStepClick,
}) => {
  const completedSet = new Set(flowProgress?.completedStepIds || [])
  const percent = flowProgress?.percent || 0
  const [showAllSteps, setShowAllSteps] = React.useState(false)
  const currentIndex = Math.max(
    0,
    PROJECT_FLOW_STEPS.findIndex((step) => step.id === flowProgress?.currentStepId)
  )
  const stepNumber = currentIndex + 1

  if (variant === 'sidebar') {
    return (
      <section
        className={`rounded-xl border border-gray-200 bg-white/95 p-3 shadow-sm dark:border-white/10 dark:bg-[#111]/80 ${className}`}
      >
        <div className='mb-2 flex items-center justify-between gap-2'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d775e]'>
            Step {stepNumber} of {PROJECT_FLOW_STEPS.length}
          </p>
          <div className='flex items-center gap-1.5'>
            <span className='rounded-md bg-[#8d775e]/10 px-2 py-1 text-[11px] font-semibold text-[#8d775e]'>
              {percent}%
            </span>
            <button
              type='button'
              onClick={() => setShowAllSteps((prev) => !prev)}
              className='inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-semibold text-readable-secondary hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10'
              aria-label={showAllSteps ? 'Collapse all steps' : 'Expand all steps'}
            >
              Steps
              <ChevronDown
                size={12}
                className={`transition-transform ${showAllSteps ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
        <p className='truncate text-[12px] font-semibold text-readable-primary'>
          {flowProgress?.currentStepLabel || 'Define Room Type / Scope'}
        </p>
        <p className='truncate text-[11px] text-readable-secondary'>
          Next: {flowProgress?.nextStepLabel || 'Completed'}
        </p>
        <div className='mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10'>
          <div className='h-full bg-[#8d775e] transition-all duration-300' style={{ width: `${percent}%` }} />
        </div>
        {showAllSteps && (
          <ol className='mt-3 space-y-1.5 border-t border-gray-200 pt-2.5 dark:border-white/10'>
            {PROJECT_FLOW_STEPS.map((step, index) => {
              const completed = completedSet.has(step.id)
              const isCurrent = flowProgress?.currentStepId === step.id

              return (
                <li key={step.id}>
                  <button
                    type='button'
                    onClick={() => onStepClick?.(step.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition ${
                      onStepClick ? 'hover:bg-[#8d775e]/8' : ''
                    }`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold ${
                        completed || isCurrent
                          ? 'bg-[#8d775e] text-white'
                          : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`truncate text-[10px] ${
                        isCurrent ? 'font-semibold text-readable-primary' : 'text-readable-secondary'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    )
  }

  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white/95 p-3 shadow-sm dark:border-white/10 dark:bg-[#111]/80 ${className}`}
    >
      <div className='mb-2.5 flex items-center justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d775e]'>
            Current: {flowProgress?.currentStepLabel || 'Define Room Type / Scope'}
          </p>
          <p className='truncate text-[11px] text-readable-secondary'>
            Next: {flowProgress?.nextStepLabel || 'Completed'}
          </p>
        </div>
        <span className='shrink-0 rounded-md bg-[#8d775e]/10 px-2 py-1 text-[11px] font-semibold text-[#8d775e]'>
          {percent}%
        </span>
      </div>

      <div className='mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10'>
        <div
          className='h-full bg-[#8d775e] transition-all duration-300'
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol
        className={`grid gap-1.5 ${variant === 'panel' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-4 md:grid-cols-8'}`}
      >
        {PROJECT_FLOW_STEPS.map((step) => {
          const completed = completedSet.has(step.id)
          const isCurrent = flowProgress?.currentStepId === step.id

          return (
            <li key={step.id}>
              <button
                type='button'
                onClick={() => onStepClick?.(step.id)}
                className={`flex w-full items-center gap-1 rounded-md border px-2 py-1 text-left transition ${
                  completed || isCurrent
                    ? 'border-[#8d775e]/35 bg-[#8d775e]/10'
                    : 'border-gray-200 bg-gray-50/80 dark:border-white/10 dark:bg-white/5'
                } ${onStepClick ? 'hover:bg-[#8d775e]/12' : ''}`}
              >
                <span
                  className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${
                    completed || isCurrent ? 'bg-[#8d775e]' : 'bg-gray-300 dark:bg-white/20'
                  }`}
                />
                <span
                  className={`truncate text-[10px] ${
                    isCurrent
                      ? 'font-semibold text-readable-primary'
                      : 'text-readable-secondary'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default ProjectFlowIndicator
