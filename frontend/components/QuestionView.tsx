
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Lightbulb, Pause, Clock, BookOpen, AlertCircle, Eye, Lock, Minus, Plus } from 'lucide-react';
import { questions } from '../data/questions';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const INITIAL_TIMER = 60;
const TIMER_STEP = 5;
const MIN_TIMER = 0;
const MAX_TIMER = 600;

const QuestionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progress, submitAnswer } = useProgress();
  const { isAuthenticated } = useAuth();
  
  // Parse and validate question ID from URL
  const questionId = parseInt(id || '0', 10);
  
  // Find the question - use strict equality and ensure we get the exact match
  const question = questions.find(q => q.id === questionId);
  
  // If question not found, try to find by index as fallback (shouldn't happen, but defensive)
  if (!question && questionId > 0 && questionId <= questions.length) {
    console.warn(`Question with ID ${questionId} not found, but ID is within valid range`);
  }
  
  // Find next and previous questions by sorting all questions by ID first
  const sortedQuestions = [...questions].sort((a, b) => a.id - b.id);
  const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);
  const nextQuestionId = currentIndex >= 0 && currentIndex < sortedQuestions.length - 1 
    ? sortedQuestions[currentIndex + 1].id 
    : undefined;
  const prevQuestionId = currentIndex > 0 
    ? sortedQuestions[currentIndex - 1].id 
    : undefined;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState(0); 
  const [showExplanation, setShowExplanation] = useState(false);
  const [givenUp, setGivenUp] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // Timer State
  const [remainingTime, setRemainingTime] = useState(INITIAL_TIMER);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Load existing state if available - use the actual question's ID
  const actualQuestionId = question?.id ?? questionId;
  const existingAttempt = progress.solvedQuestions[actualQuestionId];
  const isAnswered = !!existingAttempt;
  const isCorrectlyAnswered = existingAttempt?.correct === true;
  const isIncorrectlyAnswered = existingAttempt && !existingAttempt.correct;
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    // Reset state when changing questions - ensure we use the correct question ID
    const currentQuestionId = question?.id ?? questionId;
    const attempt = progress.solvedQuestions[currentQuestionId];
    
    // Reset retry state when question changes
    setIsRetrying(false);
    
    if (attempt && !isRetrying) {
      setSelectedOption(attempt.attemptedOption);
      setShowExplanation(attempt.correct); 
      setGivenUp(false);
      setHintIndex(attempt.usedHint ? 2 : 0);
    } else {
      setSelectedOption(null);
      setShowExplanation(false);
      setGivenUp(false);
      setHintIndex(0);
      setRemainingTime(INITIAL_TIMER);
      setIsRunning(false);
    }
  }, [questionId, question?.id, progress.solvedQuestions, isRetrying]);

  useEffect(() => {
    if (!isRunning) {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return;
    }

    timerRef.current = window.setInterval(() => {
        setRemainingTime(prev => {
            if (prev <= 1) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setIsRunning(false);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
  }, [isRunning]);

  if (!question) {
    return <div className="p-8 text-center">Question not found.</div>;
  }

  const handleSubmit = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (!question) {
      console.error('Cannot submit: question not found');
      return;
    }

    // Allow submission if: not answered, or retrying an incorrect answer
    const canSubmit = (!isAnswered || (isIncorrectlyAnswered && isRetrying)) && !givenUp;
    
    if (selectedOption && canSubmit) {
      const usedHint = hintIndex > 0;
      const isRetryAttempt = isIncorrectlyAnswered && isRetrying;
      submitAnswer(question, selectedOption, usedHint, isRetryAttempt);
      setIsRunning(false);
      setIsRetrying(false);
      
      if (selectedOption === question.answer) {
        setShowExplanation(true);
      } else {
        setShowExplanation(false);
      }
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setSelectedOption(null);
    setShowExplanation(false);
    setGivenUp(false);
    setHintIndex(0);
    setRemainingTime(INITIAL_TIMER);
    setIsRunning(false);
  };

  const handleGiveUp = () => {
      if (!isAnswered && !givenUp) {
          setGivenUp(true);
          setShowExplanation(true);
          setIsRunning(false); 
      }
  };

  const canUseTimerControls = (!isCorrectlyAnswered || isRetrying) && !givenUp;

  const toggleTimer = () => {
      if (!canUseTimerControls) return;
      if (!isRunning && remainingTime === 0) return;
      setIsRunning(prev => !prev);
  };

  const adjustTimer = (delta: number) => {
      if (!canUseTimerControls) return;
      setRemainingTime(prev => {
          const next = Math.min(Math.max(prev + delta, MIN_TIMER), MAX_TIMER);
          return next;
      });
  };
  
  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const revealHint = () => {
      // Allow hints during retry
      if ((isCorrectlyAnswered && !isRetrying) || givenUp) return;
      if (hintIndex < (question.hints?.length || 0) && hintIndex < 2) {
          setHintIndex(prev => prev + 1);
      }
  };

  const getOptionStyle = (key: string) => {
    // During retry, allow normal selection
    const canSelect = !isCorrectlyAnswered || isRetrying;
    
    if ((canSelect && !givenUp) || isRetrying) {
      return selectedOption === key 
        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
    }

    // Show correct answer in green
    if (key === question.answer) {
      return "border-green-500 bg-green-50 ring-1 ring-green-500"; 
    }
    // Show incorrect selected answer in red (only if not retrying)
    if (selectedOption === key && key !== question.answer && !givenUp && !isRetrying) {
      return "border-red-500 bg-red-50 ring-1 ring-red-500"; 
    }
    return "border-gray-200 opacity-60";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Nav */}
      <div className="mb-6 flex items-center justify-between">
        <button 
            onClick={() => navigate('/problems')}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Problems
        </button>
        <div className="flex space-x-2">
            <button 
                onClick={() => prevQuestionId && navigate(`/question/${prevQuestionId}`)}
                disabled={!prevQuestionId}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
                onClick={() => nextQuestionId && navigate(`/question/${nextQuestionId}`)}
                disabled={!nextQuestionId}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-gray-500 text-xs font-mono uppercase tracking-wide">
                    <span>{question.code}</span>
                    <span>•</span>
                    <span>{question.topic}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Question {question.id}</h2>
            </div>
            
            <div className="flex items-center gap-3">
                 {/* Difficulty Tag */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${question.level === 'easy' ? 'bg-green-100 text-green-700' : 
                    question.level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'}`}>
                    {question.level}
                </span>

                {/* Exam Badge */}
                {question.exam && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        {question.exam}
                    </span>
                )}

                {/* Timer Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => adjustTimer(-TIMER_STEP)}
                        disabled={!canUseTimerControls || remainingTime <= MIN_TIMER}
                        className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Decrease timer"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={toggleTimer}
                        disabled={!canUseTimerControls || remainingTime === 0}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all
                            ${isRunning 
                                ? 'bg-white text-red-600 border-red-200' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                            ${(!canUseTimerControls || remainingTime === 0) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        title="Start/Pause Timer"
                    >
                        {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        <span className="font-mono min-w-[3rem] text-center">
                            {formatTime(remainingTime)}
                        </span>
                    </button>
                    <button
                        onClick={() => adjustTimer(TIMER_STEP)}
                        disabled={!canUseTimerControls || remainingTime >= MAX_TIMER}
                        className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase timer"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>

        <div className="p-8">
            <p className="text-lg text-gray-800 leading-relaxed mb-8">
                {question.question}
            </p>

            <div className="space-y-3">
                {Object.entries(question.options).map(([key, text]) => {
                  const canSelect = (!isCorrectlyAnswered || isRetrying) && !givenUp;
                  return (
                    <div 
                        key={key}
                        onClick={() => canSelect && setSelectedOption(key)}
                        className={`
                            relative flex items-center p-4 border rounded-xl transition-all duration-200
                            ${getOptionStyle(key)}
                            ${canSelect ? 'cursor-pointer' : 'cursor-default'}
                        `}
                    >
                        <div className={`
                            h-5 w-5 rounded-full border flex items-center justify-center mr-4
                            ${selectedOption === key ? 'border-blue-500' : 'border-gray-300'}
                        `}>
                            {selectedOption === key && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                        </div>
                        <span className="font-medium text-gray-700">{text}</span>
                        <span className="absolute right-4 text-xs font-mono text-gray-400 uppercase">{key}</span>
                    </div>
                  );
                })}
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                    {/* Hints Button */}
                    <div className="relative">
                    <button
                        onClick={revealHint}
                        disabled={(isCorrectlyAnswered && !isRetrying) || givenUp || hintIndex >= 2}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                            ${hintIndex > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-gray-500 hover:bg-gray-100'}
                            ${((isCorrectlyAnswered && !isRetrying) || givenUp) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        title="Revealing hints gives 0 points for this question."
                    >
                        <Lightbulb className={`h-4 w-4 ${hintIndex > 0 ? 'fill-yellow-500' : ''}`} />
                        {hintIndex === 0 ? "Show Hint" : `Hint (${hintIndex}/2)`}
                    </button>
                    </div>

                <div className="flex gap-3">
                    {(!isCorrectlyAnswered || isRetrying) && !givenUp && (
                        <button
                            onClick={handleGiveUp}
                            className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm"
                        >
                            Give Up & See Solution
                        </button>
                    )}
                    
                    {/* Show retry button for incorrect answers */}
                    {isIncorrectlyAnswered && !isRetrying && (
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2.5 font-medium rounded-lg shadow-sm transition-colors bg-orange-600 text-white hover:bg-orange-700"
                        >
                            Retry Question
                        </button>
                    )}
                    
                    {((!isCorrectlyAnswered || isRetrying) && !givenUp) ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className={`px-6 py-2.5 font-medium rounded-lg shadow-sm transition-colors
                              ${!selectedOption 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                              }
                            `}
                        >
                          {!isAuthenticated && selectedOption ? (
                             <span className="flex items-center gap-2"><Lock className="h-3 w-3" /> Login to Submit</span>
                          ) : isRetrying ? "Submit Retry" : "Submit Answer"}
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            {!showExplanation && isCorrectlyAnswered && (
                                <button
                                    onClick={() => setShowExplanation(true)}
                                    className="px-4 py-2.5 text-blue-600 font-medium bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-2"
                                >
                                    <Eye className="h-4 w-4" /> View Solution
                                </button>
                            )}
                            <button
                                onClick={() => nextQuestionId && navigate(`/question/${nextQuestionId}`)}
                                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Next Question
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hints Text */}
            {hintIndex > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                        <div className="font-semibold mb-1 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Hint Used (0 Points Awarded)
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                        {question.hints?.slice(0, hintIndex).map((hint, idx) => (
                            <li key={idx}>{hint}</li>
                        ))}
                        </ul>
                </div>
            )}
        </div>
      </div>

      {/* Explanation Section */}
      {showExplanation && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 bg-blue-50 flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-bold text-gray-800">Explanation</h3>
            </div>
            <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-line">
                    {question.explanation}
            </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </div>
  );
};

export default QuestionView;
