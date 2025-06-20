import React, { useState, useEffect } from 'react';
import { lessonAPI } from '../services/api';
import RichTextEditor from './RichTextEditor';
import AILessonCreator from './AILessonCreator';
import EnhancedLessonDisplay from './EnhancedLessonDisplay';
import AILessonDemo from './AILessonDemo';
import { Button, Card, Alert } from './ui';

const LessonManager = ({ courseId, lessons, onLessonsUpdate, isInstructor = false, courseTitle = '', courseDifficulty = 'BEGINNER' }) => {
  const [editingLesson, setEditingLesson] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    notes: '',
    videoUrl: '',
    videoTitle: '',
    videoDescription: '',
    durationMinutes: 30,
    type: 'LESSON'
  });

  const resetForm = () => {
    setNewLesson({
      title: '',
      content: '',
      notes: '',
      videoUrl: '',
      videoTitle: '',
      videoDescription: '',
      durationMinutes: 30,
      type: 'LESSON'
    });
    setEditingLesson(null);
    setShowAddForm(false);
    setShowAICreator(false);
    setError('');
    setSuccess('');
  };

  const validateYouTubeUrl = async (url) => {
    if (!url || url.trim() === '') return { valid: true };
    
    try {
      const response = await lessonAPI.validateYouTubeUrl(url);
      return response;
    } catch (error) {
      return { valid: false, error: 'Failed to validate URL' };
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate YouTube URL if provided
      if (newLesson.videoUrl) {
        const validation = await validateYouTubeUrl(newLesson.videoUrl);
        if (!validation.valid) {
          setError(validation.error || 'Invalid YouTube URL');
          setLoading(false);
          return;
        }
        newLesson.videoUrl = validation.processedUrl;
      }

      const addedLesson = await lessonAPI.addLesson(courseId, newLesson);
      setSuccess('Lesson added successfully!');
      resetForm();
      
      if (onLessonsUpdate) {
        onLessonsUpdate();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (lessonId, updatedData) => {
    setLoading(true);
    setError('');

    try {
      // Validate YouTube URL if provided
      if (updatedData.videoUrl) {
        const validation = await validateYouTubeUrl(updatedData.videoUrl);
        if (!validation.valid) {
          setError(validation.error || 'Invalid YouTube URL');
          setLoading(false);
          return;
        }
        updatedData.videoUrl = validation.processedUrl;
      }

      await lessonAPI.updateLesson(courseId, lessonId, updatedData);
      setSuccess('Lesson updated successfully!');
      setEditingLesson(null);
      
      if (onLessonsUpdate) {
        onLessonsUpdate();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    setLoading(true);
    try {
      await lessonAPI.deleteLesson(courseId, lessonId);
      setSuccess('Lesson deleted successfully!');
      
      if (onLessonsUpdate) {
        onLessonsUpdate();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const generateAINotes = async (lessonId) => {
    setLoading(true);
    setError('');

    try {
      const response = await lessonAPI.generateLessonNotes(courseId, lessonId);
      setSuccess('AI notes generated successfully!');

      // Update the editing lesson with generated notes
      if (editingLesson && editingLesson.id === lessonId) {
        setEditingLesson({...editingLesson, notes: response.generatedNotes});
      }

      if (onLessonsUpdate) {
        onLessonsUpdate();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate AI notes');
    } finally {
      setLoading(false);
    }
  };

  const regenerateAINotes = async (lessonId) => {
    setLoading(true);
    setError('');

    try {
      const response = await lessonAPI.regenerateLessonNotes(courseId, lessonId);
      setSuccess('AI notes regenerated successfully!');

      // Update the editing lesson with regenerated notes
      if (editingLesson && editingLesson.id === lessonId) {
        setEditingLesson({...editingLesson, notes: response.regeneratedNotes});
      }

      if (onLessonsUpdate) {
        onLessonsUpdate();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to regenerate AI notes');
    } finally {
      setLoading(false);
    }
  };

  const renderVideoPreview = (videoUrl) => {
    if (!videoUrl) return null;
    
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-white mb-2">Video Preview:</h4>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Video Preview"
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </div>
    );
  };

  const renderLessonForm = (lesson = null, isEditing = false) => {
    const currentLesson = lesson || newLesson;
    const isEdit = isEditing && lesson;

    return (
      <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {isEdit ? 'Edit Lesson' : 'Add New Lesson'}
        </h3>
        
        <form onSubmit={isEdit ? (e) => {
          e.preventDefault();
          handleUpdateLesson(lesson.id, currentLesson);
        } : handleAddLesson}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                value={currentLesson.title}
                onChange={(e) => isEdit ? 
                  setEditingLesson({...lesson, title: e.target.value}) :
                  setNewLesson({...newLesson, title: e.target.value})
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson title"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={currentLesson.durationMinutes}
                onChange={(e) => isEdit ?
                  setEditingLesson({...lesson, durationMinutes: parseInt(e.target.value)}) :
                  setNewLesson({...newLesson, durationMinutes: parseInt(e.target.value)})
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-2">
              Brief Description
            </label>
            <textarea
              value={currentLesson.content}
              onChange={(e) => isEdit ?
                setEditingLesson({...lesson, content: e.target.value}) :
                setNewLesson({...newLesson, content: e.target.value})
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Brief description of the lesson"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-2">
              YouTube Video URL (optional)
            </label>
            <input
              type="url"
              value={currentLesson.videoUrl}
              onChange={(e) => isEdit ?
                setEditingLesson({...lesson, videoUrl: e.target.value}) :
                setNewLesson({...newLesson, videoUrl: e.target.value})
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {renderVideoPreview(currentLesson.videoUrl)}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white text-sm font-medium">
                Detailed Lesson Notes
              </label>
              {isEdit && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => generateAINotes(lesson.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    🤖 Generate AI Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => regenerateAINotes(lesson.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    🔄 Regenerate Notes
                  </button>
                </div>
              )}
            </div>
            <RichTextEditor
              value={currentLesson.notes}
              onChange={(notes) => isEdit ?
                setEditingLesson({...lesson, notes}) :
                setNewLesson({...newLesson, notes})
              }
              placeholder="Enter detailed lesson notes with rich formatting..."
              className="mb-4"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Lesson' : 'Add Lesson')}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="lesson-manager">
      {/* AI Demo Modal */}
      {showDemo && <AILessonDemo onClose={() => setShowDemo(false)} />}

      {/* Header */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">📚 Lesson Management</h2>
            <p className="text-blue-200">Create and manage course lessons with AI-powered content generation</p>
          </div>
          {isInstructor && (
            <Button variant="outline" size="sm" onClick={() => setShowDemo(true)}>
              🎬 See AI Demo
            </Button>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert type="error" title="Error" message={error} dismissible onDismiss={() => setError('')} />
      )}

      {success && (
        <Alert type="success" title="Success" message={success} dismissible onDismiss={() => setSuccess('')} />
      )}

      {/* Add Lesson Buttons */}
      {isInstructor && !showAddForm && !editingLesson && !showAICreator && (
        <div className="mb-6 flex flex-wrap gap-4">
          <Button
            variant="success"
            size="lg"
            onClick={() => setShowAICreator(true)}
            icon="🤖"
            className="flex-1 min-w-[200px]"
          >
            Create AI-Powered Lesson
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowAddForm(true)}
            icon="➕"
            className="flex-1 min-w-[200px]"
          >
            Add Manual Lesson
          </Button>
        </div>
      )}

      {/* AI Lesson Creator */}
      {showAICreator && (
        <AILessonCreator
          courseId={courseId}
          courseTitle={courseTitle}
          courseDifficulty={courseDifficulty}
          onLessonCreated={(lesson) => {
            setSuccess('🎉 AI-powered lesson created successfully!');
            resetForm();
            if (onLessonsUpdate) {
              onLessonsUpdate();
            }
          }}
          onCancel={() => setShowAICreator(false)}
        />
      )}

      {/* Add Lesson Form */}
      {showAddForm && renderLessonForm()}

      {/* Edit Lesson Form */}
      {editingLesson && renderLessonForm(editingLesson, true)}

      {/* Lessons List */}
      <div className="space-y-6">
        {lessons && lessons.length > 0 ? (
          lessons.map((lesson, index) => (
            <div key={lesson.id}>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {lesson.title}
                </h3>
              </div>

              <EnhancedLessonDisplay
                lesson={lesson}
                isInstructor={isInstructor}
                onEdit={setEditingLesson}
                onDelete={handleDeleteLesson}
                onGenerateAI={generateAINotes}
              />
            </div>
          ))
        ) : (
          <Card background="transparent" className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white mb-2">No lessons available yet</h3>
            <p className="text-blue-200 mb-6">
              {isInstructor
                ? "Start creating engaging lessons with AI-powered content generation!"
                : "Lessons will appear here once the instructor adds them."
              }
            </p>
            {isInstructor && (
              <Button variant="success" onClick={() => setShowAICreator(true)}>
                🤖 Create Your First AI Lesson
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default LessonManager;
