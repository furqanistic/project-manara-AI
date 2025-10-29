// File: client/src/components/Moodboard/MoodboardDetails.jsx
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Package,
  Sofa,
  Lightbulb,
  Map,
  GitCompare,
  Download,
} from 'lucide-react'
import React, { useState } from 'react'

// Main Moodboard Details with Tabs
export const MoodboardDetailsPanel = ({ moodboard }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!moodboard) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'furniture', label: 'Furniture', icon: Sofa },
    { id: 'lighting', label: 'Lighting', icon: Lightbulb },
    { id: 'layout', label: 'Layout', icon: Map },
    { id: 'variants', label: 'Options', icon: GitCompare },
  ]

  return (
    <div className='w-full'>
      {/* Tab Navigation */}
      <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#947d61] to-[#a68970] text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <Icon className='w-4 h-4' />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab moodboard={moodboard} />}
          {activeTab === 'materials' && (
            <MaterialsTab materials={moodboard.materials} />
          )}
          {activeTab === 'furniture' && (
            <FurnitureTab furniture={moodboard.furniture} />
          )}
          {activeTab === 'lighting' && (
            <LightingTab lightingConcept={moodboard.lightingConcept} />
          )}
          {activeTab === 'layout' && <LayoutTab zones={moodboard.zones} />}
          {activeTab === 'variants' && (
            <VariantsTab variants={moodboard.variants} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Overview Tab
const OverviewTab = ({ moodboard }) => {
  const narrative = moodboard.designNarrative
  const colorPalette = moodboard.colorPalette || []
  const moodDescription =
    moodboard.compositeMoodboard?.metadata?.moodDescription

  return (
    <div className='space-y-6'>
      {/* Design Narrative */}
      {narrative && narrative.narrative && (
        <div className='bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10'>
          <h3 className='text-2xl font-bold text-white mb-4'>
            Design Narrative
          </h3>
          <p className='text-white/90 text-lg leading-relaxed mb-6'>
            {narrative.narrative}
          </p>

          <div className='grid md:grid-cols-2 gap-4'>
            {narrative.vibe && (
              <div className='bg-white/5 rounded-xl p-4'>
                <h4 className='text-sm font-semibold text-[#947d61] mb-2'>
                  The Vibe
                </h4>
                <p className='text-white/80'>{narrative.vibe}</p>
              </div>
            )}
            {narrative.lifestyle && (
              <div className='bg-white/5 rounded-xl p-4'>
                <h4 className='text-sm font-semibold text-[#947d61] mb-2'>
                  Lifestyle Fit
                </h4>
                <p className='text-white/80'>{narrative.lifestyle}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mood & Colors */}
      {(moodDescription || colorPalette.length > 0) && (
        <div className='bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10'>
          {moodDescription && (
            <div className='mb-6'>
              <div className='flex items-center gap-3 mb-3'>
                <h3 className='text-2xl font-bold text-white'>
                  {moodDescription.mood}
                </h3>
                <span className='text-white/60'>• {moodDescription.feeling}</span>
              </div>
              <p className='text-white/80 mb-4'>{moodDescription.description}</p>
              {moodDescription.keywords && (
                <div className='flex flex-wrap gap-2'>
                  {moodDescription.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-[#947d61]/20 border border-[#947d61]/30 rounded-full text-sm text-white/80'
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {colorPalette.length > 0 && (
            <div>
              <h4 className='text-lg font-semibold text-white mb-3'>
                Color Palette
              </h4>
              <div className='grid grid-cols-5 gap-3'>
                {colorPalette.map((color, index) => (
                  <div key={index} className='group'>
                    <div
                      className='w-full aspect-square rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-2'
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} - ${color.hex}`}
                    />
                    <div className='text-center'>
                      <div className='text-xs font-medium text-white/80'>
                        {color.name}
                      </div>
                      <div className='text-xs text-white/50'>{color.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Materials Tab
const MaterialsTab = ({ materials }) => {
  if (!materials) return <EmptyState message='No materials specified' />

  const categories = [
    { key: 'floors', label: 'Flooring', icon: '🏠' },
    { key: 'walls', label: 'Walls', icon: '🎨' },
    { key: 'tiles', label: 'Tiles', icon: '⬜' },
    { key: 'fabrics', label: 'Fabrics', icon: '🧵' },
    { key: 'metals', label: 'Metals', icon: '⚙️' },
    { key: 'woods', label: 'Woods', icon: '🌳' },
  ]

  const maintenanceColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className='grid md:grid-cols-2 gap-6'>
      {categories.map((category) => {
        const items = materials[category.key]
        if (!items || items.length === 0) return null

        return (
          <div
            key={category.key}
            className='bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10'
          >
            <h3 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
              <span className='text-2xl'>{category.icon}</span>
              {category.label}
            </h3>

            <div className='space-y-4'>
              {items.map((item, idx) => (
                <div key={idx} className='bg-white/5 rounded-xl p-4 space-y-2'>
                  <div className='font-semibold text-white text-lg'>
                    {item.type}
                  </div>

                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    {item.finish && (
                      <div className='text-white/70'>
                        <span className='text-white/50'>Finish:</span>{' '}
                        {item.finish}
                      </div>
                    )}
                    {item.color && (
                      <div className='text-white/70'>
                        <span className='text-white/50'>Color:</span> {item.color}
                      </div>
                    )}
                  </div>

                  {item.texture && (
                    <div className='text-sm text-white/70'>
                      <span className='text-white/50'>Texture:</span>{' '}
                      {item.texture}
                    </div>
                  )}

                  {item.maintenance && (
                    <div className='pt-2'>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          maintenanceColors[item.maintenance]
                        }`}
                      >
                        {item.maintenance.toUpperCase()} MAINTENANCE
                      </span>
                    </div>
                  )}

                  {item.source && (
                    <div className='text-xs text-white/50 pt-2 border-t border-white/10'>
                      {item.source}
                    </div>
                  )}

                  {item.notes && (
                    <div className='text-xs text-white/60 italic'>
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Furniture Tab
const FurnitureTab = ({ furniture }) => {
  if (!furniture || !furniture.heroPieces?.length)
    return <EmptyState message='No furniture specified' />

  return (
    <div className='space-y-6'>
      {/* Hero Pieces */}
      <div>
        <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
          <span className='w-3 h-3 bg-yellow-400 rounded-full'></span>
          Must-Have Pieces
        </h3>
        <div className='grid md:grid-cols-2 gap-4'>
          {furniture.heroPieces.map((piece, idx) => (
            <div
              key={idx}
              className='bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-2xl p-5 border border-yellow-400/20'
            >
              <div className='mb-3'>
                <h4 className='font-bold text-white text-xl'>{piece.name}</h4>
                <p className='text-white/60 text-sm capitalize'>
                  {piece.category}
                </p>
              </div>

              {piece.dimensions && (
                <div className='bg-white/10 rounded-lg p-3 mb-3'>
                  <div className='text-sm text-white/50 mb-1'>Dimensions</div>
                  <div className='text-white font-mono'>
                    {piece.dimensions.length} × {piece.dimensions.width} ×{' '}
                    {piece.dimensions.height} {piece.dimensions.unit || 'cm'}
                  </div>
                </div>
              )}

              {piece.scaleNotes && (
                <p className='text-sm text-white/70 mb-3 italic'>
                  "{piece.scaleNotes}"
                </p>
              )}

              <div className='flex items-center justify-between text-sm pt-3 border-t border-white/10'>
                {piece.placement && (
                  <span className='text-white/60'>{piece.placement}</span>
                )}
                {piece.source && (
                  <span className='text-white/50'>
                    {piece.brand && `${piece.brand} • `}
                    {piece.source}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternates */}
      {furniture.alternates && furniture.alternates.length > 0 && (
        <div>
          <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
            <span className='w-3 h-3 bg-blue-400 rounded-full'></span>
            Alternative Options
          </h3>
          <div className='grid md:grid-cols-3 gap-4'>
            {furniture.alternates.map((piece, idx) => (
              <div
                key={idx}
                className='bg-white/5 rounded-xl p-4 border border-white/10'
              >
                <h4 className='font-semibold text-white mb-1'>{piece.name}</h4>
                <p className='text-white/50 text-sm mb-3 capitalize'>
                  {piece.category}
                </p>

                {piece.dimensions && (
                  <div className='text-xs text-white/60 mb-2 font-mono'>
                    {piece.dimensions.length}×{piece.dimensions.width}×
                    {piece.dimensions.height} {piece.dimensions.unit || 'cm'}
                  </div>
                )}

                {piece.source && (
                  <div className='text-xs text-white/50'>
                    {piece.brand && `${piece.brand} • `}
                    {piece.source}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Lighting Tab
const LightingTab = ({ lightingConcept }) => {
  if (!lightingConcept)
    return <EmptyState message='No lighting concept specified' />

  const hasLighting =
    lightingConcept.ambient?.length > 0 ||
    lightingConcept.task?.length > 0 ||
    lightingConcept.accent?.length > 0

  return (
    <div className='space-y-6'>
      {/* Day vs Night */}
      {(lightingConcept.dayMood || lightingConcept.nightMood) && (
        <div className='grid md:grid-cols-2 gap-4'>
          {lightingConcept.dayMood && (
            <div className='bg-gradient-to-br from-orange-500/10 to-yellow-500/5 rounded-2xl p-5 border border-orange-400/20'>
              <div className='text-4xl mb-3'>☀️</div>
              <h3 className='text-xl font-bold text-white mb-2'>Daytime</h3>
              <p className='text-white/80 mb-3'>
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
            <div className='bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-2xl p-5 border border-indigo-400/20'>
              <div className='text-4xl mb-3'>🌙</div>
              <h3 className='text-xl font-bold text-white mb-2'>Nighttime</h3>
              <p className='text-white/80 mb-3'>
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

      {/* Lighting Types */}
      {hasLighting && (
        <div className='grid md:grid-cols-3 gap-4'>
          {lightingConcept.ambient?.length > 0 && (
            <LightingCategory
              title='Ambient'
              lights={lightingConcept.ambient}
              color='blue'
            />
          )}
          {lightingConcept.task?.length > 0 && (
            <LightingCategory
              title='Task'
              lights={lightingConcept.task}
              color='green'
            />
          )}
          {lightingConcept.accent?.length > 0 && (
            <LightingCategory
              title='Accent'
              lights={lightingConcept.accent}
              color='purple'
            />
          )}
        </div>
      )}
    </div>
  )
}

const LightingCategory = ({ title, lights, color }) => {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-400/20',
    green: 'from-green-500/10 to-green-500/5 border-green-400/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-400/20',
  }

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 border`}
    >
      <h4 className='font-bold text-white mb-4'>{title}</h4>
      <div className='space-y-3'>
        {lights.map((light, idx) => (
          <div key={idx} className='bg-white/5 rounded-lg p-3'>
            <div className='font-medium text-white mb-1'>{light.name}</div>
            {light.placement && (
              <div className='text-sm text-white/60 mb-2'>{light.placement}</div>
            )}
            <div className='flex gap-2 text-xs text-white/50'>
              {light.kelvin && <span>{light.kelvin}K</span>}
              {light.lumens && <span>• {light.lumens}lm</span>}
            </div>
            {light.notes && (
              <div className='text-xs text-white/50 mt-2 italic'>
                {light.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Layout Tab
const LayoutTab = ({ zones }) => {
  if (!zones || zones.length === 0)
    return <EmptyState message='No layout zones specified' />

  return (
    <div className='grid md:grid-cols-2 gap-4'>
      {zones.map((zone, idx) => (
        <div
          key={idx}
          className='bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-2xl p-5 border border-cyan-400/20'
        >
          <h3 className='text-xl font-bold text-white mb-3'>{zone.name}</h3>

          <div className='space-y-3'>
            {zone.purpose && (
              <div>
                <div className='text-sm text-white/50 mb-1'>Purpose</div>
                <div className='text-white/80'>{zone.purpose}</div>
              </div>
            )}

            {zone.focalPoint && (
              <div>
                <div className='text-sm text-white/50 mb-1'>Focal Point</div>
                <div className='text-white/80'>{zone.focalPoint}</div>
              </div>
            )}

            {zone.flowDirection && (
              <div className='bg-white/5 rounded-lg p-3'>
                <div className='text-xs text-white/50 mb-1'>Flow</div>
                <div className='text-sm text-white/70 italic'>
                  {zone.flowDirection}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Variants Tab
const VariantsTab = ({ variants }) => {
  if (!variants || variants.length === 0)
    return <EmptyState message='No design variants available' />

  return (
    <div className='grid md:grid-cols-2 gap-6'>
      {variants.map((variant, idx) => (
        <div
          key={idx}
          className='bg-gradient-to-br from-pink-500/10 to-purple-500/5 rounded-2xl p-6 border border-pink-400/20'
        >
          <h3 className='text-2xl font-bold text-white mb-3'>{variant.name}</h3>

          {variant.description && (
            <p className='text-white/80 mb-4'>{variant.description}</p>
          )}

          {variant.differences && variant.differences.length > 0 && (
            <div>
              <div className='text-sm font-semibold text-white/60 mb-3'>
                Key Differences
              </div>
              <ul className='space-y-2'>
                {variant.differences.map((diff, diffIdx) => (
                  <li
                    key={diffIdx}
                    className='flex items-start gap-2 text-white/70'
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
  )
}

// Empty State
const EmptyState = ({ message }) => (
  <div className='text-center py-12 text-white/50'>
    <p>{message}</p>
  </div>
)
