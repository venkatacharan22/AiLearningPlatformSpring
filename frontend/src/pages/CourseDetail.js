import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AssignmentList from '../components/AssignmentList';
import LessonManager from '../components/LessonManager';
import LessonViewer from '../components/LessonViewer';
import CourseFlowManager from '../components/CourseFlowManager';
import StudentCourseFlow from '../components/StudentCourseFlow';
import CourseRating from '../components/CourseRating';
import { Button, Card, Alert, Badge, DifficultyBadge, LoadingSpinner } from '../components/ui';
import { assignmentAPI, studentAPI, lessonAPI } from '../services/api';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [activeTab, setActiveTab] = useState(
        user?.role === 'STUDENT' ? 'course-content' : 'overview'
    );
    const [enrolling, setEnrolling] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchCourseDetails();
        fetchAssignments();
        if (user && token) {
            checkEnrollmentStatus();
        }
    }, [courseId, user, token]);

    const fetchCourseDetails = async () => {
        try {
            console.log('Fetching course with ID:', courseId);
            const response = await fetch(`http://localhost:8081/api/courses/${courseId}`);
            console.log('Course fetch response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Course data received:', data);
                setCourse(data);
            } else {
                console.error('Course fetch failed with status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            console.log('🔍 Fetching assignments for course:', courseId);
            const response = await assignmentAPI.getAssignmentsByCourse(courseId);
            console.log('📋 Assignment API response:', response);

            // Handle both direct data and response.data formats
            const assignmentData = response.data || response;
            console.log('📝 Assignment data:', assignmentData);

            const assignmentsArray = Array.isArray(assignmentData) ? assignmentData : [];
            console.log(`✅ Found ${assignmentsArray.length} assignments for course ${courseId}`);

            setAssignments(assignmentsArray);
        } catch (error) {
            console.error('❌ Error fetching assignments:', error);
            console.error('Error details:', error.response?.data || error.message);
            setAssignments([]);
        }
    };

    const refreshLessons = async () => {
        try {
            // Refresh course data to get updated lessons
            await fetchCourseDetails();
        } catch (error) {
            console.error('Error refreshing lessons:', error);
        }
    };

    const checkEnrollmentStatus = async () => {
        const authToken = token || localStorage.getItem('token');
        if (!authToken || !user) {
            console.log('No token or user, skipping enrollment check');
            return;
        }

        try {
            console.log('Checking enrollment status for course:', courseId, 'with user:', user.username);
            const response = await fetch(`http://localhost:8081/api/courses/${courseId}/enrollment-status`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Enrollment status response:', data);
                setIsEnrolled(data.enrolled);
            } else {
                console.error('Failed to check enrollment status:', response.status);
                // If enrollment check fails, assume not enrolled
                setIsEnrolled(false);
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            // If enrollment check fails, assume not enrolled
            setIsEnrolled(false);
        }
    };

    const fetchQuiz = async () => {
        setLoadingQuiz(true);
        try {
            console.log('Generating quiz for course:', courseId);
            const authToken = token || localStorage.getItem('token');
            const response = await fetch(`/api/quiz/generate/${courseId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Quiz generation response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Quiz data received:', data);
                setQuiz(data.quiz || data);
            } else {
                const errorData = await response.json();
                console.error('Quiz generation failed:', errorData);
                // Try fallback quiz generation
                await generateFallbackQuiz();
            }
        } catch (error) {
            console.error('Error generating quiz:', error);
            // Try fallback quiz generation
            await generateFallbackQuiz();
        } finally {
            setLoadingQuiz(false);
        }
    };

    const generateFallbackQuiz = async () => {
        try {
            // Create a basic fallback quiz
            const fallbackQuiz = {
                id: `fallback-${courseId}`,
                title: `${course?.title || 'Course'} Quiz`,
                description: 'A basic quiz for this course',
                questions: [
                    {
                        id: 'q1',
                        question: `What is a key concept in ${course?.title || 'this course'}?`,
                        options: [
                            'Fundamental principles and best practices',
                            'Advanced theoretical frameworks',
                            'Basic terminology and definitions',
                            'Practical applications and examples'
                        ],
                        correctAnswer: 0
                    },
                    {
                        id: 'q2',
                        question: `Which difficulty level best describes ${course?.title || 'this course'}?`,
                        options: [
                            course?.difficulty || 'Intermediate',
                            'Expert level only',
                            'No prerequisites needed',
                            'Varies by student'
                        ],
                        correctAnswer: 0
                    }
                ]
            };
            setQuiz(fallbackQuiz);
        } catch (error) {
            console.error('Failed to create fallback quiz:', error);
        }
    };

    const handleTakeQuiz = () => {
        navigate(`/course/${courseId}/quiz`);
    };

    const handleEnroll = async () => {
        const authToken = token || localStorage.getItem('token');
        if (!authToken || !user) {
            alert('Please login to enroll in courses');
            return;
        }

        setEnrolling(true);
        try {
            console.log('Enrolling in course:', courseId, 'with user:', user.username);
            const response = await fetch(`http://localhost:8081/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Enrollment response:', data);
                setIsEnrolled(true);
                alert('Successfully enrolled in course!');
                // Refresh course data to update enrollment count
                await fetchCourseDetails();
            } else {
                const errorData = await response.json();
                console.error('Enrollment failed:', errorData);
                alert(errorData.error || 'Failed to enroll in course');
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
            alert('Error enrolling in course');
        } finally {
            setEnrolling(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
                <Card background="transparent" className="text-center">
                    <LoadingSpinner size="xl" color="white" text="Loading course details..." />
                </Card>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
                <Card background="transparent" className="text-center max-w-md">
                    <div className="text-6xl mb-4">📚</div>
                    <h1 className="text-2xl font-bold text-white mb-4">Course Not Found</h1>
                    <p className="text-blue-200 mb-6">The course you're looking for doesn't exist or has been removed.</p>
                    <Link to="/courses" className="w-full">
                        <Button variant="primary" className="w-full">
                            Back to Courses
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Course Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-4">
                                <span className="text-4xl mr-4">{getCategoryIcon(course.category)}</span>
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                                    <p className="text-blue-200 text-lg">{course.category}</p>
                                </div>
                            </div>
                            
                            <p className="text-blue-200 text-lg mb-6 max-w-3xl">{course.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <DifficultyBadge difficulty={course.difficulty} size="lg" />
                                <Badge variant="primary" size="lg">
                                    ⭐ {course.averageRating} ({course.reviews?.length || 0} reviews)
                                </Badge>
                                <Badge variant="info" size="lg">
                                    👥 {course.totalEnrollments} students
                                </Badge>
                                <Badge variant="success" size="lg">
                                    ⏱️ {course.estimatedHours} hours
                                </Badge>
                            </div>
                            
                            <div className="text-blue-200">
                                <span className="font-semibold">Instructor:</span> {course.instructorName}
                            </div>
                        </div>
                        
                        <div className="ml-8">
                            {user ? (
                                user.role === 'STUDENT' ? (
                                    isEnrolled ? (
                                        <div className="text-center space-y-3">
                                            <Alert type="success" title="Enrolled" message="You're enrolled in this course" />
                                            <Button variant="primary" size="lg" className="w-full">
                                                Continue Learning
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="success"
                                            size="lg"
                                            onClick={handleEnroll}
                                            loading={enrolling}
                                            className="w-full"
                                        >
                                            Enroll Now
                                        </Button>
                                    )
                                ) : (
                                    <div className="text-center">
                                        <Alert type="info" title="Instructor View" message="You own this course" />
                                    </div>
                                )
                            ) : (
                                <Link to="/login" className="w-full">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Login to Enroll
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Course Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tabs */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                            <div className="border-b border-white/20">
                                <nav className="flex space-x-8 px-6">
                                    {(user?.role === 'INSTRUCTOR' && course.instructorId === user?.id?.toString()
                                        ? ['overview', 'lessons', 'assignments', 'course-flow']
                                        : user?.role === 'STUDENT'
                                        ? ['overview', 'course-content', 'assignments', 'rate-course']
                                        : ['overview', 'lessons', 'assignments']
                                    ).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                                                activeTab === tab
                                                    ? 'border-blue-400 text-blue-300'
                                                    : 'border-transparent text-blue-200 hover:text-white'
                                            }`}
                                        >
                                            {tab === 'course-flow' ? 'Course Flow' :
                                             tab === 'course-content' ? 'Course Content' :
                                             tab === 'rate-course' ? 'Rate Course' : tab}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-4">Course Overview</h2>
                                        <p className="text-blue-200 mb-6">{course.description}</p>
                                        {course.outline && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-3">What You'll Learn</h3>
                                                <p className="text-blue-200">{course.outline}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'lessons' && (
                                    <div>
                                        {user?.role === 'INSTRUCTOR' && course.instructorId === user?.id?.toString() ? (
                                            <LessonManager
                                                courseId={courseId}
                                                lessons={course.lessons || []}
                                                onLessonsUpdate={refreshLessons}
                                                isInstructor={true}
                                                courseTitle={course.title}
                                                courseDifficulty={course.difficulty}
                                            />
                                        ) : (
                                            <LessonViewer
                                                lessons={course.lessons || []}
                                                courseTitle={course.title}
                                                isEnrolled={isEnrolled}
                                            />
                                        )}
                                    </div>
                                )}

                                {activeTab === 'course-content' && user?.role === 'STUDENT' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">📚 Course Learning Path</h2>
                                        <StudentCourseFlow
                                            lessons={course.lessons || []}
                                            assignments={assignments || []}
                                            courseTitle={course.title}
                                            courseId={course.id}
                                            isEnrolled={isEnrolled}
                                        />
                                    </div>
                                )}

                                {activeTab === 'assignments' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold text-white">🎯 Course Assignments</h2>
                                            <div className="text-blue-200 text-sm">
                                                {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} available
                                            </div>
                                        </div>

                                        {assignments && assignments.length > 0 ? (
                                            <AssignmentList
                                                assignments={assignments}
                                                courseId={courseId}
                                                showActions={false}
                                            />
                                        ) : (
                                            <div className="text-center py-16">
                                                <div className="text-8xl mb-6 animate-pulse">📝</div>
                                                <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                    No Assignments Available
                                                </h3>
                                                <p className="text-blue-200 text-lg mb-8 max-w-md mx-auto">
                                                    The instructor is still preparing assignments for this course.
                                                    Check back soon for exciting coding challenges!
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                        <div className="text-2xl mb-2">💻</div>
                                                        <p className="text-blue-200 text-sm">Coding Challenges</p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                        <div className="text-2xl mb-2">📋</div>
                                                        <p className="text-blue-200 text-sm">Quizzes & Tests</p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                        <div className="text-2xl mb-2">🏗️</div>
                                                        <p className="text-blue-200 text-sm">Projects</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'rate-course' && user?.role === 'STUDENT' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">⭐ Rate This Course</h2>
                                        <CourseRating
                                            courseId={courseId}
                                            isEnrolled={isEnrolled}
                                            onRatingSubmitted={() => {
                                                // Refresh course data to show updated rating
                                                fetchCourseDetails();
                                            }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'course-flow' && user?.role === 'INSTRUCTOR' && course.instructorId === user?.id?.toString() && (
                                    <div>
                                        <CourseFlowManager
                                            courseId={courseId}
                                            lessons={course.lessons || []}
                                            assignments={assignments || []}
                                            onUpdate={() => {
                                                refreshLessons();
                                                fetchAssignments();
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Reviews */}
                        {course.reviews && course.reviews.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <h2 className="text-2xl font-bold text-white mb-6">Student Reviews</h2>
                                <div className="space-y-4">
                                    {course.reviews.map((review, index) => (
                                        <div key={index} className="bg-white/10 rounded-xl p-4 border border-white/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-semibold text-white">{review.studentName}</div>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-400'}>
                                                            ⭐
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-blue-200">{review.comment}</p>
                                            <div className="text-blue-300 text-sm mt-2">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Instructor Info */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">Instructor</h3>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl text-white">👨‍🏫</span>
                                </div>
                                <h4 className="font-semibold text-white">{course.instructorName}</h4>
                                <p className="text-blue-200 text-sm">Expert Instructor</p>
                            </div>
                        </div>

                        {/* Course Info */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">Course Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-blue-200">Duration</span>
                                    <span className="text-white font-medium">{course.estimatedHours} hours</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-200">Level</span>
                                    <span className="text-white font-medium">{course.difficulty}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-200">Students</span>
                                    <span className="text-white font-medium">{course.totalEnrollments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-200">Category</span>
                                    <span className="text-white font-medium">{course.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-200">Created</span>
                                    <span className="text-white font-medium">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Course Quiz */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">📝 Course Quiz</h3>
                            <p className="text-blue-200 mb-4">Test your knowledge with our AI-generated quiz for this course!</p>

                            {!quiz ? (
                                <button
                                    onClick={fetchQuiz}
                                    disabled={loadingQuiz || !user}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                                >
                                    {loadingQuiz ? 'Generating Quiz...' :
                                     !user ? 'Login to Generate Quiz' : 'Generate Quiz'}
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                                        <h4 className="font-semibold text-white mb-2">{quiz.title}</h4>
                                        <p className="text-blue-200 text-sm mb-3">{quiz.description || 'AI-generated quiz for this course'}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-blue-200">Questions: {quiz.questions?.length || 0}</span>
                                            <span className="text-green-400">✅ Ready</span>
                                        </div>
                                    </div>
                                    {user && (
                                        <button
                                            onClick={handleTakeQuiz}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                        >
                                            Take Quiz
                                        </button>
                                    )}
                                    {user?.role === 'INSTRUCTOR' && (
                                        <button
                                            onClick={fetchQuiz}
                                            disabled={loadingQuiz}
                                            className="w-full bg-white/10 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50 border border-white/30"
                                        >
                                            {loadingQuiz ? 'Regenerating...' : 'Generate New Quiz'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {!user && (
                                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                                    <p className="text-yellow-200 text-sm">
                                        Please <Link to="/login" className="underline hover:text-yellow-100">login</Link> to generate and take quizzes.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
