// File: client/src/components/Moodboard/MoodboardDetails.jsx
import { motion } from 'framer-motion'
import {
  BookOpen,
  Lightbulb,
  Package,
  Ruler,
  Sofa,
  Sun,
  Moon,
  Layers,
  GitBranch,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import React, { useState } from 'react'

// Design Narrative Component
export const DesignNarrativeCard = ({ narrative }) => {
  if (!narrative || !narrative.narrative) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'
    >
      <div className='flex items-center gap-3 mb-4'>
        <div className='p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg'>
          <BookOpen className='w-5 h-5 text-purple-400' />
        </div>
        <h3 className='text-xl font-bold text-white'>Design Narrative</h3>
      </div>

      <div className='space-y-4'>
        <div>
          <p className='text-white/90 text-lg leading-relaxed'>
            {narrative.narrative}
          </p>
        </div>

        {narrative.vibe && (
          <div className='bg-white/5 rounded-lg p-4'>
            <h4 className='text-sm font-semibold text-white/60 mb-2'>Vibe</h4>
            <p className='text-white/80'>{narrative.vibe}</p>
          </div>
        )}

        {narrative.lifestyle && (
          <div className='bg-white/5 rounded-lg p-4'>
            <h4 className='text-sm font-semibold text-white/60 mb-2'>
              Lifestyle
            </h4>
            <p className='text-white/80'>{narrative.lifestyle}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Materials Component
export const MaterialsCard = ({ materials }) => {
  const [expanded, setExpanded] = useState(true)

  if (!materials) return null

  const materialCategories = [
    { key: 'floors', label: 'Flooring', icon: Layers, color: 'amber' },
    { key: 'walls', label: 'Walls', icon: Package, color: 'blue' },
    { key: 'tiles', label: 'Tiles', icon: Layers, color: 'teal' },
    { key: 'fabrics', label: 'Fabrics', icon: Package, color: 'pink' },
    { key: 'metals', label: 'Metals', icon: Package, color: 'gray' },
    { key: 'woods', label: 'Woods', icon: Package, color: 'orange' },
  ]

  const hasAnyMaterials = materialCategories.some(
    (cat) => materials[cat.key]?.length > 0
  )

  if (!hasAnyMaterials) return null

  const maintenanceColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className='flex items-center justify-between w-full mb-4'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg'>
            <Package className='w-5 h-5 text-emerald-400' />
          </div>
          <h3 className='text-xl font-bold text-white'>Materials Palette</h3>
        </div>
        {expanded ? (
          <ChevronUp className='w-5 h-5 text-white/60' />
        ) : (
          <ChevronDown className='w-5 h-5 text-white/60' />
        )}
      </button>

      {expanded && (
        <div className='grid md:grid-cols-2 gap-4'>
          {materialCategories.map((category) => {
            const items = materials[category.key]
            if (!items || items.length === 0) return null

            return (
              <div
                key={category.key}
                className='bg-white/5 rounded-xl p-4 space-y-3'
              >
                <div className='flex items-center gap-2 mb-3'>
                  <category.icon
                    className={`w-4 h-4 text-${category.color}-400`}
                  />
                  <h4 className='font-semibold text-white'>{category.label}</h4>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className='bg-white/5 rounded-lg p-3 space-y-2'
                  >
                    <div className='font-medium text-white'>{item.type}</div>
                    {item.finish && (
                      <div className='text-sm text-white/60'>
                        Finish: {item.finish}
                      </div>
                    )}
                    {item.color && (
                      <div className='text-sm text-white/60'>
                        Color: {item.color}
                      </div>
                    )}
                    {item.texture && (
                      <div className='text-sm text-white/60'>
                        Texture: {item.texture}
                      </div>
                    )}
                    {item.maintenance && (
                      <div
                        className={`text-sm font-medium ${
                          maintenanceColors[item.maintenance]
                        }`}
                      >
                        Maintenance: {item.maintenance.toUpperCase()}
                      </div>
                    )}
                    {item.source && (
                      <div className='text-xs text-white/50 mt-2'>
                        Source: {item.source}
                      </div>
                    )}
                    {item.notes && (
                      <div className='text-xs text-white/60 italic mt-1'>
                        {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// Furniture Component
export const FurnitureCard = ({ furniture }) => {
  const [expanded, setExpanded] = useState(true)

  if (!furniture || !furniture.heroPieces?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className='flex items-center justify-between w-full mb-4'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg'>
            <Sofa className='w-5 h-5 text-indigo-400' />
          </div>
          <h3 className='text-xl font-bold text-white'>Key Furniture Pieces</h3>
        </div>
        {expanded ? (
          <ChevronUp className='w-5 h-5 text-white/60' />
        ) : (
          <ChevronDown className='w-5 h-5 text-white/60' />
        )}
      </button>

      {expanded && (
        <div className='space-y-6'>
          {/* Hero Pieces */}
          <div>
            <h4 className='text-lg font-semibold text-white mb-3 flex items-center gap-2'>
              <span className='w-2 h-2 bg-yellow-400 rounded-full'></span>
              Must-Have Pieces
            </h4>
            <div className='grid md:grid-cols-2 gap-4'>
              {furniture.heroPieces.map((piece, idx) => (
                <div
                  key={idx}
                  className='bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 space-y-3 border border-yellow-400/20'
                >
                  <div>
                    <div className='font-bold text-white text-lg'>
                      {piece.name}
                    </div>
                    <div className='text-sm text-white/50 capitalize'>
                      {piece.category}
                    </div>
                  </div>

                  {piece.dimensions && (
                    <div className='flex items-center gap-2 text-sm text-white/70'>
                      <Ruler className='w-4 h-4' />
                      <span>
                        {piece.dimensions.length}x{piece.dimensions.width}x
                        {piece.dimensions.height} {piece.dimensions.unit || 'cm'}
                      </span>
                    </div>
                  )}

                  {piece.scaleNotes && (
                    <div className='text-sm text-white/60 italic'>
                      {piece.scaleNotes}
                    </div>
                  )}

                  {piece.placement && (
                    <div className='text-sm text-white/70'>
                      Placement: {piece.placement}
                    </div>
                  )}

                  {piece.source && (
                    <div className='text-xs text-white/50 pt-2 border-t border-white/10'>
                      {piece.brand && `${piece.brand} - `}
                      {piece.source}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Alternates */}
          {furniture.alternates && furniture.alternates.length > 0 && (
            <div>
              <h4 className='text-lg font-semibold text-white mb-3 flex items-center gap-2'>
                <span className='w-2 h-2 bg-blue-400 rounded-full'></span>
                Alternative Options
              </h4>
              <div className='grid md:grid-cols-2 gap-4'>
                {furniture.alternates.map((piece, idx) => (
                  <div
                    key={idx}
                    className='bg-white/5 rounded-xl p-4 space-y-3'
                  >
                    <div>
                      <div className='font-bold text-white'>{piece.name}</div>
                      <div className='text-sm text-white/50 capitalize'>
                        {piece.category}
                      </div>
                    </div>

                    {piece.dimensions && (
                      <div className='flex items-center gap-2 text-sm text-white/70'>
                        <Ruler className='w-4 h-4' />
                        <span>
                          {piece.dimensions.length}x{piece.dimensions.width}x
                          {piece.dimensions.height}{' '}
                          {piece.dimensions.unit || 'cm'}
                        </span>
                      </div>
                    )}

                    {piece.source && (
                      <div className='text-xs text-white/50'>
                        {piece.brand && `${piece.brand} - `}
                        {piece.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Lighting Concept Component
export const LightingConceptCard = ({ lightingConcept }) => {
  const [expanded, setExpanded] = useState(true)

  if (!lightingConcept) return null

  const hasLighting =
    lightingConcept.ambient?.length > 0 ||
    lightingConcept.task?.length > 0 ||
    lightingConcept.accent?.length > 0

  if (!hasLighting && !lightingConcept.dayMood && !lightingConcept.nightMood)
    return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className='flex items-center justify-between w-full mb-4'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg'>
            <Lightbulb className='w-5 h-5 text-yellow-400' />
          </div>
          <h3 className='text-xl font-bold text-white'>Lighting Concept</h3>
        </div>
        {expanded ? (
          <ChevronUp className='w-5 h-5 text-white/60' />
        ) : (
          <ChevronDown className='w-5 h-5 text-white/60' />
        )}
      </button>

      {expanded && (
        <div className='space-y-6'>
          {/* Lighting Types */}
          {hasLighting && (
            <div className='grid md:grid-cols-3 gap-4'>
              {/* Ambient */}
              {lightingConcept.ambient?.length > 0 && (
                <div className='bg-white/5 rounded-xl p-4'>
                  <h4 className='font-semibold text-white mb-3'>Ambient</h4>
                  <div className='space-y-3'>
                    {lightingConcept.ambient.map((light, idx) => (
                      <div key={idx} className='space-y-2'>
                        <div className='text-white/90 font-medium'>
                          {light.name}
                        </div>
                        {light.placement && (
                          <div className='text-sm text-white/60'>
                            {light.placement}
                          </div>
                        )}
                        {light.kelvin && (
                          <div className='text-xs text-white/50'>
                            {light.kelvin}K
                            {light.lumens && ` • ${light.lumens} lumens`}
                          </div>
                        )}
                        {light.notes && (
                          <div className='text-xs text-white/60 italic'>
                            {light.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Task */}
              {lightingConcept.task?.length > 0 && (
                <div className='bg-white/5 rounded-xl p-4'>
                  <h4 className='font-semibold text-white mb-3'>Task</h4>
                  <div className='space-y-3'>
                    {lightingConcept.task.map((light, idx) => (
                      <div key={idx} className='space-y-2'>
                        <div className='text-white/90 font-medium'>
                          {light.name}
                        </div>
                        {light.placement && (
                          <div className='text-sm text-white/60'>
                            {light.placement}
                          </div>
                        )}
                        {light.kelvin && (
                          <div className='text-xs text-white/50'>
                            {light.kelvin}K
                            {light.lumens && ` • ${light.lumens} lumens`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accent */}
              {lightingConcept.accent?.length > 0 && (
                <div className='bg-white/5 rounded-xl p-4'>
                  <h4 className='font-semibold text-white mb-3'>Accent</h4>
                  <div className='space-y-3'>
                    {lightingConcept.accent.map((light, idx) => (
                      <div key={idx} className='space-y-2'>
                        <div className='text-white/90 font-medium'>
                          {light.name}
                        </div>
                        {light.placement && (
                          <div className='text-sm text-white/60'>
                            {light.placement}
                          </div>
                        )}
                        {light.kelvin && (
                          <div className='text-xs text-white/50'>
                            {light.kelvin}K
                            {light.lumens && ` • ${light.lumens} lumens`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Day vs Night Mood */}
          {(lightingConcept.dayMood || lightingConcept.nightMood) && (
            <div className='grid md:grid-cols-2 gap-4'>
              {lightingConcept.dayMood && (
                <div className='bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-xl p-4 border border-orange-400/20'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Sun className='w-5 h-5 text-orange-400' />
                    <h4 className='font-semibold text-white'>Day Mood</h4>
                  </div>
                  <p className='text-white/80 mb-2'>
                    {lightingConcept.dayMood.description}
                  </p>
                  {lightingConcept.dayMood.lightingNotes && (
                    <p className='text-sm text-white/60 italic'>
                      {lightingConcept.dayMood.lightingNotes}
                    </p>
                  )}
                </div>
              )}

              {lightingConcept.nightMood && (
                <div className='bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-400/20'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Moon className='w-5 h-5 text-indigo-400' />
                    <h4 className='font-semibold text-white'>Night Mood</h4>
                  </div>
                  <p className='text-white/80 mb-2'>
                    {lightingConcept.nightMood.description}
                  </p>
                  {lightingConcept.nightMood.lightingNotes && (
                    <p className='text-sm text-white/60 italic'>
                      {lightingConcept.nightMood.lightingNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Zones/Layout Component
export const ZonesCard = ({ zones }) => {
  const [expanded, setExpanded] = useState(true)

  if (!zones || zones.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className='flex items-center justify-between w-full mb-4'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg'>
            <Layers className='w-5 h-5 text-cyan-400' />
          </div>
          <h3 className='text-xl font-bold text-white'>Space Layout & Zones</h3>
        </div>
        {expanded ? (
          <ChevronUp className='w-5 h-5 text-white/60' />
        ) : (
          <ChevronDown className='w-5 h-5 text-white/60' />
        )}
      </button>

      {expanded && (
        <div className='grid md:grid-cols-2 gap-4'>
          {zones.map((zone, idx) => (
            <div
              key={idx}
              className='bg-white/5 rounded-xl p-4 space-y-3 border-l-4 border-cyan-400/50'
            >
              <div className='font-bold text-white text-lg'>{zone.name}</div>

              {zone.purpose && (
                <div className='text-white/70'>
                  <span className='text-white/50 text-sm'>Purpose:</span>{' '}
                  {zone.purpose}
                </div>
              )}

              {zone.focalPoint && (
                <div className='text-white/70'>
                  <span className='text-white/50 text-sm'>Focal Point:</span>{' '}
                  {zone.focalPoint}
                </div>
              )}

              {zone.flowDirection && (
                <div className='text-white/60 text-sm italic'>
                  Flow: {zone.flowDirection}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Variants Component
export const VariantsCard = ({ variants }) => {
  const [expanded, setExpanded] = useState(true)

  if (!variants || variants.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className='flex items-center justify-between w-full mb-4'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg'>
            <GitBranch className='w-5 h-5 text-pink-400' />
          </div>
          <h3 className='text-xl font-bold text-white'>Design Variants</h3>
        </div>
        {expanded ? (
          <ChevronUp className='w-5 h-5 text-white/60' />
        ) : (
          <ChevronDown className='w-5 h-5 text-white/60' />
        )}
      </button>

      {expanded && (
        <div className='grid md:grid-cols-2 gap-4'>
          {variants.map((variant, idx) => (
            <div
              key={idx}
              className='bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 space-y-3 border border-pink-400/20'
            >
              <div className='font-bold text-white text-lg'>{variant.name}</div>

              {variant.description && (
                <p className='text-white/70'>{variant.description}</p>
              )}

              {variant.differences && variant.differences.length > 0 && (
                <div className='space-y-2 mt-4'>
                  <div className='text-sm font-semibold text-white/60'>
                    Key Differences:
                  </div>
                  <ul className='space-y-1'>
                    {variant.differences.map((diff, diffIdx) => (
                      <li
                        key={diffIdx}
                        className='text-sm text-white/70 flex items-start gap-2'
                      >
                        <span className='text-pink-400 mt-1'>•</span>
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
