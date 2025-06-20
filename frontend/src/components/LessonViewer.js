import React, { useState, useEffect } from 'react';
import EnhancedLessonDisplay from './EnhancedLessonDisplay';
import { Card, Button, Badge } from './ui';

const LessonViewer = ({ lessons, courseTitle, isEnrolled = false }) => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => {
    // Load completed lessons from localStorage
    const saved = localStorage.getItem(`completed-lessons-${courseTitle}`);
    if (saved) {
      setCompletedLessons(new Set(JSON.parse(saved)));
    }
  }, [courseTitle]);

  const markLessonComplete = (lessonId) => {
    const newCompleted = new Set(completedLessons);
    newCompleted.add(lessonId);
    setCompletedLessons(newCompleted);
    localStorage.setItem(`completed-lessons-${courseTitle}`, JSON.stringify([...newCompleted]));
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const renderVideoPlayer = (videoUrl) => {
    if (!videoUrl) return null;
    
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) return null;

    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="Lesson Video"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  };

  const renderLessonContent = (lesson) => {
    if (!lesson) return null;

    return (
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
          <div className="flex items-center space-x-3">
            <span className="text-blue-200 text-sm">⏱️ {lesson.durationMinutes} min</span>
            {completedLessons.has(lesson.id) && (
              <span className="text-green-400 text-sm">✅ Completed</span>
            )}
          </div>
        </div>

        {/* Brief Description */}
        {lesson.content && (
          <div className="mb-6">
            <p className="text-blue-200 text-lg">{lesson.content}</p>
          </div>
        )}

        {/* Video Player */}
        {lesson.videoUrl && renderVideoPlayer(lesson.videoUrl)}

        {/* Detailed Notes */}
        {lesson.notes && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">📝 Lesson Notes</h3>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div 
                className="prose prose-invert max-w-none text-blue-100"
                dangerouslySetInnerHTML={{ __html: lesson.notes }}
              />
            </div>
          </div>
        )}

        {/* Mark Complete Button */}
        {isEnrolled && !completedLessons.has(lesson.id) && (
          <div className="flex justify-center">
            <button
              onClick={() => markLessonComplete(lesson.id)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
            >
              ✅ Mark as Complete
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderLessonList = () => {
    if (!lessons || lessons.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-blue-200">No lessons available yet.</p>
        </div>
      );
    }

    // Sort lessons by order
    const sortedLessons = [...lessons].sort((a, b) => {
      const orderA = a.lessonOrder || a.order || 0;
      const orderB = b.lessonOrder || b.order || 0;
      return orderA - orderB;
    });

    return (
      <div className="space-y-4">
        {sortedLessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className={`bg-white/10 rounded-xl p-4 border border-white/20 cursor-pointer transition-all duration-200 hover:bg-white/20 ${
              selectedLesson?.id === lesson.id ? 'ring-2 ring-blue-500 bg-white/20' : ''
            }`}
            onClick={() => setSelectedLesson(lesson)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  completedLessons.has(lesson.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-white/20 text-blue-200'
                }`}>
                  {completedLessons.has(lesson.id) ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{lesson.title}</h3>
                  <p className="text-blue-200 text-sm line-clamp-2">{lesson.content}</p>
                  <div className="flex items-center space-x-2 text-blue-300 text-xs mt-1">
                    <span>⏱️ {lesson.durationMinutes} min</span>
                    {lesson.videoUrl && <span>🎥 Video</span>}
                    {lesson.notes && <span>📝 Notes</span>}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLesson(lesson);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  📖 Start
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const calculateProgress = () => {
    if (!lessons || lessons.length === 0) return 0;
    return Math.round((completedLessons.size / lessons.length) * 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lesson List Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white/10 rounded-xl p-6 border border-white/20 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Course Content</h2>
            <span className="text-blue-200 text-sm">{lessons?.length || 0} lessons</span>
          </div>

          {/* Progress Bar */}
          {isEnrolled && lessons && lessons.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-200 text-sm">Progress</span>
                <span className="text-white font-semibold">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <div className="text-blue-300 text-xs mt-1">
                {completedLessons.size} of {lessons.length} lessons completed
              </div>
            </div>
          )}

          {/* Lesson List */}
          {renderLessonList()}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="lg:col-span-2">
        {selectedLesson ? (
          <EnhancedLessonDisplay
            lesson={selectedLesson}
            isInstructor={false}
          />
        ) : (
          <Card background="transparent" className="text-center p-8">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to the Course!</h2>
            <p className="text-blue-200 mb-6">
              Click on any lesson from the sidebar or use the "📖 Start" button to begin learning. Each lesson includes comprehensive content,
              interactive elements, and rich educational materials powered by AI.
            </p>
            {!isEnrolled && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  💡 <strong>Tip:</strong> Enroll in this course to track your progress and access all features!
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;
