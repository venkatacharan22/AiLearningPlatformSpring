import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI } from '../services/api';

const InstructorAssignments = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (user?.role !== 'INSTRUCTOR') {
            navigate('/login');
            return;
        }
        fetchAssignments();
        fetchCourse();
    }, [courseId, user, navigate]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            // Fetch all assignments (published and unpublished) for instructor
            const response = await assignmentAPI.getAssignmentsByCourse(courseId);
            const assignmentData = response.data || response;
            setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
            setError('');
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to load assignments');
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

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
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        }
    };

    const handlePublishToggle = async (assignmentId, currentStatus) => {
        try {
            if (currentStatus) {
                await assignmentAPI.unpublishAssignment(assignmentId);
            } else {
                await assignmentAPI.publishAssignment(assignmentId);
            }
            // Refresh assignments
            fetchAssignments();
        } catch (error) {
            console.error('Error toggling assignment status:', error);
            alert('Failed to update assignment status');
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await assignmentAPI.deleteAssignment(assignmentId);
                fetchAssignments();
            } catch (error) {
                console.error('Error deleting assignment:', error);
                alert('Failed to delete assignment');
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

    const getFilteredAssignments = () => {
        switch (activeTab) {
            case 'published':
                return assignments.filter(a => a.published);
            case 'unpublished':
                return assignments.filter(a => !a.published);
            default:
                return assignments;
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

    const filteredAssignments = getFilteredAssignments();
    const publishedCount = assignments.filter(a => a.published).length;
    const unpublishedCount = assignments.filter(a => !a.published).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Assignment Management
                            </h1>
                            <p className="text-blue-200 text-lg">
                                {course?.title} - Manage all course assignments
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <Link
                                to={`/courses/${courseId}/create-assignment`}
                                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                            >
                                ➕ Create Assignment
                            </Link>
                            <Link
                                to={`/courses/${courseId}`}
                                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-200"
                            >
                                ← Back to Course
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">📝</div>
                            <div>
                                <div className="text-2xl font-bold text-white">{assignments.length}</div>
                                <div className="text-blue-200 text-sm">Total Assignments</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">✅</div>
                            <div>
                                <div className="text-2xl font-bold text-green-400">{publishedCount}</div>
                                <div className="text-blue-200 text-sm">Published</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">📋</div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-400">{unpublishedCount}</div>
                                <div className="text-blue-200 text-sm">Drafts</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 mb-8">
                    <div className="border-b border-white/20">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { key: 'all', label: 'All Assignments', count: assignments.length },
                                { key: 'published', label: 'Published', count: publishedCount },
                                { key: 'unpublished', label: 'Drafts', count: unpublishedCount }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                        activeTab === tab.key
                                            ? 'border-blue-400 text-blue-300'
                                            : 'border-transparent text-blue-200 hover:text-white'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {filteredAssignments.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAssignments.map((assignment) => (
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
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        assignment.published 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {assignment.published ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-blue-200 mb-4">
                                                    {assignment.description}
                                                </p>
                                                
                                                <div className="flex items-center space-x-6 text-sm text-blue-300">
                                                    <div>⏱️ {assignment.timeLimit} min</div>
                                                    <div>🏆 {assignment.points} pts</div>
                                                    {assignment.programmingLanguage && (
                                                        <div>💻 {assignment.programmingLanguage.toUpperCase()}</div>
                                                    )}
                                                    <div>📅 {new Date(assignment.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button
                                                    onClick={() => handlePublishToggle(assignment.id, assignment.published)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                        assignment.published
                                                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                                    }`}
                                                >
                                                    {assignment.published ? 'Unpublish' : 'Publish'}
                                                </button>
                                                <Link
                                                    to={`/assignments/${assignment.id}`}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {activeTab === 'published' ? 'No published assignments' :
                                     activeTab === 'unpublished' ? 'No draft assignments' :
                                     'No assignments yet'}
                                </h3>
                                <p className="text-blue-200 mb-6">
                                    {activeTab === 'published' ? 'Publish some assignments to make them visible to students' :
                                     activeTab === 'unpublished' ? 'Create assignments and save them as drafts before publishing' :
                                     'Create your first assignment to get started'}
                                </p>
                                <Link
                                    to={`/courses/${courseId}/create-assignment`}
                                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 inline-block"
                                >
                                    Create Assignment
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorAssignments;
