// File: project-manara-AI/client/src/components/Moodboard/StepSpace.jsx

import {
    BRAND_COLOR,
    BRAND_COLOR_DARK,
    BRAND_COLOR_LIGHT,
    SPACE_TYPES,
} from "./Moodboardconfig";

import { motion } from "framer-motion";
import { CheckCircle2, ChefHat, Home, Layers, Lightbulb, Sofa, Utensils } from "lucide-react";
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What space are you decorating?
        </h2>
        <p className="text-base text-gray-500">
          Select the room or area for your design project
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {SPACE_TYPES.map((space) => {
          const IconComponent = IconMap[space.icon] || Home;
          const isSelected = selectedSpace === space.name;

          return (
            <motion.button
              key={space.name}
              onClick={() => setSelectedSpace(space.name)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-3 rounded-xl border transition-all text-center group`}
              style={{
                borderColor: isSelected ? BRAND_COLOR : "#f3f4f6",
                backgroundColor: isSelected ? `${BRAND_COLOR}05` : "#ffffff",
                boxShadow: isSelected 
                  ? `0 10px 20px ${BRAND_COLOR}10` 
                  : "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 transition-all`}
                  style={{
                    backgroundColor: isSelected ? BRAND_COLOR : "#f9fafb",
                    color: isSelected ? "white" : "#9ca3af",
                  }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className={`font-bold text-sm transition-colors ${
                  isSelected ? "text-gray-900" : "text-gray-600"
                }`}>
                  {space.name}
                </h3>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 z-20"
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
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
