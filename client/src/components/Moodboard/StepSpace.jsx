// File: project-manara-AI/client/src/components/Moodboard/StepSpace.jsx

import {
  BRAND_COLOR,
  BRAND_COLOR_DARK,
  BRAND_COLOR_LIGHT,
  SPACE_TYPES,
} from "./Moodboardconfig";

import { Sofa, Home, ChefHat, Utensils, Lightbulb, Layers } from "lucide-react";
import {motion} from "framer-motion";
import { CheckCircle2 } from "lucide-react";
export const StepSpace = ({ selectedSpace, setSelectedSpace }) => {
  const IconMap = {
    Sofa: Sofa,
    Home: Home,
    ChefHat: ChefHat,
    Utensils: Utensils,
    Lightbulb: Lightbulb,
    Layers: Layers,
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          What space are you decorating?
        </h2>
        <p className="text-lg text-gray-600">
          Select the room or area for your design project
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SPACE_TYPES.map((space) => {
          const IconComponent = IconMap[space.icon] || Home;

          return (
            <motion.button
              key={space.name}
              onClick={() => setSelectedSpace(space.name)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-6 rounded-2xl border-2 transition-all text-center group overflow-hidden`}
              style={{
                borderColor:
                  selectedSpace === space.name ? BRAND_COLOR : "#e5e7eb",
                backgroundColor:
                  selectedSpace === space.name
                    ? `${BRAND_COLOR}10`
                    : "transparent",
              }}
            >
              {selectedSpace === space.name && (
                <motion.div
                  layoutId="selected-space"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_COLOR}15, ${BRAND_COLOR_LIGHT}15)`,
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative z-10">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all shadow-lg`}
                  style={{
                    backgroundColor:
                      selectedSpace === space.name ? BRAND_COLOR : "#f3f4f6",
                    color: selectedSpace === space.name ? "white" : "#6b7280",
                  }}
                >
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {space.name}
                </h3>
                <p className="text-sm text-gray-500">{space.description}</p>
              </div>

              {selectedSpace === space.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 z-20"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: BRAND_COLOR_DARK }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
