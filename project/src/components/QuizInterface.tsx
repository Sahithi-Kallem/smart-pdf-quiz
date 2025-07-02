import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Question } from '../types';

interface QuizInterfaceProps {
  questions: Question[];
  onSubmit: (answers: string[]) => void;
  isSubmitted: boolean;
  score: number | null;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  questions,
  onSubmit,
  isSubmitted,
  score,
}) => {
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    onSubmit(userAnswers);
  };

  const getOptionText = (option: string) => {
    return option.slice(2).trim();
  };

  const getCorrectOptionText = (question: Question) => {
    const correctOption = question.options.find(opt => 
      opt.trim().toUpperCase().startsWith(question.answer.toUpperCase() + '.')
    );
    return correctOption ? getOptionText(correctOption) : '';
  };

  const isAnswerCorrect = (questionIndex: number) => {
    const question = questions[questionIndex];
    const correctText = getCorrectOptionText(question);
    return userAnswers[questionIndex] === correctText;
  };

  const allAnswered = userAnswers.every(answer => answer !== '');

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Knowledge Quiz</h2>
            <p className="text-purple-100">Test your understanding of the document</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{userAnswers.filter(a => a !== '').length} / {questions.length}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ 
                width: `${(userAnswers.filter(a => a !== '').length / questions.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, questionIndex) => {
          const correctText = getCorrectOptionText(question);
          const userAnswer = userAnswers[questionIndex];
          const isCorrect = isAnswerCorrect(questionIndex);

          return (
            <div
              key={questionIndex}
              className={`bg-white rounded-2xl p-6 shadow-lg border transition-all duration-300 ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-200 bg-emerald-50'
                    : userAnswer
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200'
                  : 'border-gray-200 hover:shadow-xl'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start space-x-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isSubmitted
                    ? isCorrect
                      ? 'bg-emerald-100 text-emerald-700'
                      : userAnswer
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {questionIndex + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 flex-1">
                  {question.question}
                </h3>
                {isSubmitted && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : userAnswer ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300" />
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => {
                  const optionText = getOptionText(option);
                  const isSelected = userAnswer === optionText;
                  const isCorrectOption = correctText === optionText;
                  
                  let optionClass = 'border-gray-200 hover:bg-gray-50';
                  
                  if (isSubmitted) {
                    if (isCorrectOption) {
                      optionClass = 'border-emerald-300 bg-emerald-100 text-emerald-800';
                    } else if (isSelected) {
                      optionClass = 'border-red-300 bg-red-100 text-red-800';
                    } else {
                      optionClass = 'border-gray-200 bg-gray-50 text-gray-600';
                    }
                  } else if (isSelected) {
                    optionClass = 'border-blue-300 bg-blue-50 text-blue-800';
                  }

                  return (
                    <label
                      key={optionIndex}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${optionClass} ${
                        isSubmitted ? 'cursor-default' : 'hover:shadow-md'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionText}
                        checked={isSelected}
                        onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                        disabled={isSubmitted}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="flex-1 font-medium">{option}</span>
                      {isSubmitted && isCorrectOption && (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      )}
                      {isSubmitted && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Explanation */}
              {isSubmitted && question.explanation && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 mb-1">Explanation</p>
                      <p className="text-amber-700">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              allAnswered
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
};