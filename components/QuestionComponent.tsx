import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface Props {
  questions: Question[];
  onSubmit: (selectedOptions: any[]) => void;
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

  const handleSubmit = () => {
    const newErrors = new Set<number>();
    
    questions.forEach(question => {
      if (!question.conditional) {
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
      {questions.map(question => (
        <div
          key={question.id}
          className={`p-4 rounded-lg ${
            errors.has(question.id) ? 'border-2 border-red-500' : 'border border-gray-200'
          }`}
        >
          <p className="font-semibold text-gray-800 mb-3">
            {question.question}
          </p>
          <div className="space-y-2">
            {question.options.map(option => (
              <label key={option.id} className="flex items-center space-x-3">
                <input
                  type={question.inputType || 'radio'}
                  name={`question-${question.id}`}
                  value={option.id}
                  onChange={(e) => handleOptionChange(question.id, e.target.value, e.target.checked)}
                  className="form-checkbox h-4 w-4 text-accent"
                />
                <span className="text-gray-700">{option.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {showEmail && (
        <div className="mt-4">
          <label className="block text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-accent focus:border-accent"
            placeholder="Enter your email"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {questions[0]?.inputType === 'checkbox' ? 'Submit' : 'Next'}
      </button>
    </div>
  );
};

export default QuestionComponent; 