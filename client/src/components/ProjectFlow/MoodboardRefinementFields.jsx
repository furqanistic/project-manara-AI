import React from 'react'

const MoodboardRefinementFields = ({ value, onChange }) => {
  const nextValue = value || {
    budgetRange: '',
    stylePreference: '',
    lightingMood: '',
    colorPreference: '',
  }

  const update = (field, fieldValue) => {
    onChange?.({ ...nextValue, [field]: fieldValue })
  }

  return (
    <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
      <input
        value={nextValue.budgetRange}
        onChange={(e) => update('budgetRange', e.target.value)}
        placeholder='Budget range (optional)'
        className='rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
      />
      <input
        value={nextValue.stylePreference}
        onChange={(e) => update('stylePreference', e.target.value)}
        placeholder='Style preference (optional)'
        className='rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
      />
      <input
        value={nextValue.lightingMood}
        onChange={(e) => update('lightingMood', e.target.value)}
        placeholder='Lighting mood (optional)'
        className='rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
      />
      <input
        value={nextValue.colorPreference}
        onChange={(e) => update('colorPreference', e.target.value)}
        placeholder='Color preference (optional)'
        className='rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
      />
    </div>
  )
}

export default MoodboardRefinementFields
