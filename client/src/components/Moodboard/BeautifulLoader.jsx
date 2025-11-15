// File: project-manara-AI/client/src/components/Moodboard/BeautifulLoader.jsx

import { motion } from "framer-motion";
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from "./Moodboardconfig";
import { CheckCircle2, Sparkles } from "lucide-react";
const BeautifulLoader = ({ progressSteps = [], phase = "image" }) => {
  const imagePhaseSteps = [
    "Creating moodboard draft",
    "Generating image with AI",
    "Extracting color palette",
    "Analyzing design elements",
  ];

  const descriptionPhaseSteps = [
    "Generating design narrative",
    "Selecting materials",
    "Curating furniture pieces",
    "Planning lighting concept",
    "Defining functional zones",
    "Creating design variants",
  ];

  const displaySteps =
    progressSteps.length > 0
      ? progressSteps
      : phase === "image"
      ? imagePhaseSteps
      : descriptionPhaseSteps;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-sm"
    >
      <div className="text-center max-w-md">
        <motion.div
          className="relative w-32 h-32 mx-auto mb-8"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: BRAND_COLOR,
              borderRightColor: BRAND_COLOR_LIGHT,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Middle rotating ring */}
          <motion.div
            className="absolute inset-3 rounded-full border-4 border-transparent"
            style={{
              borderBottomColor: BRAND_COLOR_LIGHT,
              borderLeftColor: BRAND_COLOR,
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Inner pulsing circle */}
          <motion.div
            className="absolute inset-6 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          {/* Orbiting dots */}
          {[0, 120, 240].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: BRAND_COLOR,
                top: "50%",
                left: "50%",
                transformOrigin: "0 0",
              }}
              animate={{
                rotate: [angle, angle + 360],
                x: [40, 40],
                y: [-1.5, -1.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            {phase === "image"
              ? "Generating Your Moodboard"
              : "Enriching Design Details"}
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            {phase === "image"
              ? "Creating your perfect design image..."
              : "Adding materials, furniture, lighting details..."}
          </p>

          {/* Backend progress steps - vertical list with status */}
          <div className="mb-8 max-h-64 overflow-y-auto px-4 py-2 bg-black/30 rounded-lg">
            <div className="space-y-3">
              {displaySteps.map((step, i) => {
                const isCompleted =
                  progressSteps.includes(step) &&
                  progressSteps.indexOf(step) < progressSteps.length - 1;
                const isActive =
                  progressSteps[progressSteps.length - 1] === step;
                const isPending = !progressSteps.includes(step);

                return (
                  <motion.div
                    key={step}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      backgroundColor: isActive
                        ? `${BRAND_COLOR}20`
                        : isCompleted
                        ? `${BRAND_COLOR}10`
                        : "transparent",
                    }}
                  >
                    <div className="flex-shrink-0 w-5">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-center"
                        >
                          <CheckCircle2
                            className="w-5 h-5"
                            style={{ color: BRAND_COLOR }}
                          />
                        </motion.div>
                      ) : isActive ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="flex items-center justify-center"
                        >
                          <div
                            className="w-4 h-4 rounded-full border-2 border-transparent"
                            style={{
                              borderTopColor: BRAND_COLOR,
                              borderRightColor: BRAND_COLOR,
                            }}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium flex-1 text-left transition-colors ${
                        isCompleted || isActive ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {step}
                    </span>
                    {isCompleted && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded"
                      >
                        Done
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Progress percentage and bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-4">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs font-semibold text-white">
                {Math.round((progressSteps.length / displaySteps.length) * 100)}
                %
              </span>
            </div>
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})`,
                }}
                animate={{
                  width: `${
                    (progressSteps.length / displaySteps.length) * 100
                  }%`,
                }}
                transition={{
                  duration: 0.5,
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BeautifulLoader;
