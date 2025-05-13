"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Question, SelectedOption, OpenAIResponse } from "../types";
import QuestionComponent from "./QuestionComponent";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Quiz: React.FC = () => {
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [recommendedCourse, setRecommendedCourse] = useState({
    name: "",
    url: "",
  });
  const [aiResponse, setAiResponse] = useState<OpenAIResponse | string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [allSelectedOptions, setAllSelectedOptions] = useState<
    SelectedOption[]
  >([]);

  useEffect(() => {
    // Load initial questions
    fetch("/config.json")
      .then((response) => response.json())
      .then((data) => setCurrentQuestions(data));
  }, []);

  const calculateScore = (selectedOptions: SelectedOption[]) => {
    let score = 0;
    selectedOptions.forEach((option) => {
      const questionId = parseInt(option.name.split("-")[1]);
      const question = currentQuestions.find((q) => q.id === questionId);
      const selectedOption = question?.options.find(
        (o) => o.id === parseInt(option.value)
      );
      if (selectedOption?.score) {
        score += selectedOption.score;
      }
    });
    return score;
  };

  const handleNext = async (selectedOptions: SelectedOption[]) => {
    const score = calculateScore(selectedOptions);
    setTotalScore(score);
    setAllSelectedOptions(selectedOptions);

    try {
      if (email) {
        // If email is provided, proceed to final submission
        const configQuestions = await fetch("/config.json").then((res) =>
          res.json()
        );
        submitFinalAnswers(selectedOptions, configQuestions);
      } else {
        setShowEmail(true);
      }
    } catch (error) {
      console.error("Error loading context questions:", error);
    }
  };

  const submitFinalAnswers = async (
    selectedOptions: SelectedOption[],
    configQuestions?: Question[]
  ) => {
    const combinedOptions = [...allSelectedOptions, ...selectedOptions];    // Determine recommended course based on score
    let course = { name: "", url: "" };
    if (totalScore < 85) {
      course = {
        name: "Power BI Essentials",
        url: "https://powerbitraining.com.au/power-bi-basic-training-course/",
      };
    } else if (totalScore < 120) {
      course = {
        name: "Power BI Report Design",
        url: "https://powerbitraining.com.au/power-bi-report-design-course/",
      };
    } else if (totalScore < 150) {
      course = {
        name: "Power BI Advanced",
        url: "https://powerbitraining.com.au/power-bi-advanced-training-course/",
      };
    } else if (totalScore < 180) {
      course = {
        name: "Power BI DAX Essentials",
        url: "https://powerbitraining.com.au/dax-course/",
      };
    } else {
      course = {
        name: "Power BI Service",
        url: "https://powerbitraining.com.au/power-bi-service-course/",
      };
    }

    setRecommendedCourse(course);

    try {
      // If configQuestions wasn't passed, fetch it
      if (!configQuestions) {
        configQuestions = await fetch("/config.json").then((res) => res.json());
      }

      // Format answers string
      const answersString = combinedOptions
        .map((option) => {
          const questionId = parseInt(option.name.split("-")[1]);
          const questions = [...configQuestions!, ...currentQuestions];
          const question = questions.find((q: Question) => q.id === questionId);

          if (!question) return ""; // Skip if question not found

          const selectedOption = question.options.find(
            (opt) => opt.id === parseInt(option.value)
          );
          const allOptions = question.options
            .filter((opt) => opt.id !== parseInt(option.value))
            .map((option) => option.text)
            .join(", ");

          return `For "${question.question}", they selected: "${selectedOption?.text}". Other options are ${allOptions}.`;
        })
        .filter((str) => str !== "")
        .join("\n");

      setIsLoading(true);
      const response = await fetch("/api/generate-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: totalScore,
          course: course,
          answers: answersString,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate message");
      }

      const data = await response.json();
      setAiResponse(data.message);
    } catch (error) {
      console.error("Error generating message:", error);
      setAiResponse("Unable to generate AI response at this time.");
    } finally {
      // Scroll to top after setting the recommended course
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setIsLoading(false);
    }
  };

  const handleStartAgain = () => {
    setRecommendedCourse({ name: "", url: "" });
    setAiResponse("");
    setTotalScore(0);
    setAllSelectedOptions([]);
    setShowEmail(false);
    setEmail("");
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 sm:mb-12 text-center"
      >
        {!recommendedCourse.name ? (
          <>
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-[#F1C714]" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                </motion.div>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              Let&apos;s Find Your Perfect Course
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Answer a few questions to get personalized Power BI course
              recommendations
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-[#F1C714]" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                </motion.div>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Your Learning Path is Ready!
            </h2>
          </>
        )}
      </motion.div>

      {recommendedCourse.name ? (
        <motion.div
          className="space-y-6 sm:space-y-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {!isLoading && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition-all duration-1000"></div>
              <Card className="relative overflow-hidden bg-gradient-to-br from-white to-[#F1C714]/5 border-none shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/30 to-transparent animate-shimmer"></div>
                <div className="px-4 sm:px-8 py-6 sm:py-10 relative">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#F1C714]/20 to-[#F1C714]/40 blur transition-opacity duration-1000 ease-in-out opacity-75 animate-glow"></div>
                      <div className="relative bg-white rounded-full p-4 shadow-lg">
                        <BookOpen className="h-8 w-8 text-[#F1C714]" />
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-800 animate-gradient-x transition-all duration-500">
                        {recommendedCourse.name}
                      </h3>
                      <p className="text-gray-600 max-w-2xl">
                        Based on your responses, we've selected the perfect
                        course to help you advance your Power BI skills.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          window.open(recommendedCourse.url, "_blank")
                        }
                        className="relative group/btn bg-[#F1C714] hover:bg-[#F1C714]/90 text-black font-semibold px-8 py-3 rounded-full 
                        shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center space-x-2 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        <span className="relative">Start Learning</span>
                        <Trophy className="h-5 w-5 relative" />
                      </button>
                      <button
                        onClick={handleStartAgain}
                        className="relative group/btn bg-white hover:bg-gray-50 text-gray-800 font-semibold px-8 py-3 rounded-full 
                        shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center space-x-2 border border-gray-200"
                      >
                        <span className="relative">Start Again</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-4 sm:p-8">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2 py-12">
                  <div className="w-3 h-3 bg-[#F1C714] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-[#F1C714] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-[#F1C714] rounded-full animate-bounce"></div>
                </div>
              ) : aiResponse && typeof aiResponse == "object" ? (
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed space-y-6">
                    {typeof aiResponse === "object" ? (
                      <>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {aiResponse.title}
                        </h1>
                        <div className="space-y-6">
                          <section>
                            <h2 className="text-2xl font-semibold text-gray-800">
                              Current Skills Assessment
                            </h2>
                            <p>{aiResponse.currentSkills}</p>
                          </section>
                          <section>
                            <h2 className="text-2xl font-semibold text-gray-800">
                              Course Benefits
                            </h2>
                            <ul className="list-disc pl-6">
                              {aiResponse.courseRecommendation?.benefits.map(
                                (benefit: string, index: number) => (
                                  <li key={index}>{benefit}</li>
                                )
                              )}
                            </ul>
                          </section>
                          <section>
                            <h2 className="text-2xl font-semibold text-gray-800">
                              Learning Outcomes
                            </h2>
                            <ul className="list-disc pl-6">
                              {aiResponse.learningOutcomes?.map(
                                (outcome: string, index: number) => (
                                  <li key={index}>{outcome}</li>
                                )
                              )}
                            </ul>
                          </section>
                          <section>
                            <h2 className="text-2xl font-semibold text-gray-800">
                              Next Steps
                            </h2>
                            <p>{aiResponse.nextSteps}</p>
                          </section>
                        </div>
                      </>
                    ) : (
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm mx-4 sm:mx-0">
          <CardContent className="p-4 sm:p-6">
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
