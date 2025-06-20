import React, { useState } from 'react';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const QuizComponent = ({ quiz, onSubmit, timeLimit = 30 }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds
  const [quizCompleted, setQuizCompleted] = useState(false);

  React.useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizCompleted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex.toString()
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizCompleted(true);
    const timeSpent = (timeLimit * 60) - timeLeft;
    onSubmit({
      answers,
      timeSpent: Math.round(timeSpent / 60) // Convert back to minutes
    });
  };

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No quiz available for this course.</p>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const allQuestionsAnswered = quiz.questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </div>
        <div className="flex items-center text-lg font-medium text-gray-900">
          <ClockIcon className="h-5 w-5 mr-2" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="card mb-8">
        <div className="card-body">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {question.questionText}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[question.id] === index.toString()
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={index}
                  checked={answers[question.id] === index.toString()}
                  onChange={() => handleAnswerSelect(question.id, index)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  answers[question.id] === index.toString()
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {answers[question.id] === index.toString() && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mb-8">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-4">
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="btn btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Answer Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Answer Summary</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((q, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  answers[q.id] !== undefined
                    ? 'bg-green-500 text-white'
                    : index === currentQuestion
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
                {answers[q.id] !== undefined && (
                  <CheckCircleIcon className="h-3 w-3 absolute -top-1 -right-1" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Answered: {Object.keys(answers).length} / {quiz.questions.length} questions
            </p>
            {quiz.passingScore && (
              <p>Passing score: {quiz.passingScore}%</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;
