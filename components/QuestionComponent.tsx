'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  questions: Question[];
  onSubmit: (selectedOptions: Array<{ name: string; value: string }>) => void;
  showEmail: boolean;
  email: string;
  setEmail: (email: string) => void;
}

const QuestionComponent: React.FC<Props> = ({
  questions,
  onSubmit,
  showEmail,
  email,
  setEmail,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Calculate visible questions when questions prop changes
    const visible = questions.filter(question => {
      if (!question.conditional) return true;
      const dependentQuestionKey = `question-${question.dependsOn?.questionId}`;
      const selectedValue = selectedOptions.get(dependentQuestionKey)?.[0];
      return selectedValue && question.dependsOn?.optionIds.includes(Number(selectedValue));
    });
    setVisibleQuestions(visible);
  }, [questions, selectedOptions]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  const showEmailInput = isLastQuestion && showEmail;

  const handleOptionChange = (questionId: number, value: string, checked: boolean) => {
    const key = `question-${questionId}`;
    const currentValues = selectedOptions.get(key) || [];
    
    if (questions.find(q => q.id === questionId)?.inputType === 'radio') {
      selectedOptions.set(key, [value]);
    } else {
      if (checked) {
        selectedOptions.set(key, [...currentValues, value]);
      } else {
        selectedOptions.set(key, currentValues.filter(v => v !== value));
      }
    }
    setSelectedOptions(new Map(selectedOptions));
    setError(null);
  };

  const handleNext = () => {
    const key = `question-${currentQuestion.id}`;
    if (!selectedOptions.get(key)?.length) {
      setError('Please select an option to continue');
      return;
    }

    if (showEmailInput) {
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    if (isLastQuestion) {
      const formattedOptions = Array.from(selectedOptions.entries()).flatMap(
        ([name, values]) => values.map(value => ({ name, value }))
      );
      onSubmit(formattedOptions);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentQuestionIndex(prev => prev - 1);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8 space-y-2 sm:space-y-0">
        <div className="flex space-x-2 overflow-x-auto py-2 sm:py-0">
          {visibleQuestions.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 sm:h-2 rounded-full w-6 sm:w-8 flex-shrink-0 transition-all duration-300",
                index === currentQuestionIndex
                  ? "bg-[#F1C714]"
                  : index < currentQuestionIndex
                  ? "bg-[#F1C714]/40"
                  : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <span className="text-xs sm:text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {visibleQuestions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {showEmailInput ? (
            <Card className="border-2 border-[#F1C714]/10 shadow-lg">
              <CardContent className="p-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Almost there!</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Please enter your email to receive your personalized recommendations.</p>
                <Label htmlFor="email" className="text-sm sm:text-base text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="mt-2"
                  placeholder="Enter your email"
                />
              </CardContent>
            </Card>
          ) : currentQuestion && (
            <Card className="border-2 border-[#F1C714]/10 shadow-lg">
              <CardContent className="p-4 sm:pt-6">
                <div className="bg-gradient-to-r from-[#F1C714]/10 to-[#F1C714]/5 px-4 sm:px-6 py-3 sm:py-4 rounded-lg mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {currentQuestion.question}
                  </h3>
                </div>

                {currentQuestion.inputType === 'radio' ? (
                  <RadioGroup
                    onValueChange={(value) => handleOptionChange(currentQuestion.id, value, true)}
                    className="space-y-3 sm:space-y-4"
                  >
                    {currentQuestion.options.map(option => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <RadioGroupItem
                          value={option.id.toString()}
                          id={`q${currentQuestion.id}-${option.id}`}
                          className="border-gray-300 text-[#F1C714]"
                        />
                        <Label
                          htmlFor={`q${currentQuestion.id}-${option.id}`}
                          className="text-sm sm:text-base text-gray-700 flex-grow cursor-pointer"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {currentQuestion.options.map(option => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`q${currentQuestion.id}-${option.id}`}
                          value={option.id.toString()}
                          onCheckedChange={(checked) =>
                            handleOptionChange(currentQuestion.id, option.id.toString(), !!checked)
                          }
                          className="border-gray-300 text-[#F1C714]"
                        />
                        <Label
                          htmlFor={`q${currentQuestion.id}-${option.id}`}
                          className="text-sm sm:text-base text-gray-700 flex-grow cursor-pointer"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="flex items-center space-x-2 text-red-500 text-xs sm:text-sm mt-2">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between space-x-3 sm:space-x-4 mt-6 sm:mt-8">
        {currentQuestionIndex > 0 && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="w-1/2 text-sm sm:text-base py-2 sm:py-3"
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          className={cn(
            "bg-[#F1C714] hover:bg-[#F1C714]/90 text-black text-sm sm:text-base py-2 sm:py-3",
            currentQuestionIndex === 0 ? "w-full" : "w-1/2"
          )}
        >
          {isLastQuestion ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionComponent;