import React from 'react';
import { Trophy, Target, Award, RotateCcw, TrendingUp, BookOpen } from 'lucide-react';
import { ScoreData } from '../types';

interface ScoreDisplayProps {
  scoreData: ScoreData;
  onRestart: () => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  scoreData,
  onRestart,
}) => {
  const { score, total, percentage, topicBreakdown = [] } = scoreData;

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding Performance!", color: "text-emerald-600", icon: Trophy };
    if (percentage >= 80) return { message: "Excellent Work!", color: "text-blue-600", icon: Award };
    if (percentage >= 70) return { message: "Good Job!", color: "text-purple-600", icon: Target };
    if (percentage >= 60) return { message: "Well Done!", color: "text-amber-600", icon: Target };
    return { message: "Keep Learning!", color: "text-red-600", icon: BookOpen };
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Main Score Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">
            <PerformanceIcon className={`w-8 h-8 ${performance.color}`} />
          </div>
        </div>

        <h2 className={`text-3xl font-bold mb-2 ${performance.color}`}>
          {performance.message}
        </h2>
        
        <div className="mb-6">
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {score} / {total}
          </div>
          <div className="text-lg text-gray-600">
            {percentage}% Correct
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
              className={`transition-all duration-1000 ease-in-out ${
                percentage >= 80 ? 'text-emerald-500' : 
                percentage >= 60 ? 'text-blue-500' : 'text-amber-500'
              }`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-600">{score}</div>
            <div className="text-sm text-emerald-600">Correct</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-600">{total - score}</div>
            <div className="text-sm text-red-600">Incorrect</div>
          </div>
        </div>
      </div>

      {/* Topic Performance Breakdown */}
      {topicBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Performance by Topic</h3>
          </div>
          
          <div className="space-y-4">
            {topicBreakdown.map((topic, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-800">{topic.topic}</h4>
                  <span className="text-sm font-medium text-gray-600">
                    {topic.correct}/{topic.total} ({topic.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      topic.percentage >= 80 ? 'bg-emerald-500' :
                      topic.percentage >= 60 ? 'bg-blue-500' :
                      topic.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">📚 Learning Insights</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Strengths:</h4>
            <ul className="text-blue-700 space-y-1">
              {topicBreakdown
                .filter(t => t.percentage >= 70)
                .slice(0, 3)
                .map((topic, i) => (
                  <li key={i}>• Strong understanding of {topic.topic}</li>
                ))}
              {topicBreakdown.filter(t => t.percentage >= 70).length === 0 && (
                <li>• Keep practicing to build stronger foundations</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">Areas for Improvement:</h4>
            <ul className="text-purple-700 space-y-1">
              {topicBreakdown
                .filter(t => t.percentage < 70)
                .slice(0, 3)
                .map((topic, i) => (
                  <li key={i}>• Review concepts in {topic.topic}</li>
                ))}
              {topicBreakdown.filter(t => t.percentage < 70).length === 0 && (
                <li>• Excellent performance across all topics!</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Analyze Another Document</span>
        </button>
      </div>
    </div>
  );
};