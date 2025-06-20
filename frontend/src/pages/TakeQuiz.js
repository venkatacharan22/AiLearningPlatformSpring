import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TakeQuiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [courseId]);

    useEffect(() => {
        if (timeLeft > 0 && !quizCompleted) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !quizCompleted) {
            handleSubmitQuiz();
        }
    }, [timeLeft, quizCompleted]);

    const fetchQuiz = async () => {
        try {
            console.log('Fetching quiz for course:', courseId);
            const response = await fetch(`http://localhost:8081/api/courses/${courseId}/quiz`);

            if (response.ok) {
                const data = await response.json();
                console.log('Quiz data received:', data);
                setQuiz(data);
            } else {
                console.error('Quiz fetch failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        setAnswers({
            ...answers,
            [questionIndex]: answerIndex
        });
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitQuiz = () => {
        let correctAnswers = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });
        
        const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
        setScore(finalScore);
        setQuizCompleted(true);
        setShowResults(true);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreMessage = (score) => {
        if (score >= 90) return 'Excellent! Outstanding performance!';
        if (score >= 80) return 'Great job! You have a solid understanding!';
        if (score >= 70) return 'Good work! You\'re on the right track!';
        if (score >= 60) return 'Not bad! Consider reviewing the material.';
        return 'Keep studying! You\'ll improve with practice.';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-2xl font-bold mb-4">Quiz Not Available</h1>
                    <button 
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
                    >
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h1>
                        <div className={`text-6xl font-bold mb-4 ${getScoreColor(score)}`}>
                            {score}%
                        </div>
                        <p className="text-blue-200 text-lg mb-6">{getScoreMessage(score)}</p>
                        
                        <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-white">{Object.keys(answers).filter(key => answers[key] === quiz.questions[key]?.correctAnswer).length}</div>
                                    <div className="text-blue-200">Correct</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{quiz.questions.length - Object.keys(answers).filter(key => answers[key] === quiz.questions[key]?.correctAnswer).length}</div>
                                    <div className="text-blue-200">Incorrect</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => navigate(`/course/${courseId}`)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                            >
                                Back to Course
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentQuestion(0);
                                    setAnswers({});
                                    setTimeLeft(1800);
                                    setQuizCompleted(false);
                                    setShowResults(false);
                                    setScore(0);
                                }}
                                className="w-full bg-white/10 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 border border-white/30"
                            >
                                Retake Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
                        <div className="text-white font-semibold">
                            ⏱️ {formatTime(timeLeft)}
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-200">Question {currentQuestion + 1} of {quiz.questions.length}</span>
                        <span className="text-blue-200">{Math.round(progress)}% Complete</span>
                    </div>
                    
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
                    <h2 className="text-xl font-semibold text-white mb-6">{currentQ.question}</h2>
                    
                    <div className="space-y-4">
                        {currentQ.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(currentQuestion, index)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                    answers[currentQuestion] === index
                                        ? 'bg-blue-600/30 border-blue-400 text-white'
                                        : 'bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-white/40'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestion === 0}
                            className="bg-white/10 text-white py-2 px-6 rounded-xl font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
                        >
                            Previous
                        </button>
                        
                        <div className="text-blue-200">
                            {Object.keys(answers).length} of {quiz.questions.length} answered
                        </div>
                        
                        {currentQuestion === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmitQuiz}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                            >
                                Submit Quiz
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeQuiz;
