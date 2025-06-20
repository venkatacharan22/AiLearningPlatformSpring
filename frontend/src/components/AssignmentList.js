import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CodeBracketIcon,
  ClockIcon,
  TrophyIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AssignmentList = ({ assignments, courseId, showActions = false, onEdit, onDelete }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HARD': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CODING': return <CodeBracketIcon className="h-5 w-5" />;
      case 'QUIZ': return <CheckCircleIcon className="h-5 w-5" />;
      default: return <CodeBracketIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
        <p className="mt-1 text-sm text-gray-500">
          {showActions ? 'Create your first assignment to get started.' : 'No assignments available for this course yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 group">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-3xl">
                    {assignment.type === 'CODING' ? '💻' :
                     assignment.type === 'QUIZ' ? '📋' :
                     assignment.type === 'PROJECT' ? '🏗️' : '💻'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assignment.difficulty === 'EASY' ? 'bg-green-500/20 text-green-300' :
                        assignment.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {assignment.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                        {assignment.type}
                      </span>
                      {assignment.aiGenerated && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                          🤖 AI Generated
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-blue-200 mb-4 line-clamp-2 leading-relaxed">
                  {assignment.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center text-blue-300 text-xs mb-1">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      <span>Duration</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{assignment.timeLimit} min</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-blue-300 text-xs mb-1">Points</div>
                    <span className="text-white font-semibold text-sm">{assignment.points}</span>
                  </div>
                  {assignment.programmingLanguage && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-blue-300 text-xs mb-1">Language</div>
                      <span className="text-white font-semibold text-sm">{assignment.programmingLanguage.toUpperCase()}</span>
                    </div>
                  )}
                  {assignment.dueDate && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-blue-300 text-xs mb-1">Due Date</div>
                      <span className="text-white font-semibold text-xs">{formatDate(assignment.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 ml-4">
                {!assignment.published && showActions && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                    📝 Draft
                  </span>
                )}

                {showActions ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit && onEdit(assignment)}
                      className="px-4 py-2 text-sm text-blue-300 hover:text-white hover:bg-blue-600/20 rounded-lg border border-blue-500/30 transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(assignment.id)}
                      className="px-4 py-2 text-sm text-red-300 hover:text-white hover:bg-red-600/20 rounded-lg border border-red-500/30 transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ) : (
                  <Link
                    to={`/assignments/${assignment.id}`}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {assignment.type === 'CODING' ? '🚀 Solve Challenge' : '📝 Start Assignment'}
                  </Link>
                )}
              </div>
            </div>

            {/* Problem Preview for Coding Assignments */}
            {assignment.type === 'CODING' && assignment.problemStatement && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                  🎯 <span className="ml-2">Problem Preview</span>
                </h4>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-blue-200 text-sm line-clamp-3 leading-relaxed">
                    {assignment.problemStatement}
                  </p>
                </div>
              </div>
            )}

            {/* Examples Preview */}
            {assignment.examples && assignment.examples.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                  💡 <span className="ml-2">Example</span>
                </h4>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium text-green-300 w-16">Input:</span>
                      <span className="text-blue-200 font-mono">{assignment.examples[0].input}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-blue-300 w-16">Output:</span>
                      <span className="text-blue-200 font-mono">{assignment.examples[0].output}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;
