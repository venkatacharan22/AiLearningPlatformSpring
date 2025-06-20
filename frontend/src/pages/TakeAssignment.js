import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CodingEditor from '../components/CodingEditor';
import LoadingSpinner from '../components/LoadingSpinner';

const TakeAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignment(data);
      } else {
        setError('Assignment not found');
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (submissionData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: submissionData.code,
          timeSpent: submissionData.timeSpent,
          attempts: submissionData.attempts,
          testResults: submissionData.testResults
        })
      });

      if (response.ok) {
        const result = await response.json();
        setResult({
          score: submissionData.score,
          passed: submissionData.passed,
          attempts: submissionData.attempts,
          timeSpent: Math.floor(submissionData.timeSpent / 60), // Convert to minutes
          totalTests: submissionData.testResults.length,
          passedTests: submissionData.testResults.filter(t => t.passed).length
        });
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading assignment..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className={`text-6xl mb-4 ${result.passed ? '🎉' : '📝'}`}>
            {result.passed ? '🎉' : '📝'}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {result.passed ? 'Congratulations!' : 'Good Effort!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {result.passed 
              ? 'You successfully completed the assignment!' 
              : 'Keep practicing and you\'ll get it next time!'}
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Score:</span>
              <span className="font-semibold text-lg">{result.score}/{assignment.points}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Tests Passed:</span>
              <span className="font-semibold">{result.passedTests}/{result.totalTests}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Time Spent:</span>
              <span className="font-semibold">{result.timeSpent} minutes</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Attempts:</span>
              <span className="font-semibold">{result.attempts}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/courses/${assignment.courseId}`)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Course
            </button>
            {!result.passed && result.attempts < assignment.maxAttempts && (
              <button
                onClick={() => {
                  setSubmitted(false);
                  setResult(null);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Submitting your solution...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we evaluate your code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <CodingEditor 
        assignment={assignment} 
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default TakeAssignment;
