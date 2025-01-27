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
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [allSelectedOptions, setAllSelectedOptions] = useState<SelectedOption[]>([]);

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

  const handleNext = async (selectedOptions: SelectedOption[]) => {
    if (!isContextQuestions) {
      const score = calculateScore(selectedOptions);
      setTotalScore(score);
      setShowEmail(true);
      
      // Store the first set of answers
      setAllSelectedOptions(selectedOptions);
      
      // Load context questions
      fetch('/context.json')
        .then(response => response.json())
        .then(data => {
          setCurrentQuestions(data);
          setIsContextQuestions(true);
        });
    } else {
      const combinedOptions = [...allSelectedOptions, ...selectedOptions];
      
      // Determine recommended course
      let course = '';
      if (totalScore < 85) course = 'Power BI Essentials';
      else if (totalScore < 120) course = 'Power BI Report Design';
      else if (totalScore < 150) course = 'Power BI Advanced';
      else course = 'Power BI DAX Essentials';
      
      setRecommendedCourse(course);
      
      // Load config questions for reference
      const configQuestions = await fetch('/config.json').then(res => res.json());
      
      // Format answers string
      const answersString = combinedOptions.map(option => {
        const questionId = parseInt(option.name.split('-')[1]);
        const question = isContextQuestions ? 
          currentQuestions.find((q: Question) => q.id === questionId) :
          configQuestions.find((q: Question) => q.id === questionId);
        
        const selectedOption = question?.options.find((opt: { id: number; text: string; score?: number }) => opt.id === parseInt(option.value));
        const allOptions = question?.options
          .filter((opt: { id: number; text: string; score?: number }) => opt.id !== parseInt(option.value))
          .map((option: { text: string }) => option.text)
          .join(', ');
        
        return `For "${question?.question}", they selected: "${selectedOption?.text}". Other options are ${allOptions}.`;
      }).join('\n');
      
      // Make API call to our new endpoint
      try {
        setIsLoading(true);
        const response = await fetch('/api/generate-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score: totalScore,
            course: course,
            answers: answersString
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate message');
        }

        const data = await response.json();
        setAiResponse(data.message);
      } catch (error) {
        console.error('Error generating message:', error);
        setAiResponse('Unable to generate AI response at this time.');
      } finally {
        setIsLoading(false);
      }
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
        <div className="space-y-4">
          {!isLoading && (
            <Card className="border-2 border-[#0E8D7B]/20">
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <BookOpen className="h-6 w-6 text-[#0E8D7B]" />
                  <h3 className="text-xl font-semibold text-[#0E8D7B]">
                    {recommendedCourse}
                  </h3>
                </div>
                <p className="text-gray-600">
                  Based on your responses, we&apos;ve selected the perfect course to help you advance your Power BI skills.
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Response Card */}
          <Card className="border-2 border-[#0E8D7B]/10">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center text-gray-600">
                  <div className="animate-pulse">
                    Calculating
                    <span className="animate-[dots_1s_infinite]">...</span>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700">{aiResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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