import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Sparkles } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { SummaryDisplay } from './components/SummaryDisplay';
import { QuizInterface } from './components/QuizInterface';
import { ScoreDisplay } from './components/ScoreDisplay';
import { ProcessingStatus } from './components/ProcessingStatus';
import { QuizData, ScoreData, UploadState, ProcessingState } from './types';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentView, setCurrentView] = useState<'upload' | 'processing' | 'summary' | 'quiz' | 'score'>('upload');
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    isDragOver: false,
    error: null,
  });
  const [processingState, setProcessingState] = useState<ProcessingState>({
    stage: 'idle',
    progress: 0,
    message: '',
    estimatedTime: null,
  });
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadState(prev => ({ ...prev, error: null }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadState(prev => ({ ...prev, isUploading: true, error: null }));
    setCurrentView('processing');
    
    const formData = new FormData();
    formData.append('pdf', file);

    // Calculate estimated processing time based on file size
    const fileSizeMB = file.size / (1024 * 1024);
    const estimatedMinutes = Math.max(1, Math.ceil(fileSizeMB / 5)); // ~1 minute per 5MB
    
    setProcessingState({
      stage: 'uploading',
      progress: 10,
      message: 'Uploading PDF document...',
      estimatedTime: estimatedMinutes,
    });

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for large files
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProcessingState(prev => ({
              ...prev,
              progress: Math.min(30, uploadProgress * 0.3), // Upload is 30% of total process
              message: `Uploading... ${uploadProgress}%`,
            }));
          }
        },
      });

      // Simulate processing stages for better UX
      setProcessingState({
        stage: 'extracting',
        progress: 40,
        message: 'Extracting text from PDF...',
        estimatedTime: estimatedMinutes - 1,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingState({
        stage: 'analyzing',
        progress: 60,
        message: 'Analyzing content and identifying topics...',
        estimatedTime: Math.max(0, estimatedMinutes - 2),
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      setProcessingState({
        stage: 'generating',
        progress: 85,
        message: 'Generating comprehensive summary and quiz questions...',
        estimatedTime: Math.max(0, estimatedMinutes - 3),
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { summary, questions, topics, wordCount, pageCount } = response.data;
      
      setQuizData({ 
        summary, 
        questions, 
        topics: topics || [], 
        wordCount: wordCount || 0,
        pageCount: pageCount || 0 
      });
      setUserAnswers(new Array(questions.length).fill(''));
      
      setProcessingState({
        stage: 'complete',
        progress: 100,
        message: `Successfully processed ${pageCount || 'multiple'} pages and generated ${questions.length} questions!`,
        estimatedTime: 0,
      });

      setTimeout(() => {
        setCurrentView('summary');
        setIsQuizSubmitted(false);
        setScoreData(null);
      }, 1500);

    } catch (error: any) {
      console.error('Upload failed:', error);
      let errorMessage = 'Upload failed! Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Processing timeout. Please try with a smaller file or check your connection.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please try with a smaller PDF (recommended: under 50MB).';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setUploadState(prev => ({ ...prev, error: errorMessage }));
      setCurrentView('upload');
    } finally {
      setUploadState(prev => ({ ...prev, isUploading: false }));
      setProcessingState({
        stage: 'idle',
        progress: 0,
        message: '',
        estimatedTime: null,
      });
    }
  };

  const handleStartQuiz = () => {
    setCurrentView('quiz');
  };

  const handleQuizSubmit = (answers: string[]) => {
    if (!quizData) return;

    let correctAnswers = 0;
    const detailedResults = quizData.questions.map((question, index) => {
      const correctOption = question.options.find(opt => 
        opt.trim().toUpperCase().startsWith(question.answer.toUpperCase() + '.')
      );
      const correctText = correctOption ? correctOption.slice(2).trim() : '';
      const isCorrect = answers[index] === correctText;
      
      if (isCorrect) correctAnswers++;
      
      return {
        question: question.question,
        userAnswer: answers[index],
        correctAnswer: correctText,
        isCorrect,
        explanation: question.explanation,
        topic: question.topic || 'General',
      };
    });

    const score: ScoreData = {
      score: correctAnswers,
      total: quizData.questions.length,
      percentage: Math.round((correctAnswers / quizData.questions.length) * 100),
      detailedResults,
      topicBreakdown: getTopicBreakdown(detailedResults),
    };

    setUserAnswers(answers);
    setScoreData(score);
    setIsQuizSubmitted(true);
    setCurrentView('score');
  };

  const getTopicBreakdown = (results: any[]) => {
    const topics: { [key: string]: { correct: number; total: number } } = {};
    
    results.forEach(result => {
      const topic = result.topic || 'General';
      if (!topics[topic]) {
        topics[topic] = { correct: 0, total: 0 };
      }
      topics[topic].total++;
      if (result.isCorrect) {
        topics[topic].correct++;
      }
    });
    
    return Object.entries(topics).map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100),
    }));
  };

  const handleRestart = () => {
    setFile(null);
    setQuizData(null);
    setCurrentView('upload');
    setUserAnswers([]);
    setIsQuizSubmitted(false);
    setScoreData(null);
    setUploadState({
      isUploading: false,
      isDragOver: false,
      error: null,
    });
    setProcessingState({
      stage: 'idle',
      progress: 0,
      message: '',
      estimatedTime: null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart PDF Quiz Generator
              </h1>
              <p className="text-gray-600 text-sm">
                Transform your PDFs into comprehensive learning experiences
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'upload' && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Advanced AI • Supports Large PDFs</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Upload Your PDF Document
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our enhanced AI can process large documents up to 100MB, analyze complex topics, 
              and generate comprehensive summaries with adaptive quiz questions based on content depth.
            </p>
            <FileUpload
              onFileSelect={handleFileSelect}
              onUpload={handleUpload}
              isUploading={uploadState.isUploading}
              error={uploadState.error}
            />
          </div>
        )}

        {currentView === 'processing' && (
          <ProcessingStatus processingState={processingState} />
        )}

        {currentView === 'summary' && quizData && (
          <div>
            <SummaryDisplay
              summary={quizData.summary}
              topics={quizData.topics}
              wordCount={quizData.wordCount}
              pageCount={quizData.pageCount}
              questionCount={quizData.questions.length}
              onStartQuiz={handleStartQuiz}
            />
          </div>
        )}

        {currentView === 'quiz' && quizData && (
          <div>
            <QuizInterface
              questions={quizData.questions}
              onSubmit={handleQuizSubmit}
              isSubmitted={isQuizSubmitted}
              score={scoreData?.score || null}
            />
          </div>
        )}

        {currentView === 'score' && scoreData && (
          <div>
            <ScoreDisplay
              scoreData={scoreData}
              onRestart={handleRestart}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>© 2025 Smart PDF Quiz Generator - Enhanced for comprehensive document analysis</p>
        </div>
      </footer>
    </div>
  );
}

export default App;