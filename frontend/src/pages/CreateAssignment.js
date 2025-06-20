import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  SparklesIcon,
  CodeBracketIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const CreateAssignment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [course, setCourse] = useState(null);
  const [mode, setMode] = useState('ai'); // 'ai', 'codeforces', or 'manual'
  const [codeforcesProblems, setCodeforcesProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  // AI Generation Form
  const [aiForm, setAiForm] = useState({
    topic: '',
    difficulty: 'MEDIUM',
    programmingLanguage: 'java'
  });

  // Codeforces Form
  const [codeforcesForm, setCodeforcesForm] = useState({
    topic: '',
    difficulty: 'MEDIUM',
    programmingLanguage: 'java',
    problemCount: 3
  });

  // Manual Creation Form
  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    type: 'CODING',
    difficulty: 'MEDIUM',
    problemStatement: '',
    constraints: '',
    programmingLanguage: 'java',
    timeLimit: 60,
    points: 100,
    starterCode: '',
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }]
  });

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        setAiForm(prev => ({ ...prev, topic: data.title }));
        setCodeforcesForm(prev => ({ ...prev, topic: data.title }));
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const handleAIGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          topic: aiForm.topic,
          difficulty: aiForm.difficulty,
          programmingLanguage: aiForm.programmingLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('🎉 AI assignment generated successfully!');
        setTimeout(() => {
          navigate(`/courses/${courseId}/assignments`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate assignment');
      }
    } catch (error) {
      setError('Failed to generate assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeforcesGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments/generate-with-codeforces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          topic: codeforcesForm.topic,
          difficulty: codeforcesForm.difficulty,
          programmingLanguage: codeforcesForm.programmingLanguage,
          problemCount: codeforcesForm.problemCount
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('🎉 Assignment with Codeforces problems generated successfully!');
        setTimeout(() => {
          navigate(`/courses/${courseId}/assignments`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate assignment with Codeforces problems');
      }
    } catch (error) {
      setError('Failed to generate assignment with Codeforces problems');
    } finally {
      setLoading(false);
    }
  };

  const fetchCodeforcesProblems = async () => {
    setLoadingProblems(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8081/api/assignments/codeforces-problems?difficulty=${codeforcesForm.difficulty}&topic=${codeforcesForm.topic}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCodeforcesProblems(data.problems || []);
      } else {
        setError('Failed to fetch Codeforces problems');
      }
    } catch (error) {
      setError('Failed to fetch Codeforces problems');
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleManualCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...manualForm,
          courseId
        })
      });

      if (response.ok) {
        setSuccess('✅ Assignment created successfully!');
        setTimeout(() => {
          navigate(`/courses/${courseId}/assignments`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create assignment');
      }
    } catch (error) {
      setError('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const addExample = () => {
    setManualForm(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const addTestCase = () => {
    setManualForm(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const removeExample = (index) => {
    setManualForm(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const removeTestCase = (index) => {
    setManualForm(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
          <p className="mt-2 text-gray-600">
            Create a new assignment for {course?.title}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Creation Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setMode('ai')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  mode === 'ai'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="font-semibold text-gray-900">AI Generated</span>
                </div>
                <p className="text-sm text-gray-600">
                  Let AI create a LeetCode-style coding assignment based on your topic
                </p>
              </button>

              <button
                onClick={() => setMode('codeforces')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  mode === 'codeforces'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <TrophyIcon className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-900">Codeforces Problems</span>
                </div>
                <p className="text-sm text-gray-600">
                  Use real competitive programming problems from Codeforces
                </p>
              </button>

              <button
                onClick={() => setMode('manual')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  mode === 'manual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <CodeBracketIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="font-semibold text-gray-900">Manual Creation</span>
                </div>
                <p className="text-sm text-gray-600">
                  Create a custom assignment with full control over all details
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* AI Generation Form */}
        {mode === 'ai' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">AI Assignment Generation</h2>
              </div>

              <form onSubmit={handleAIGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Subject
                  </label>
                  <input
                    type="text"
                    value={aiForm.topic}
                    onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Arrays, Sorting Algorithms, Dynamic Programming"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={aiForm.difficulty}
                      onChange={(e) => setAiForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programming Language
                    </label>
                    <select
                      value={aiForm.programmingLanguage}
                      onChange={(e) => setAiForm(prev => ({ ...prev, programmingLanguage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Generate Assignment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Codeforces Generation Form */}
        {mode === 'codeforces' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <TrophyIcon className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Codeforces Assignment Generation</h2>
              </div>

              <form onSubmit={handleCodeforcesGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Subject
                  </label>
                  <input
                    type="text"
                    value={codeforcesForm.topic}
                    onChange={(e) => setCodeforcesForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Arrays, Graphs, Dynamic Programming"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={codeforcesForm.difficulty}
                      onChange={(e) => setCodeforcesForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="EASY">Easy (800-1200)</option>
                      <option value="MEDIUM">Medium (1200-1600)</option>
                      <option value="HARD">Hard (1600-2100)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programming Language
                    </label>
                    <select
                      value={codeforcesForm.programmingLanguage}
                      onChange={(e) => setCodeforcesForm(prev => ({ ...prev, programmingLanguage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Problems
                    </label>
                    <select
                      value={codeforcesForm.problemCount}
                      onChange={(e) => setCodeforcesForm(prev => ({ ...prev, problemCount: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={1}>1 Problem</option>
                      <option value={3}>3 Problems</option>
                      <option value={5}>5 Problems</option>
                      <option value={10}>10 Problems</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">About Codeforces Integration</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>This will fetch real competitive programming problems from Codeforces based on your criteria. Students will be directed to solve the problems on the Codeforces platform.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrophyIcon className="h-4 w-4 mr-2" />
                        Generate with Codeforces
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manual Creation Form */}
        {mode === 'manual' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <CodeBracketIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Manual Assignment Creation</h2>
              </div>

              <form onSubmit={handleManualCreate} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      value={manualForm.title}
                      onChange={(e) => setManualForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Type
                    </label>
                    <select
                      value={manualForm.type}
                      onChange={(e) => setManualForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="CODING">Coding Challenge</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="ESSAY">Essay</option>
                      <option value="PROJECT">Project</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={manualForm.description}
                    onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={manualForm.difficulty}
                      onChange={(e) => setManualForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={manualForm.timeLimit}
                      onChange={(e) => setManualForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TrophyIcon className="h-4 w-4 inline mr-1" />
                      Points
                    </label>
                    <input
                      type="number"
                      value={manualForm.points}
                      onChange={(e) => setManualForm(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAssignment;
