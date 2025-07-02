export interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizData {
  summary: string;
  questions: Question[];
  topics?: string[];
  wordCount?: number;
  pageCount?: number;
}

export interface ScoreData {
  score: number;
  total: number;
  percentage: number;
  detailedResults?: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    topic: string;
  }>;
  topicBreakdown?: Array<{
    topic: string;
    correct: number;
    total: number;
    percentage: number;
  }>;
}

export interface UploadState {
  isUploading: boolean;
  isDragOver: boolean;
  error: string | null;
}

export interface ProcessingState {
  stage: 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete';
  progress: number;
  message: string;
  estimatedTime: number | null;
}