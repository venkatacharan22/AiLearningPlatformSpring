import React, { useState } from 'react';
import { XMarkIcon, PlayIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';

const CoursePreview = ({ course, onClose }) => {
    const [activeLesson, setActiveLesson] = useState(0);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    if (!course) return null;

    const handleVideoPlay = (videoUrl) => {
        setSelectedVideo(videoUrl);
        setShowVideoModal(true);
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                            <p className="text-blue-100">{course.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Sidebar - Lessons */}
                    <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <BookOpenIcon className="h-5 w-5 mr-2" />
                                Course Lessons ({course.lessons?.length || 0})
                            </h3>
                            <div className="space-y-2">
                                {course.lessons?.map((lesson, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveLesson(index)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                            activeLesson === index
                                                ? 'bg-blue-100 border-blue-300 border'
                                                : 'bg-white hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className={`font-medium ${
                                                    activeLesson === index ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                    {lesson.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Lesson {index + 1}
                                                </p>
                                            </div>
                                            {lesson.videoUrl && (
                                                <PlayIcon className="h-4 w-4 text-blue-600" />
                                            )}
                                        </div>
                                    </button>
                                )) || (
                                    <p className="text-gray-500 text-center py-8">No lessons available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto">
                        {course.lessons && course.lessons[activeLesson] ? (
                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {course.lessons[activeLesson].title}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600 mb-4">
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        <span>Lesson {activeLesson + 1} of {course.lessons.length}</span>
                                    </div>
                                </div>

                                {/* Video Section */}
                                {course.lessons[activeLesson].videoUrl && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3">Video Content</h4>
                                        <div className="bg-gray-100 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">YouTube Video</p>
                                                    <p className="font-medium text-gray-900 truncate max-w-md">
                                                        {course.lessons[activeLesson].videoUrl}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleVideoPlay(course.lessons[activeLesson].videoUrl)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                                >
                                                    <PlayIcon className="h-4 w-4 mr-2" />
                                                    Preview
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Lesson Content */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Lesson Content</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="prose max-w-none">
                                            {course.lessons[activeLesson].content ? (
                                                <div className="whitespace-pre-wrap text-gray-700">
                                                    {course.lessons[activeLesson].content}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">No content available for this lesson</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <div className="text-gray-400 mb-4">
                                    <BookOpenIcon className="h-16 w-16 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Available</h3>
                                <p className="text-gray-600">This course doesn't have any lessons yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Info Footer */}
                <div className="bg-gray-50 border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                            <span>📚 {course.category}</span>
                            <span>⭐ {course.difficulty}</span>
                            <span>⏱️ {course.estimatedHours}h</span>
                        </div>
                        <div>
                            <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {showVideoModal && selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Video Preview</h3>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="aspect-video">
                                <iframe
                                    src={getYouTubeEmbedUrl(selectedVideo)}
                                    className="w-full h-full rounded-lg"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Course Video Preview"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursePreview;
