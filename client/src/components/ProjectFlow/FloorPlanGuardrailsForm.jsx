import React from 'react'

const FloorPlanGuardrailsForm = ({ value, onChange, errors = {} }) => {
  const nextValue = value || {
    dimensions: '',
    ceilingHeight: '',
    windowPlacements: '',
  }

  const update = (field, fieldValue) => {
    onChange?.({ ...nextValue, [field]: fieldValue })
  }

  return (
    <div className='space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5'>
      <div>
        <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d775e]'>Accuracy Guardrails</p>
        <p className='text-xs text-readable-secondary'>Required before 3D generation.</p>
      </div>

      <div>
        <label className='text-xs font-semibold text-readable-secondary'>Dimensions *</label>
        <input
          value={nextValue.dimensions}
          onChange={(e) => update('dimensions', e.target.value)}
          placeholder='e.g. 8m x 12m'
          className='mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
        />
        {errors.dimensions && <p className='mt-1 text-[11px] text-red-500'>{errors.dimensions}</p>}
      </div>

      <div>
        <label className='text-xs font-semibold text-readable-secondary'>Ceiling Height *</label>
        <input
          value={nextValue.ceilingHeight}
          onChange={(e) => update('ceilingHeight', e.target.value)}
          placeholder='e.g. 2.9m'
          className='mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
        />
        {errors.ceilingHeight && <p className='mt-1 text-[11px] text-red-500'>{errors.ceilingHeight}</p>}
      </div>

      <div>
        <label className='text-xs font-semibold text-readable-secondary'>Window Placements *</label>
        <textarea
          value={nextValue.windowPlacements}
          onChange={(e) => update('windowPlacements', e.target.value)}
          placeholder='e.g. North wall: 2 windows, East wall: full-height glazing'
          className='mt-1 min-h-[72px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
        />
        {errors.windowPlacements && <p className='mt-1 text-[11px] text-red-500'>{errors.windowPlacements}</p>}
      </div>
    </div>
  )
}

export default FloorPlanGuardrailsForm
