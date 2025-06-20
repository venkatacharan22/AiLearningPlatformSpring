import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const CodingEditor = ({ assignment, onSubmit }) => {
  const [code, setCode] = useState(assignment?.starterCode || '');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');
  const [timeLeft, setTimeLeft] = useState(assignment?.timeLimit * 60 || 3600); // Convert to seconds
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      // Simulate code execution with test cases
      const results = assignment.testCases?.map((testCase, index) => {
        // Simple simulation - in production, this would call a code execution service
        const passed = Math.random() > 0.3; // 70% chance of passing for demo
        return {
          id: index,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: passed ? testCase.expectedOutput : "Wrong output",
          passed: passed,
          isHidden: testCase.isHidden
        };
      }) || [];

      setTestResults(results);
      setAttempts(attempts + 1);
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = () => {
    const allTestsPassed = testResults.every(result => result.passed);
    const score = allTestsPassed ? assignment.points : Math.floor(assignment.points * 0.5);
    
    onSubmit({
      code,
      testResults,
      score,
      attempts,
      timeSpent: (assignment.timeLimit * 60) - timeLeft,
      passed: allTestsPassed
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HARD': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assignment...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assignment.difficulty)}`}>
              {assignment.difficulty}
            </span>
            <span className="text-sm text-gray-500">
              {assignment.programmingLanguage?.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="h-4 w-4 mr-1" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600">
              Attempts: {attempts}/{assignment.maxAttempts}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['problem', 'examples', 'testcases'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'problem' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{assignment.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Statement</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {assignment.problemStatement}
                    </pre>
                  </div>
                </div>

                {assignment.constraints && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Constraints</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {assignment.constraints}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Examples</h3>
                {assignment.examples?.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Input:</span>
                      <pre className="mt-1 text-sm text-gray-800">{example.input}</pre>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Output:</span>
                      <pre className="mt-1 text-sm text-gray-800">{example.output}</pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="font-medium text-gray-700">Explanation:</span>
                        <p className="mt-1 text-sm text-gray-600">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                )) || <p className="text-gray-500">No examples available.</p>}
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
                {testResults.length > 0 ? (
                  testResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center mb-2">
                        {result.passed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className="font-medium">
                          Test Case {index + 1} {result.isHidden ? '(Hidden)' : ''}
                        </span>
                      </div>
                      {!result.isHidden && (
                        <>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Input:</span> {result.input}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Expected:</span> {result.expectedOutput}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Actual:</span> {result.actualOutput}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Run your code to see test results.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CodeBracketIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {assignment.programmingLanguage || 'Code'}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <PlayIcon className="h-4 w-4 mr-1" />
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button
                onClick={submitSolution}
                disabled={testResults.length === 0 || attempts >= assignment.maxAttempts}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none"
              placeholder="Write your solution here..."
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingEditor;
