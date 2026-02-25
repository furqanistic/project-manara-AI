import React from 'react'

const BrandSpinner = ({
  size = 64,
  iconSize = 32,
  ringClassName = 'border-t-2',
  label = '',
  labelClassName = 'text-[10px] font-black uppercase tracking-[0.3em] animate-pulse',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className='relative flex items-center justify-center' style={{ width: size, height: size }}>
        <div className={`absolute inset-0 rounded-full border-[#8d775e] ${ringClassName} animate-spin`} />
        <img src='/logoicon.png' alt='Loading' style={{ width: iconSize, height: iconSize }} className='object-contain animate-pulse' />
      </div>
      {label ? <p className={labelClassName}>{label}</p> : null}
    </div>
  )
}

export default BrandSpinner
