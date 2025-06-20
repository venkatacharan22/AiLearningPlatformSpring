import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI } from '../services/api';

const AssignmentList = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssignments();
        fetchCourse();
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            const response = await assignmentAPI.getAssignmentsByCourse(courseId);
            // Handle both direct data and response.data formats
            const assignmentData = response.data || response;
            setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
            setError('');
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to load assignments');
            setAssignments([]);
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/courses/${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setCourse(data);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await assignmentAPI.deleteAssignment(assignmentId);
                setAssignments(assignments.filter(a => a.id !== assignmentId));
            } catch (error) {
                setError('Failed to delete assignment');
            }
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'EASY': return 'bg-green-100 text-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'HARD': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Assignments for {course?.title}
                            </h1>
                            <p className="text-blue-200 text-lg">Manage course assignments</p>
                        </div>
                        {user?.role === 'INSTRUCTOR' && (
                            <Link
                                to={`/courses/${courseId}/create-assignment`}
                                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                            >
                                + Create Assignment
                            </Link>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                        <p className="text-red-200">{error}</p>
                    </div>
                )}

                {/* Assignments List */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    {assignments.length > 0 ? (
                        <div className="space-y-4">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-xl font-semibold text-white">
                                                    {assignment.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assignment.difficulty)}`}>
                                                    {assignment.difficulty}
                                                </span>
                                                {assignment.aiGenerated && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                                        AI Generated
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <p className="text-blue-200 mb-4">
                                                {assignment.description}
                                            </p>
                                            
                                            <div className="flex items-center space-x-6 text-sm text-blue-200">
                                                <span>⏱️ {assignment.timeLimit} min</span>
                                                <span>🏆 {assignment.points} pts</span>
                                                {assignment.programmingLanguage && (
                                                    <span>💻 {assignment.programmingLanguage.toUpperCase()}</span>
                                                )}
                                                {assignment.dueDate && (
                                                    <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            {user?.role === 'INSTRUCTOR' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                                        className="px-3 py-1 text-sm text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <Link
                                                    to={`/assignments/${assignment.id}`}
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                                >
                                                    {assignment.type === 'CODING' ? 'Solve' : 'Start'}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No assignments yet</h3>
                            <p className="text-blue-200 mb-6">
                                {user?.role === 'INSTRUCTOR' 
                                    ? 'Create your first assignment to get started'
                                    : 'No assignments have been created for this course yet'
                                }
                            </p>
                            {user?.role === 'INSTRUCTOR' && (
                                <Link
                                    to={`/courses/${courseId}/create-assignment`}
                                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 inline-block"
                                >
                                    Create First Assignment
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Back to Course */}
                <div className="mt-8 text-center">
                    <Link
                        to={`/courses/${courseId}`}
                        className="text-blue-200 hover:text-white transition-colors"
                    >
                        ← Back to Course
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AssignmentList;
