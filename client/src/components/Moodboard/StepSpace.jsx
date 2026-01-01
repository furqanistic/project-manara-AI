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
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="w-8 h-[1px] bg-[#8d775e]"></div>
          <span className="text-[9px] font-bold tracking-[0.5em] text-[#8d775e] uppercase">Spatial Definition</span>
          <div className="w-8 h-[1px] bg-[#8d775e]"></div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Select <span className="text-[#8d775e] font-serif italic">Your Canvas.</span>
        </h2>
        <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">
          What environment are we dreaming into existence today?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {SPACE_TYPES.map((space) => {
          const IconComponent = IconMap[space.icon] || Home;
          const isSelected = selectedSpace === space.name;

          return (
            <motion.button
              key={space.name}
              onClick={() => setSelectedSpace(space.name)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-5 rounded-[24px] border transition-all duration-300 text-center group ${
                isSelected 
                  ? "bg-[#8d775e]/10 border-[#8d775e]" 
                  : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-[#8d775e]/30"
              }`}
            >
              <div className="relative z-10">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all ${
                    isSelected 
                      ? "bg-[#8d775e] text-white shadow-lg shadow-[#8d775e]/20" 
                      : "bg-gray-50 dark:bg-black/40 text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-black/60"
                  }`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className={`font-bold text-[13px] transition-colors ${
                  isSelected ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {space.name}
                </h3>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-4 right-4 z-20"
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center bg-[#8d775e] shadow-lg shadow-[#8d775e]/20"
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
