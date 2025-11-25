// File: client/src/components/Moodboard/MoodboardDetails.jsx
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Map, Package, Sofa, TextIcon } from "lucide-react";
import React, { useState } from "react";
import { BRAND_COLOR } from "./Moodboardconfig";

// Main Moodboard Details with Tabs
export const MoodboardDetailsPanel = ({ moodboard }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!moodboard) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: TextIcon },
    { id: "materials", label: "Materials", icon: Package },
    { id: "furniture", label: "Furniture", icon: Sofa },
    { id: "lighting", label: "Lighting", icon: Lightbulb },
    { id: "layout", label: "Layout", icon: Map },
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab moodboard={moodboard} />}
          {activeTab === "materials" && (
            <MaterialsTab materials={moodboard.materials} />
          )}
          {activeTab === "furniture" && (
            <FurnitureTab furniture={moodboard.furniture} />
          )}
          {activeTab === "lighting" && (
            <LightingTab lightingConcept={moodboard.lightingConcept} />
          )}
          {activeTab === "layout" && <LayoutTab zones={moodboard.zones} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ moodboard }) => {
  const narrative = moodboard.designNarrative;
  const colorPalette = moodboard.colorPalette || [];
  const moodDescription =
    moodboard.compositeMoodboard?.metadata?.moodDescription;

  return (
    <div className="space-y-8">
      {/* Design Narrative */}
      {narrative && narrative.narrative && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Design Concept
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-6">
            {narrative.narrative}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {narrative.vibe && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  The Vibe
                </h4>
                <p className="text-gray-800">{narrative.vibe}</p>
              </div>
            )}
            {narrative.lifestyle && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Lifestyle Fit
                </h4>
                <p className="text-gray-800">{narrative.lifestyle}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Mood & Colors */}
      {(moodDescription || colorPalette.length > 0) && (
        <section className="space-y-6">
          {moodDescription && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {moodDescription.mood}
                </h3>
                <p className="text-sm text-gray-600">
                  {moodDescription.feeling}
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                {moodDescription.description}
              </p>
              {moodDescription.keywords && (
                <div className="flex flex-wrap gap-2">
                  {moodDescription.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-700"
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
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                Color Palette
              </h4>
              <div className="grid grid-cols-5 gap-3">
                {colorPalette.map((color, index) => (
                  <div key={index} className="group">
                    <div
                      className="w-full aspect-square rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-transform hover:shadow-md"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} - ${color.hex}`}
                    />
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-900">
                        {color.name}
                      </div>
                      <div className="text-xs text-gray-500">{color.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// Materials Tab
const MaterialsTab = ({ materials }) => {
  if (
    !materials ||
    Object.keys(materials).every(
      (k) => !materials[k] || materials[k].length === 0
    )
  ) {
    return <EmptyState message="No materials specified" />;
  }

  const categories = [
    { key: "floors", label: "Flooring" },
    { key: "walls", label: "Walls" },
    { key: "tiles", label: "Tiles" },
    { key: "fabrics", label: "Fabrics" },
    { key: "metals", label: "Metals" },
    { key: "woods", label: "Woods" },
  ];

  const maintenanceColors = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    high: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const items = materials[category.key];
        if (!items || items.length === 0) return null;

        return (
          <section key={category.key}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {category.label}
            </h3>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="font-semibold text-gray-900 mb-3">
                    {item.type}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    {item.finish && (
                      <div>
                        <span className="text-gray-600">Finish: </span>
                        <span className="text-gray-900">{item.finish}</span>
                      </div>
                    )}
                    {item.color && (
                      <div>
                        <span className="text-gray-600">Color: </span>
                        <span className="text-gray-900">{item.color}</span>
                      </div>
                    )}
                  </div>

                  {item.texture && (
                    <div className="text-sm mb-3">
                      <span className="text-gray-600">Texture: </span>
                      <span className="text-gray-900">{item.texture}</span>
                    </div>
                  )}

                  {item.maintenance && (
                    <div className="mb-3">
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
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      Source: {item.source}
                    </div>
                  )}

                  {item.notes && (
                    <div className="text-xs text-gray-600 mt-2 italic">
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

// Furniture Tab
const FurnitureTab = ({ furniture }) => {
  if (!furniture || !furniture.heroPieces?.length)
    return <EmptyState message="No furniture specified" />;

  return (
    <div className="space-y-8">
      {/* Hero Pieces */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Pieces</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {furniture.heroPieces.map((piece, idx) => (
            <div
              key={idx}
              className="p-5 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 text-base">
                  {piece.name}
                </h4>
                <p className="text-gray-600 text-sm capitalize mt-1">
                  {piece.category}
                </p>
              </div>

              {piece.dimensions && (
                <div className="bg-white rounded p-3 mb-3 border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Dimensions</div>
                  <div className="text-sm font-mono text-gray-900">
                    {piece.dimensions.length} × {piece.dimensions.width} ×{" "}
                    {piece.dimensions.height} {piece.dimensions.unit || "cm"}
                  </div>
                </div>
              )}

              {piece.scaleNotes && (
                <p className="text-sm text-gray-700 mb-3 italic">
                  "{piece.scaleNotes}"
                </p>
              )}

              <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-200">
                {piece.placement && (
                  <span className="text-gray-600">{piece.placement}</span>
                )}
                {piece.source && (
                  <span className="text-gray-500">
                    {piece.brand && `${piece.brand} • `}
                    {piece.source}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alternates */}
      {furniture.alternates && furniture.alternates.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alternative Options
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {furniture.alternates.map((piece, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <h4 className="font-semibold text-gray-900 mb-1">
                  {piece.name}
                </h4>
                <p className="text-gray-600 text-sm mb-3 capitalize">
                  {piece.category}
                </p>

                {piece.dimensions && (
                  <div className="text-xs text-gray-600 mb-2 font-mono">
                    {piece.dimensions.length}×{piece.dimensions.width}×
                    {piece.dimensions.height} {piece.dimensions.unit || "cm"}
                  </div>
                )}

                {piece.source && (
                  <div className="text-xs text-gray-500">
                    {piece.brand && `${piece.brand} • `}
                    {piece.source}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Lighting Tab
const LightingTab = ({ lightingConcept }) => {
  if (!lightingConcept)
    return <EmptyState message="No lighting concept specified" />;

  const hasLighting =
    lightingConcept.ambient?.length > 0 ||
    lightingConcept.task?.length > 0 ||
    lightingConcept.accent?.length > 0;

  return (
    <div className="space-y-8">
      {/* Day vs Night */}
      {(lightingConcept.dayMood || lightingConcept.nightMood) && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lighting Moods
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {lightingConcept.dayMood && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Daytime
                </h4>
                <p className="text-gray-700 text-sm mb-3">
                  {lightingConcept.dayMood.description}
                </p>
                {lightingConcept.dayMood.lightingNotes && (
                  <p className="text-xs text-gray-600 italic">
                    {lightingConcept.dayMood.lightingNotes}
                  </p>
                )}
              </div>
            )}

            {lightingConcept.nightMood && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Nighttime
                </h4>
                <p className="text-gray-700 text-sm mb-3">
                  {lightingConcept.nightMood.description}
                </p>
                {lightingConcept.nightMood.lightingNotes && (
                  <p className="text-xs text-gray-600 italic">
                    {lightingConcept.nightMood.lightingNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lighting Types */}
      {hasLighting && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Light Fixtures
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {lightingConcept.ambient?.length > 0 && (
              <LightingCategory
                title="Ambient"
                lights={lightingConcept.ambient}
              />
            )}
            {lightingConcept.task?.length > 0 && (
              <LightingCategory title="Task" lights={lightingConcept.task} />
            )}
            {lightingConcept.accent?.length > 0 && (
              <LightingCategory
                title="Accent"
                lights={lightingConcept.accent}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
};

const LightingCategory = ({ title, lights }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {lights.map((light, idx) => (
          <div
            key={idx}
            className="bg-white rounded p-3 border border-gray-200"
          >
            <div className="font-medium text-gray-900 text-sm mb-1">
              {light.name}
            </div>
            {light.placement && (
              <div className="text-xs text-gray-600 mb-2">
                {light.placement}
              </div>
            )}
            <div className="flex gap-2 text-xs text-gray-500">
              {light.kelvin && <span>{light.kelvin}K</span>}
              {light.lumens && <span>• {light.lumens}lm</span>}
            </div>
            {light.notes && (
              <div className="text-xs text-gray-600 mt-2 italic">
                {light.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Layout Tab
const LayoutTab = ({ zones }) => {
  if (!zones || zones.length === 0)
    return <EmptyState message="No layout zones specified" />;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {zones.map((zone, idx) => (
        <div
          key={idx}
          className="p-5 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {zone.name}
          </h3>

          <div className="space-y-4">
            {zone.purpose && (
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
                  Purpose
                </div>
                <div className="text-gray-900 text-sm">{zone.purpose}</div>
              </div>
            )}

            {zone.focalPoint && (
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
                  Focal Point
                </div>
                <div className="text-gray-900 text-sm">{zone.focalPoint}</div>
              </div>
            )}

            {zone.flowDirection && (
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
                  Flow
                </div>
                <div className="text-gray-900 text-sm italic">
                  {zone.flowDirection}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Empty State
const EmptyState = ({ message }) => (
  <div className="text-center py-12 text-gray-500">
    <p className="text-sm">{message}</p>
  </div>
);
