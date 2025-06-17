import React from "react";
import Image from "next/image";
import { BookOpen, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface LadderVisualizationProps {
  recommendedCourse: {
    name: string;
    url: string;
  };
  onStartLearning: () => void;
  onStartAgain: () => void;
}

const LadderVisualization: React.FC<LadderVisualizationProps> = ({
  recommendedCourse,
  onStartLearning,
  onStartAgain,
}) => {
  const getImageNumber = (course: string): string => {
    const courseMap: Record<string, string> = {
      "Power BI Essentials": "5",
      "Power BI Service": "4",
      "Power BI Report Design": "3",
      "Power BI Advanced": "2",
      "Power BI DAX Essentials": "1",
    };
    return courseMap[course] || "1";
  };

  if (recommendedCourse) {
    console.log(`Recommended Course: `, recommendedCourse);
  }

  return (
    <div className="relative w-full min-h-[600px] flex flex-col p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-[#F1C714]/5">
      {/* Course Recommendation Section */}
      <div className="text-center mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block mb-4 sm:mb-6"
        >
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#F1C714]/20 to-[#F1C714]/40 blur transition-opacity duration-1000 ease-in-out opacity-75 animate-glow"></div>
          <div className="relative bg-white rounded-full p-3 sm:p-4 shadow-lg">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#F1C714]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2 sm:space-y-3"
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-800">
            {recommendedCourse.name}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto px-4">
            Based on your responses, we've selected the perfect course to help
            you advance your Power BI skills.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4 sm:mt-6 px-4"
        >
          <button
            onClick={onStartLearning}
            className="relative group/btn bg-[#F1C714] hover:bg-[#F1C714]/90 text-black font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full 
            shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 overflow-hidden text-sm sm:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            <span className="relative">Start Learning</span>
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 relative" />
          </button>
          <button
            onClick={onStartAgain}
            className="relative group/btn bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full 
            shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 border border-gray-200 text-sm sm:text-base"
          >
            <span className="relative">Start Again</span>
          </button>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="relative my-4 sm:my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gradient-to-r from-transparent via-yellow-200 to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-white px-4 text-xs text-gray-500 uppercase tracking-wider">
            Your Learning Path
          </div>
        </div>
      </div>

      {/* Ladder Visualization Section */}
      <div className="flex-grow flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mb-4 sm:mb-6"
        >
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Your Current Position
          </h4>
          <p className="text-gray-600 text-xs sm:text-sm px-4">
            This visualization shows where you are on your Power BI learning
            journey
          </p>
        </motion.div>{" "}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="relative flex-grow min-h-[250px] sm:min-h-[300px] lg:min-h-[350px] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 to-transparent rounded-xl"></div>
          <div className="relative flex items-center justify-center w-full h-full z-10">
            <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
              <Image
                src={`/${getImageNumber(recommendedCourse.name)}.png`}
                alt="Your position on the Power BI learning ladder"
                width={300}
                height={400}
                className="object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105 w-full h-auto"
                priority
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  console.log(
                    "Attempted to load:",
                    `/${getImageNumber(recommendedCourse.name)}.png`
                  );
                }}
                onLoad={() => {
                  console.log(
                    "Image loaded successfully:",
                    `/${getImageNumber(recommendedCourse.name)}.png`
                  );
                }}
              />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-yellow-100 mx-4 sm:mx-0">
            <h5 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
              Recommended Starting Point
            </h5>
            <p className="text-xs sm:text-sm text-gray-600">
              You are positioned at the{" "}
              <span className="font-medium text-[#F1C714]">
                {recommendedCourse.name}
              </span>{" "}
              level based on your assessment results.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              <span>Complete this course to advance to the next level</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LadderVisualization;
