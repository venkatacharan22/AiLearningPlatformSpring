import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, LoadingSpinner } from '../components/ui';
import { courseAPI, studentAPI } from '../services/api';

const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    fetchLessonData();
    setStartTime(Date.now());

    // Track time spent
    const interval = setInterval(() => {
      if (startTime) {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // minutes
      }
    }, 60000); // Update every minute

    return () => {
      clearInterval(interval);
      if (startTime && timeSpent > 0) {
        // Save progress when leaving
        saveProgress(false);
      }
    };
  }, [courseId, lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Fetching lesson data for courseId:', courseId, 'lessonId:', lessonId);

      // Validate parameters
      if (!courseId || !lessonId || lessonId === 'null' || lessonId === 'undefined') {
        setError('Invalid course or lesson ID. Please go back and try again.');
        return;
      }

      // Fetch course details first
      const courseResponse = await courseAPI.getCourse(courseId);
      const courseData = courseResponse.data || courseResponse;
      setCourse(courseData);

      console.log('📚 Course data:', courseData);
      console.log('📚 Course lessons:', courseData.lessons);

      // Find lesson in course lessons
      let foundLesson = null;
      if (courseData.lessons && courseData.lessons.length > 0) {
        // Try to find by exact ID match first
        foundLesson = courseData.lessons.find(l => String(l.id) === String(lessonId));

        // If not found, try to find by index (in case lessonId is an index)
        if (!foundLesson) {
          const lessonIndex = parseInt(lessonId);
          if (!isNaN(lessonIndex) && lessonIndex >= 0 && lessonIndex < courseData.lessons.length) {
            foundLesson = courseData.lessons[lessonIndex];
            console.log('📖 Found lesson by index:', foundLesson);
          }
        }

        // If still not found, try to find by title or order
        if (!foundLesson) {
          foundLesson = courseData.lessons.find(l =>
            l.title && l.title.toLowerCase().includes(lessonId.toLowerCase())
          );
        }

        console.log('🔍 Found lesson in course:', foundLesson);
      }

      // If no lesson found, create a demo lesson
      if (!foundLesson) {
        console.warn('⚠️ Lesson not found, creating demo lesson');
        foundLesson = {
          id: lessonId,
          title: `Lesson ${lessonId}`,
          content: 'This is a sample lesson content. In a real application, this would contain the actual lesson material.',
          notes: '<h3>Welcome to this lesson!</h3><p>This lesson contains important learning material. Here you can find detailed explanations, examples, and exercises to help you master the topic.</p><ul><li>Interactive content</li><li>Video materials</li><li>Practice exercises</li><li>Additional resources</li></ul>',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Demo video
          durationMinutes: 30,
          type: 'video'
        };
      }

      setLesson(foundLesson);

      // Load completion status from localStorage
      const completedKey = `lesson-completed-${courseId}-${lessonId}`;
      const isLessonCompleted = localStorage.getItem(completedKey) === 'true';
      setIsCompleted(isLessonCompleted);

      // Load video progress from localStorage
      const progressKey = `lesson-progress-${courseId}-${lessonId}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        setVideoProgress(parseInt(savedProgress) || 0);
      }

    } catch (error) {
      console.error('❌ Error fetching lesson data:', error);
      setError('Failed to load lesson data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (completed = false) => {
    try {
      // Save to localStorage as primary storage
      const completedKey = `lesson-completed-${courseId}-${lessonId}`;
      const progressKey = `lesson-progress-${courseId}-${lessonId}`;
      const timeKey = `lesson-time-${courseId}-${lessonId}`;

      if (completed) {
        localStorage.setItem(completedKey, 'true');
        setIsCompleted(true);
      }

      localStorage.setItem(progressKey, videoProgress.toString());
      localStorage.setItem(timeKey, timeSpent.toString());

      // Try to save to backend if available
      try {
        await studentAPI.updateLessonProgress(courseId, lessonId, {
          completed,
          timeSpent: timeSpent
        });
        console.log('✅ Progress saved to backend');
      } catch (error) {
        console.warn('⚠️ Backend progress save failed, using localStorage:', error);
      }

    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
  };

  const handleVideoProgress = async (percentage) => {
    setVideoProgress(percentage);

    // Save video progress to localStorage
    const progressKey = `lesson-progress-${courseId}-${lessonId}`;
    localStorage.setItem(progressKey, percentage.toString());

    try {
      // Try to save to backend
      await studentAPI.updateVideoProgress(courseId, lessonId, {
        watchedPercentage: percentage
      });

      // Auto-complete if watched 90% or more
      if (percentage >= 90 && !isCompleted) {
        await saveProgress(true);
      }
    } catch (error) {
      console.warn('⚠️ Video progress backend save failed:', error);
      // Auto-complete locally if watched 90% or more
      if (percentage >= 90 && !isCompleted) {
        await saveProgress(true);
      }
    }
  };

  const handleCompleteLesson = async () => {
    setSubmitting(true);
    try {
      await saveProgress(true);

      // Show success message and navigate back
      alert('🎉 Lesson completed successfully! Great job!');

      // Small delay to ensure state updates
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 500);
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
      alert('✅ Lesson marked as complete locally! (Backend sync may have failed)');
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      // Always save progress locally first
      await saveProgress(true);

      // Try to submit for review
      try {
        await studentAPI.submitLessonForReview(courseId, lessonId, {
          timeSpent,
          videoProgress,
          notes: `Student completed lesson "${lesson?.title || 'Unknown'}" and submitted for review.`,
          completedAt: new Date().toISOString()
        });
        alert('📝 Lesson submitted for instructor review! You will receive feedback soon.');
      } catch (reviewError) {
        console.warn('⚠️ Review submission failed, but lesson marked complete:', reviewError);
        alert('✅ Lesson completed! (Review submission may have failed, but your progress is saved)');
      }

      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 500);
    } catch (error) {
      console.error('❌ Error in submission process:', error);
      alert('✅ Lesson marked as complete locally!');
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 500);
    } finally {
      setSubmitting(false);
    }
  };

  const renderVideoPlayer = (videoUrl) => {
    if (!videoUrl || videoUrl.trim() === '') return null;

    // Convert YouTube URL to embed format
    const getEmbedUrl = (url) => {
      try {
        // Handle various YouTube URL formats
        const patterns = [
          /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
          /(?:youtu\.be\/)([^&\n?#]+)/,
          /(?:youtube\.com\/embed\/)([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) {
            return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&rel=0`;
          }
        }

        // If it's already an embed URL, return as is
        if (url.includes('youtube.com/embed/')) {
          return url;
        }

        // Return original URL if no pattern matches
        return url;
      } catch (error) {
        console.warn('⚠️ Error processing video URL:', error);
        return url;
      }
    };

    const embedUrl = getEmbedUrl(videoUrl);

    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">🎥</span>
          Video Content
        </h3>
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title={lesson?.title || 'Lesson Video'}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => {
              console.log('✅ Video loaded successfully');
            }}
            onError={() => {
              console.warn('⚠️ Video failed to load');
            }}
          />
        </div>

        {/* Video Progress */}
        <div className="mt-4 bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between text-sm text-blue-200 mb-2">
            <span className="font-medium">Video Progress</span>
            <span className="font-bold">{videoProgress}% watched</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${videoProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-blue-300">
            <span>Click and drag to simulate progress</span>
            <button
              onClick={() => handleVideoProgress(Math.min(videoProgress + 10, 100))}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              +10%
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white text-lg mt-4">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card background="transparent" className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Lesson</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate(`/courses/${courseId}`)}>
            ← Back to Course
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/courses/${courseId}`)}
              className="text-white border-white/30 hover:bg-white/10"
            >
              ← Back to Course
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{lesson?.title}</h1>
              <p className="text-blue-200">{course?.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant={isCompleted ? 'success' : 'info'} size="lg">
              {isCompleted ? '✅ Completed' : '📚 In Progress'}
            </Badge>
            <div className="text-right text-blue-200 text-sm">
              <div>⏱️ Time: {timeSpent} min</div>
              <div>📊 Progress: {Math.round((videoProgress + (isCompleted ? 100 : 0)) / 2)}%</div>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card background="transparent" className="p-8">
              {/* Lesson Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">📋 Lesson Overview</h2>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <p className="text-blue-200 text-lg leading-relaxed">
                    {lesson?.content || lesson?.description || 'This lesson contains valuable learning content. Start exploring to learn more!'}
                  </p>
                </div>
              </div>

              {/* Video Content */}
              {lesson?.videoUrl ? (
                renderVideoPlayer(lesson.videoUrl)
              ) : (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">📖</span>
                    Text-Based Learning
                  </h3>
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-400/20">
                    <div className="text-center py-4">
                      <div className="text-4xl mb-4">📚</div>
                      <p className="text-blue-200 text-lg mb-2">Interactive Learning Content</p>
                      <p className="text-blue-300 text-sm">
                        This lesson focuses on text-based learning with comprehensive notes and explanations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lesson Notes Preview */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">📝 Lesson Notes</h3>
                  {lesson?.notes && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="text-white border-white/30 hover:bg-white/10"
                    >
                      {showFullContent ? 'Show Less' : 'Show Full Content'}
                    </Button>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  {lesson?.notes ? (
                    <div
                      className={`prose prose-invert max-w-none text-blue-100 ${
                        showFullContent ? '' : 'line-clamp-6'
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: showFullContent ? lesson.notes : lesson.notes.substring(0, 500) + (lesson.notes.length > 500 ? '...' : '')
                      }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📚</div>
                      <p className="text-blue-200 text-lg mb-2">Rich Lesson Notes</p>
                      <p className="text-blue-300 text-sm">
                        Detailed lesson notes and explanations will be available here.
                        This lesson contains valuable content to help you learn effectively.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                {!isCompleted && (
                  <>
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleCompleteLesson}
                      disabled={submitting}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {submitting ? '⏳ Completing...' : '✅ Mark as Complete'}
                    </Button>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSubmitForReview}
                      disabled={submitting}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {submitting ? '⏳ Submitting...' : '📝 Submit for Review'}
                    </Button>
                  </>
                )}
                
                {isCompleted && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 w-full">
                    <div className="flex items-center justify-center text-green-300">
                      <span className="text-2xl mr-3">🎉</span>
                      <div className="text-center">
                        <div className="font-semibold">Lesson Completed!</div>
                        <div className="text-sm">Great job on finishing this lesson.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card background="transparent" className="p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-6">📊 Lesson Progress</h3>
              
              {/* Progress Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-blue-200">Time Spent</span>
                  <span className="text-white font-semibold">{timeSpent} min</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-blue-200">Video Progress</span>
                  <span className="text-white font-semibold">{videoProgress}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-blue-200">Status</span>
                  <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
                    {isCompleted ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>
              </div>

              {/* Lesson Info */}
              <div className="space-y-3 mb-6">
                <h4 className="text-white font-semibold">📚 Lesson Details</h4>
                <div className="text-blue-200 text-sm space-y-2">
                  <div>⏱️ Duration: {lesson?.durationMinutes || 30} minutes</div>
                  {lesson?.videoUrl && <div>🎥 Includes video content</div>}
                  {lesson?.notes && <div>📝 Rich lesson notes available</div>}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold">⚡ Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullContent(!showFullContent)}
                    className="w-full text-white border-white/30 hover:bg-white/10"
                  >
                    {showFullContent ? '📖 Hide Content' : '📖 Show Full Content'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="w-full text-white border-white/30 hover:bg-white/10"
                  >
                    🖨️ Print Lesson
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
