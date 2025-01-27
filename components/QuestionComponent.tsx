'use client';

import React, { useState } from 'react';
import { Question } from '../types';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  questions: Question[];
  onSubmit: (selectedOptions: Array<{
    name: string;
    value: string;
  }>) => void;
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
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(
    new Map()
  );
  const [errors, setErrors] = useState<Set<number>>(new Set());

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
    
    // Clear error for this question if it exists
    if (errors.has(questionId)) {
      const newErrors = new Set(errors);
      newErrors.delete(questionId);
      setErrors(newErrors);
    }
  };

  const isQuestionVisible = (question: Question) => {
    if (!question.conditional) return true;
    
    const dependentQuestionKey = `question-${question.dependsOn?.questionId}`;
    const selectedValue = selectedOptions.get(dependentQuestionKey)?.[0];
    
    if (!selectedValue) return false;
    
    return question.dependsOn?.optionIds.includes(Number(selectedValue));
  };

  const handleSubmit = () => {
    const newErrors = new Set<number>();
    
    questions.forEach(question => {
      if (!question.conditional || isQuestionVisible(question)) {
        const key = `question-${question.id}`;
        if (!selectedOptions.get(key)?.length) {
          newErrors.add(question.id);
        }
      }
    });

    if (newErrors.size > 0) {
      setErrors(newErrors);
      return;
    }

    const formattedOptions = Array.from(selectedOptions.entries()).flatMap(
      ([name, values]) => values.map(value => ({ name, value }))
    );
    
    onSubmit(formattedOptions);
  };

  return (
    <div className="space-y-6">
      {questions.map(question => {
        if (!isQuestionVisible(question)) return null;

        return (
          <Card
            key={question.id}
            className={cn(
              "transition-all duration-200",
              errors.has(question.id) 
                ? "border-destructive shadow-[0_0_0_1px] shadow-destructive" 
                : "hover:border-primary/50",
              question.conditional && "border-l-4 border-l-[#0E8D7B]"
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                {errors.has(question.id) && (
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="w-full">
                  <div className="bg-[#FFD700] px-4 py-3 rounded-md mb-6">
                    <h3 className="font-bold text-[#1A1A1A]">
                      {question.question}
                    </h3>
                    {question.conditional && (
                      <p className="text-sm text-[#4A4A4A] mt-1 mb-4">
                        This question appears based on your previous answer
                      </p>
                    )}
                  </div>

                  {question.inputType === 'radio' ? (
                    <RadioGroup
                      onValueChange={(value) => 
                        handleOptionChange(question.id, value, true)
                      }
                      className="space-y-3"
                    >
                      {question.options.map(option => (
                        <div key={option.id} className="flex items-center space-x-3">
                          <RadioGroupItem
                            value={option.id.toString()}
                            id={`q${question.id}-${option.id}`}
                            className="border-gray-300 text-[#0E8D7B]"
                          />
                          <Label
                            htmlFor={`q${question.id}-${option.id}`}
                            className="text-gray-700"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-3">
                      {question.options.map(option => (
                        <div key={option.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`q${question.id}-${option.id}`}
                            value={option.id.toString()}
                            onCheckedChange={(checked) =>
                              handleOptionChange(question.id, option.id.toString(), !!checked)
                            }
                            className="border-gray-300 text-[#0E8D7B]"
                          />
                          <Label
                            htmlFor={`q${question.id}-${option.id}`}
                            className="text-gray-700"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {showEmail && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Label htmlFor="email" className="text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
              placeholder="Enter your email"
            />
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        className="w-full bg-[#0E8D7B] hover:bg-[#0E8D7B]/90 text-white"
        size="lg"
      >
        {questions[0]?.inputType === 'checkbox' ? 'Submit' : 'Next'}
      </Button>
    </div>
  );
};

export default QuestionComponent;