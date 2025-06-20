import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CoursePreview from '../components/CoursePreview';
import CourseCard from '../components/CourseCard';

const InstructorDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewCourse, setPreviewCourse] = useState(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchCourses();
    }, []);

    // Redirect if not an instructor
    if (!user || user.role !== 'INSTRUCTOR') {
        return <Navigate to="/login" replace />;
    }

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/instructor/courses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            } else {
                console.error('Failed to fetch courses:', response.status);
                // Fallback to public courses for now
                const publicResponse = await fetch('http://localhost:8081/api/courses/public');
                if (publicResponse.ok) {
                    const publicData = await publicResponse.json();
                    setCourses(publicData);
                }
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            // Fallback to public courses
            try {
                const publicResponse = await fetch('http://localhost:8081/api/courses/public');
                if (publicResponse.ok) {
                    const publicData = await publicResponse.json();
                    setCourses(publicData);
                }
            } catch (fallbackError) {
                console.error('Fallback fetch failed:', fallbackError);
            }
        } finally {
            setLoading(false);
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
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Welcome, Instructor {user?.firstName || user?.username}! 👨‍🏫
                            </h1>
                            <p className="text-blue-200 text-lg">Manage your courses and track student progress</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{courses.length}</div>
                            <div className="text-blue-200 text-sm">Your Courses</div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">📚</div>
                            <div>
                                <div className="text-2xl font-bold text-white">{courses.length}</div>
                                <div className="text-blue-200 text-sm">Total Courses</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">👥</div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {courses.reduce((total, course) => total + course.totalEnrollments, 0)}
                                </div>
                                <div className="text-blue-200 text-sm">Total Students</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">⭐</div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {courses.length > 0 ? (courses.reduce((total, course) => total + course.averageRating, 0) / courses.length).toFixed(1) : '0.0'}
                                </div>
                                <div className="text-blue-200 text-sm">Avg Rating</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center">
                            <div className="text-3xl mr-4">📝</div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {courses.reduce((total, course) => total + (course.reviews?.length || 0), 0)}
                                </div>
                                <div className="text-blue-200 text-sm">Total Reviews</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Create Course */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center mb-4">
                            <div className="text-3xl mr-3">➕</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Create New Course</h3>
                                <p className="text-blue-200 text-sm">Add a new course to your catalog</p>
                            </div>
                        </div>
                        <p className="text-blue-200 mb-4">
                            Create engaging courses with lessons, quizzes, and multimedia content to share your expertise.
                        </p>
                        <Link
                            to="/create-course"
                            className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-center"
                        >
                            Create Course
                        </Link>
                    </div>

                    {/* View All Courses */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center mb-4">
                            <div className="text-3xl mr-3">📚</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Browse All Courses</h3>
                                <p className="text-blue-200 text-sm">Explore the course catalog</p>
                            </div>
                        </div>
                        <p className="text-blue-200 mb-4">
                            Browse all courses on the platform to see what other instructors are teaching and get inspiration.
                        </p>
                        <Link
                            to="/courses"
                            className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 text-center"
                        >
                            Browse Courses
                        </Link>
                    </div>
                </div>

                {/* Your Courses */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center mb-6">
                        <div className="text-3xl mr-3">📖</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Your Courses</h3>
                            <p className="text-blue-200">Manage and monitor your course performance</p>
                        </div>
                    </div>

                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <div key={course.id} className="relative">
                                    <CourseCard
                                        course={course}
                                        variant="enhanced"
                                        showEnrollButton={false}
                                    />
                                    <div className="mt-4 space-y-2">
                                        <button
                                            onClick={() => setPreviewCourse(course)}
                                            className="block w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 px-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 text-center text-sm"
                                        >
                                            👁️ Preview Course
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                to={`/courses/${course.id}`}
                                                className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center text-xs"
                                            >
                                                View Details
                                            </Link>
                                            <Link
                                                to={`/instructor/courses/${course.id}/assignments`}
                                                className="block bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 text-center text-xs"
                                            >
                                                Assignments
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No courses yet</h3>
                            <p className="text-blue-200 mb-6">Create your first course to get started</p>
                            <Link
                                to="/create-course"
                                className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                            >
                                Create Your First Course
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Course Preview Modal */}
            {previewCourse && (
                <CoursePreview
                    course={previewCourse}
                    onClose={() => setPreviewCourse(null)}
                />
            )}
        </div>
    );
};

export default InstructorDashboard;
