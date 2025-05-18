import React from "react";
import Image from "next/image";

interface LadderVisualizationProps {
  recommendedCourse: string;
}

const LadderVisualization: React.FC<LadderVisualizationProps> = ({
  recommendedCourse,
}) => {
  const getImageNumber = (course: string): string => {
    const courseMap: Record<string, string> = {
      "Power BI DAX Essentials": "1",
      "Power BI Advanced": "2",
      "Power BI Report Design": "3",
      "Power BI Service": "4",
      "Power BI Essentials": "5",
    };
    return courseMap[course] || "1";
  };
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Learning Journey</h3>
        <p className="text-gray-600 text-sm">
          This visualization shows where you are on your Power BI learning path and what lies ahead
        </p>
      </div>
      
      <div className="relative flex-grow">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 to-transparent rounded-xl"></div>
        <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
          <Image
            src={`/${getImageNumber(recommendedCourse)}.png`}
            alt="Your position on the Power BI learning ladder"
            fill
            className="object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-yellow-100">
          <h4 className="text-sm font-semibold text-gray-800 mb-1">Current Position</h4>
          <p className="text-sm text-gray-600">
            You are currently at the {recommendedCourse} level. This is your recommended starting point based on your assessment.
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
            Complete this course to advance to the next level
          </p>
        </div>
      </div>
    </div>
  );
};

export default LadderVisualization;
