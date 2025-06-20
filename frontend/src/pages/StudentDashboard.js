import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI, assignmentAPI } from '../services/api';
import CourseCard from '../components/CourseCard';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [recentAssignments, setRecentAssignments] = useState([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchCourses();
        fetchDashboardData();
        fetchRecentAssignments();
    }, []);

    // Redirect if not a student
    if (!user || user.role !== 'STUDENT') {
        return <Navigate to="/login" replace />;
    }

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/courses/public');
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const response = await studentAPI.getDashboard();
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set default data if API fails
            setDashboardData({
                enrolledCourses: [],
                completedCourses: [],
                inProgressCourses: [],
                stats: {
                    totalCourses: 0,
                    completedCourses: 0,
                    totalTimeSpent: 0,
                    averageScore: 0
                }
            });
        }
    };

    const fetchRecentAssignments = async () => {
        try {
            const response = await studentAPI.getStudentSubmissions();
            // Convert submissions to assignment format for display
            const submissions = response.data.submissions || [];
            const assignmentPromises = submissions.slice(0, 6).map(async (submission) => {
                try {
                    const assignmentResponse = await assignmentAPI.getAssignment(submission.assignmentId);
                    return {
                        ...assignmentResponse.data,
                        submissionStatus: submission.passed ? 'Passed' : 'Failed',
                        lastAttempt: submission.submittedAt,
                        score: submission.score
                    };
                } catch (error) {
                    console.error(`Error fetching assignment ${submission.assignmentId}:`, error);
                    return null;
                }
            });

            const assignments = await Promise.all(assignmentPromises);
            setRecentAssignments(assignments.filter(a => a !== null));
        } catch (error) {
            console.error('Error fetching recent assignments:', error);
            // Fallback to getting assignments from enrolled courses
            try {
                const allAssignments = [];
                for (const course of courses.slice(0, 3)) {
                    try {
                        const response = await assignmentAPI.getAssignmentsByCourse(course.id);
                        allAssignments.push(...response.data.slice(0, 2));
                    } catch (error) {
                        console.error(`Error fetching assignments for course ${course.id}:`, error);
                    }
                }
                setRecentAssignments(allAssignments.slice(0, 6));
            } catch (fallbackError) {
                console.error('Fallback assignment fetch failed:', fallbackError);
            }
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Programming': return '💻';
            case 'Web Development': return '🌐';
            case 'Data Science': return '📊';
            case 'Artificial Intelligence': return '🤖';
            case 'Backend Development': return '⚙️';
            case 'DevOps': return '🔧';
            default: return '📚';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'BEGINNER': return 'bg-green-100 text-green-800';
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
            case 'ADVANCED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading dashboard...</p>
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
                                Welcome back, {user?.firstName || user?.username}! 👋
                            </h1>
                            <p className="text-blue-200 text-lg">Ready to continue your learning journey?</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{user?.estimatedIQ || 'N/A'}</div>
                            <div className="text-blue-200 text-sm">IQ Score</div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">📚</div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {dashboardData?.enrolledCourses?.length || 0}
                                </div>
                                <div className="text-blue-200 text-sm">Enrolled Courses</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">✅</div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {dashboardData?.completedCourses?.length || 0}
                                </div>
                                <div className="text-blue-200 text-sm">Completed</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">⏱️</div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {dashboardData?.stats?.totalTimeSpent || 0}
                                </div>
                                <div className="text-blue-200 text-sm">Hours Learned</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">📊</div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {dashboardData?.stats?.averageScore || 0}%
                                </div>
                                <div className="text-blue-200 text-sm">Avg Score</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* IQ Test Section */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center mb-4">
                            <div className="text-3xl mr-3">🧠</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">IQ Assessment</h3>
                                <p className="text-blue-200 text-sm">Test your cognitive abilities</p>
                            </div>
                        </div>
                        <p className="text-blue-200 mb-4">
                            Take our AI-powered IQ test to get personalized course recommendations based on your cognitive abilities.
                        </p>
                        <Link
                            to="/iq-test"
                            className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-center"
                        >
                            Take IQ Test
                        </Link>
                    </div>

                    {/* Browse Courses */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center mb-4">
                            <div className="text-3xl mr-3">📚</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Browse Courses</h3>
                                <p className="text-blue-200 text-sm">Discover new learning opportunities</p>
                            </div>
                        </div>
                        <p className="text-blue-200 mb-4">
                            Explore our comprehensive course catalog and find the perfect courses to advance your skills.
                        </p>
                        <Link
                            to="/courses"
                            className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 text-center"
                        >
                            Browse Courses
                        </Link>
                    </div>
                </div>

                {/* Recent Assignments */}
                {recentAssignments.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                        <div className="flex items-center mb-6">
                            <div className="text-3xl mr-3">💻</div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Recent Assignments</h3>
                                <p className="text-blue-200">Practice your coding skills</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentAssignments.map((assignment) => (
                                <div key={assignment.id} className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200">
                                    <div className="flex items-center mb-3">
                                        <span className="text-2xl mr-2">💻</span>
                                        <div>
                                            <h4 className="font-semibold text-white text-sm">{assignment.title}</h4>
                                            <p className="text-blue-200 text-xs">{assignment.difficulty}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-blue-200 text-xs">
                                            {assignment.programmingLanguage?.toUpperCase()}
                                        </span>
                                        <div className="flex items-center text-blue-200 text-xs">
                                            <span className="mr-1">🏆</span>
                                            <span>{assignment.points} pts</span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/assignments/${assignment.id}`}
                                        className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-center text-sm"
                                    >
                                        Solve Challenge
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Courses */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center mb-6">
                        <div className="text-3xl mr-3">💡</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Recommended for You</h3>
                            <p className="text-blue-200">Courses tailored to your interests and skill level</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.slice(0, 6).map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                variant="enhanced"
                                showEnrollButton={true}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
