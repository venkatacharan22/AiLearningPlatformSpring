import React, { useState, useEffect } from 'react';
import { lessonAPI, assignmentAPI } from '../services/api';

const CourseFlowManager = ({ courseId, lessons, assignments, onUpdate }) => {
  const [courseFlow, setCourseFlow] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    buildCourseFlow();
  }, [lessons, assignments]);

  const buildCourseFlow = () => {
    const flowItems = [];
    
    // Add lessons
    lessons.forEach((lesson, index) => {
      flowItems.push({
        id: `lesson-${lesson.id}`,
        type: 'lesson',
        data: lesson,
        order: lesson.order || index + 1,
        title: lesson.title,
        duration: lesson.durationMinutes
      });
    });

    // Add assignments
    assignments.forEach((assignment, index) => {
      flowItems.push({
        id: `assignment-${assignment.id}`,
        type: 'assignment',
        data: assignment,
        order: assignment.order || (lessons.length + index + 1),
        title: assignment.title,
        duration: assignment.timeLimit || 60
      });
    });

    // Sort by order
    flowItems.sort((a, b) => a.order - b.order);
    setCourseFlow(flowItems);
  };

  const moveItem = async (fromIndex, toIndex) => {
    const items = Array.from(courseFlow);
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setCourseFlow(updatedItems);

    // Save the new order to backend
    try {
      setLoading(true);
      await saveFlowOrder(updatedItems);
      setSuccess('Course flow updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update course flow: ' + error.message);
      setTimeout(() => setError(''), 5000);
      // Revert on error
      buildCourseFlow();
    } finally {
      setLoading(false);
    }
  };

  const saveFlowOrder = async (flowItems) => {
    const lessonIds = [];
    const assignmentUpdates = [];

    flowItems.forEach((item) => {
      if (item.type === 'lesson') {
        lessonIds.push(item.data.id);
      } else if (item.type === 'assignment') {
        assignmentUpdates.push({
          id: item.data.id,
          order: item.order
        });
      }
    });

    // Update lesson order
    if (lessonIds.length > 0) {
      await lessonAPI.reorderLessons(courseId, lessonIds);
    }

    // Update assignment orders (if API supports it)
    // This would need to be implemented in the backend
    for (const update of assignmentUpdates) {
      // await assignmentAPI.updateOrder(update.id, update.order);
    }

    if (onUpdate) {
      onUpdate();
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'lesson': return '📖';
      case 'assignment': return '🎯';
      default: return '📄';
    }
  };

  const getItemColor = (type) => {
    switch (type) {
      case 'lesson': return 'from-blue-600 to-purple-600';
      case 'assignment': return 'from-green-600 to-emerald-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const renderFlowItem = (item, index) => (
    <div
      key={item.id}
      className="bg-white/10 rounded-xl p-4 border border-white/20 mb-3 transition-all duration-200 hover:bg-white/15"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getItemIcon(item.type)}</span>
            <div className="text-white font-medium text-sm bg-white/20 px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold">{item.title}</h3>
            <div className="flex items-center space-x-3 text-blue-200 text-sm">
              <span className="capitalize">{item.type}</span>
              <span>⏱️ {item.duration} min</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${getItemColor(item.type)}`}>
            {item.type.toUpperCase()}
          </div>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => index > 0 && moveItem(index, index - 1)}
              disabled={index === 0 || loading}
              className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed text-sm"
            >
              ↑
            </button>
            <button
              onClick={() => index < courseFlow.length - 1 && moveItem(index, index + 1)}
              disabled={index === courseFlow.length - 1 || loading}
              className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed text-sm"
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const addLessonPlaceholder = () => {
    const newOrder = courseFlow.length + 1;
    const placeholder = {
      id: `lesson-placeholder-${Date.now()}`,
      type: 'lesson',
      data: { id: 'new', title: 'New Lesson', content: '', durationMinutes: 30 },
      order: newOrder,
      title: 'New Lesson',
      duration: 30
    };
    setCourseFlow([...courseFlow, placeholder]);
  };

  const addAssignmentPlaceholder = () => {
    const newOrder = courseFlow.length + 1;
    const placeholder = {
      id: `assignment-placeholder-${Date.now()}`,
      type: 'assignment',
      data: { id: 'new', title: 'New Assignment', timeLimit: 60 },
      order: newOrder,
      title: 'New Assignment',
      duration: 60
    };
    setCourseFlow([...courseFlow, placeholder]);
  };

  const getTotalDuration = () => {
    return courseFlow.reduce((total, item) => total + (item.duration || 0), 0);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="course-flow-manager">
      {/* Header */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">📚 Course Flow Management</h2>
            <p className="text-blue-200">Drag and drop to reorder lessons and assignments</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{courseFlow.length}</div>
            <div className="text-blue-200 text-sm">Total Items</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="text-blue-200 text-sm">Lessons</div>
            <div className="text-white font-semibold">
              {courseFlow.filter(item => item.type === 'lesson').length}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="text-blue-200 text-sm">Assignments</div>
            <div className="text-white font-semibold">
              {courseFlow.filter(item => item.type === 'assignment').length}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="text-blue-200 text-sm">Total Duration</div>
            <div className="text-white font-semibold">{formatDuration(getTotalDuration())}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Add Content Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={addLessonPlaceholder}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          ➕ Add Lesson
        </button>
        <button
          onClick={addAssignmentPlaceholder}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
        >
          🎯 Add Assignment
        </button>
      </div>

      {/* Course Flow */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Course Sequence</h3>
        
        {courseFlow.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-blue-200">No content added yet. Start by adding lessons and assignments!</p>
          </div>
        ) : (
          <div className="min-h-[200px]">
            {courseFlow.map((item, index) => renderFlowItem(item, index))}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-blue-200 mt-2">Updating course flow...</p>
          </div>
        )}
      </div>

      {/* Flow Preview */}
      {courseFlow.length > 0 && (
        <div className="bg-white/10 rounded-xl p-6 border border-white/20 mt-6">
          <h3 className="text-xl font-bold text-white mb-4">Learning Path Preview</h3>
          <div className="flex flex-wrap items-center gap-2">
            {courseFlow.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getItemColor(item.type)}`}>
                  {getItemIcon(item.type)} {item.title}
                </div>
                {index < courseFlow.length - 1 && (
                  <span className="text-blue-300">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseFlowManager;
