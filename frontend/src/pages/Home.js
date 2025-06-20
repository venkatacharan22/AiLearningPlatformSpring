import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            AI Learning Platform
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto">
                            Master new skills with AI-powered courses and intelligent assessments
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!user ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                    >
                                        Get Started
                                    </Link>
                                    <Link
                                        to="/courses"
                                        className="bg-white/10 backdrop-blur-lg text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200 border border-white/30"
                                    >
                                        Browse Courses
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to={user.role === 'STUDENT' ? '/student' : '/instructor'}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                >
                                    Go to Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Platform?</h2>
                    <p className="text-blue-200 text-lg">Experience the future of learning</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-xl font-bold text-white mb-4">AI-Powered Learning</h3>
                        <p className="text-blue-200">Intelligent course recommendations and personalized learning paths</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <div className="text-4xl mb-4">🧠</div>
                        <h3 className="text-xl font-bold text-white mb-4">IQ Assessment</h3>
                        <p className="text-blue-200">Take AI-generated IQ tests to understand your cognitive abilities</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <div className="text-4xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-white mb-4">Expert Content</h3>
                        <p className="text-blue-200">Learn from industry experts with comprehensive courses</p>
                    </div>
                </div>

                {/* Courses Section */}
                {!loading && courses.length > 0 && (
                    <>
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-white mb-4">Featured Courses</h2>
                            <p className="text-blue-200 text-lg">Start your learning journey</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.slice(0, 6).map((course) => (
                                <div key={course.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200">
                                    <div className="flex items-center mb-4">
                                        <span className="text-3xl mr-3">{getCategoryIcon(course.category)}</span>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{course.title}</h3>
                                            <p className="text-blue-200 text-sm">{course.category}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-blue-200 text-sm mb-4 line-clamp-3">{course.description}</p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(course.difficulty)}`}>
                                            {course.difficulty}
                                        </span>
                                        <div className="flex items-center text-blue-200 text-sm">
                                            <span className="mr-1">⭐</span>
                                            <span>{course.averageRating}</span>
                                            <span className="ml-2">👥 {course.totalEnrollments}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-200 text-sm">⏱️ {course.estimatedHours} hours</span>
                                        <Link
                                            to={`/courses/${course.id}`}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm"
                                        >
                                            View Course
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link
                                to="/courses"
                                className="bg-white/10 backdrop-blur-lg text-white py-3 px-8 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 border border-white/30"
                            >
                                View All Courses
                            </Link>
                        </div>
                    </>
                )}

                {loading && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white text-xl">Loading courses...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
