import React from 'react';
import { FileText, Search, Brain, CheckCircle, Clock } from 'lucide-react';
import { ProcessingState } from '../types';

interface ProcessingStatusProps {
  processingState: ProcessingState;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  processingState,
}) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'uploading':
        return <FileText className="w-6 h-6" />;
      case 'extracting':
        return <Search className="w-6 h-6" />;
      case 'analyzing':
        return <Brain className="w-6 h-6" />;
      case 'generating':
        return <Brain className="w-6 h-6" />;
      case 'complete':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'complete':
        return 'text-emerald-600';
      default:
        return 'text-blue-600';
    }
  };

  const stages = [
    { key: 'uploading', label: 'Upload', description: 'Uploading PDF document' },
    { key: 'extracting', label: 'Extract', description: 'Extracting text content' },
    { key: 'analyzing', label: 'Analyze', description: 'Analyzing topics and structure' },
    { key: 'generating', label: 'Generate', description: 'Creating summary and questions' },
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.key === processingState.stage);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Document</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Analyzing Your PDF
          </h2>
          <p className="text-gray-600">
            Our AI is working hard to understand your document and create the best learning experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700">{processingState.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${processingState.progress}%` }}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-white rounded-full ${getStageColor(processingState.stage)}`}>
              {getStageIcon(processingState.stage)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg">
                {processingState.message}
              </h3>
              {processingState.estimatedTime && processingState.estimatedTime > 0 && (
                <div className="flex items-center space-x-1 text-gray-600 text-sm mt-1">
                  <Clock className="w-4 h-4" />
                  <span>Estimated time remaining: ~{processingState.estimatedTime} minute{processingState.estimatedTime !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stages.map((stage, index) => {
            const currentIndex = getCurrentStageIndex();
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div
                key={stage.key}
                className={`text-center p-4 rounded-xl transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-50 border border-emerald-200'
                    : isCurrent
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-600'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <h4 className={`font-semibold text-sm ${
                  isCompleted
                    ? 'text-emerald-700'
                    : isCurrent
                    ? 'text-blue-700'
                    : 'text-gray-500'
                }`}>
                  {stage.label}
                </h4>
                <p className={`text-xs mt-1 ${
                  isCompleted
                    ? 'text-emerald-600'
                    : isCurrent
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}>
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Processing Tips */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-2">💡 Processing Tips</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Larger documents may take several minutes to process completely</li>
            <li>• Our AI analyzes content depth to determine the optimal number of quiz questions</li>
            <li>• Complex topics will generate more detailed explanations</li>
            <li>• Keep this tab open during processing for the best experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
};