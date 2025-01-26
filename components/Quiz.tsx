import React, { useState, useEffect } from 'react';
import { Question, SelectedOption } from '../types';
import QuestionComponent from './QuestionComponent';

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
      <div className="bg-white rounded-lg shadow-lg p-8">
        {recommendedCourse ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Recommended Course
            </h2>
            <p className="text-xl text-accent font-semibold">
              {recommendedCourse}
            </p>
          </div>
        ) : (
          <>
            <QuestionComponent
              questions={currentQuestions}
              onSubmit={handleNext}
              showEmail={showEmail}
              email={email}
              setEmail={setEmail}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz; 