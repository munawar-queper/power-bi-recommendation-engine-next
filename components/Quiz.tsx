'use client';

import React, { useState, useEffect } from 'react';
import { Question, SelectedOption } from '../types';
import QuestionComponent from './QuestionComponent';
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, Trophy } from "lucide-react";

const Quiz: React.FC = () => {
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [isContextQuestions, setIsContextQuestions] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [recommendedCourse, setRecommendedCourse] = useState('');

  useEffect(() => {
    // Load initial questions
    fetch('/config.json')
      .then(response => response.json())
      .then(data => setCurrentQuestions(data));
  }, []);

  const calculateScore = (selectedOptions: SelectedOption[]) => {
    let score = 0;
    selectedOptions.forEach(option => {
      const questionId = parseInt(option.name.split('-')[1]);
      const question = currentQuestions.find(q => q.id === questionId);
      const selectedOption = question?.options.find(o => o.id === parseInt(option.value));
      if (selectedOption?.score) {
        score += selectedOption.score;
      }
    });
    return score;
  };

  const handleNext = (selectedOptions: SelectedOption[]) => {
    if (!isContextQuestions) {
      const score = calculateScore(selectedOptions);
      setTotalScore(score);
      setShowEmail(true);
      
      // Load context questions
      fetch('/context.json')
        .then(response => response.json())
        .then(data => {
          setCurrentQuestions(data);
          setIsContextQuestions(true);
        });
    } else {
      // Determine recommended course
      let course = '';
      if (totalScore < 85) course = 'Power BI Essentials';
      else if (totalScore < 120) course = 'Power BI Report Design';
      else if (totalScore < 150) course = 'Power BI Advanced';
      else course = 'Power BI DAX Essentials';
      
      setRecommendedCourse(course);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8 text-center">
        {!recommendedCourse ? (
          <>
            <div className="flex justify-center mb-4">
              <Brain className="h-12 w-12 text-[#0E8D7B]" />
            </div>
            <p className="mt-2 text-gray-600">
              Answer a few questions to get your personalized learning path
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <Trophy className="h-12 w-12 text-[#F5B72F]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your Recommended Learning Path
            </h2>
          </>
        )}
      </div>

      {recommendedCourse ? (
        <Card className="border-2 border-[#0E8D7B]/20">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BookOpen className="h-6 w-6 text-[#0E8D7B]" />
              <h3 className="text-xl font-semibold text-[#0E8D7B]">
                {recommendedCourse}
              </h3>
            </div>
            <p className="text-gray-600">
              Based on your responses, we've selected the perfect course to help you advance your Power BI skills.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <QuestionComponent
              questions={currentQuestions}
              onSubmit={handleNext}
              showEmail={showEmail}
              email={email}
              setEmail={setEmail}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Quiz; 