import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, LoadingSpinner } from './ui';
import EnhancedLessonDisplay from './EnhancedLessonDisplay';

const StudentCourseFlow = ({ lessons, assignments, courseTitle, courseId, isEnrolled }) => {
  const [courseFlow, setCourseFlow] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    console.log('🔄 StudentCourseFlow received:', {
      lessons: lessons?.length || 0,
      assignments: assignments?.length || 0,
      assignmentDetails: assignments
    });
    buildCourseFlow();
  }, [lessons, assignments]);

  const buildCourseFlow = () => {
    setLoading(true);
    const flowItems = [];

    // Add lessons with proper ordering
    if (lessons && lessons.length > 0) {
      lessons.forEach((lesson, index) => {
        flowItems.push({
          id: `lesson-${lesson.id}`,
          type: 'lesson',
          data: lesson,
          order: lesson.lessonOrder || index + 1,
          title: lesson.title,
          duration: lesson.durationMinutes || 30,
          icon: '📚'
        });
      });
    }

    // Add assignments with proper ordering and source tracking
    if (assignments && assignments.length > 0) {
      assignments.forEach((assignment, index) => {
        const assignmentIcon = getAssignmentIcon(assignment);
        flowItems.push({
          id: `assignment-${assignment.id}`,
          type: 'assignment',
          data: assignment,
          order: assignment.order || (lessons.length + index + 1),
          title: assignment.title,
          duration: assignment.timeLimit || 60,
          icon: assignmentIcon,
          source: assignment.source || (assignment.aiGenerated ? 'AI_GENERATED' : 'MANUAL')
        });
      });
    }

    // Sort by order
    flowItems.sort((a, b) => a.order - b.order);
    setCourseFlow(flowItems);

    setLoading(false);
  };

  const getAssignmentIcon = (assignment) => {
    if (assignment.source === 'SKIPPED') return '⏭️';
    if (assignment.source === 'CODEFORCES') return '🏆';
    if (assignment.source === 'AI_GENERATED' || assignment.aiGenerated) return '🤖';
    return assignment.type === 'CODING' ? '💻' : assignment.type === 'QUIZ' ? '📋' : '📝';
  };

  const getAssignmentSourceBadge = (assignment) => {
    if (assignment.source === 'SKIPPED') {
      return { text: 'Skipped', variant: 'secondary', color: 'bg-gray-500/20 text-gray-300 border-gray-400/30' };
    }
    if (assignment.source === 'CODEFORCES') {
      return { text: 'Codeforces', variant: 'success', color: 'bg-green-500/20 text-green-300 border-green-400/30' };
    }
    if (assignment.source === 'AI_GENERATED' || assignment.aiGenerated) {
      return { text: 'AI Generated', variant: 'info', color: 'bg-purple-500/20 text-purple-300 border-purple-400/30' };
    }
    return { text: 'Manual', variant: 'primary', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' };
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Course Introduction */}
      <Card background="transparent" className="p-8">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to {courseTitle}!
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            🗺️ This course contains {lessons?.length || 0} lessons and {assignments?.length || 0} assignments designed to help you master the subject.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-white font-semibold mb-2">Interactive Lessons</h3>
            <p className="text-blue-200 text-sm">Learn with rich content, videos, and examples</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <div className="text-3xl mb-3">💻</div>
            <h3 className="text-white font-semibold mb-2">Coding Challenges</h3>
            <p className="text-blue-200 text-sm">Practice with real programming problems</p>
          </div>
        </div>

        {!isEnrolled && (
          <div className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-6">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">💡</span>
              <span className="text-yellow-200 font-semibold">Pro Tip</span>
            </div>
            <p className="text-yellow-200 text-sm text-center">
              Enroll in this course to track your progress, save your work, and access all premium features!
            </p>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <Card background="transparent" className="p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">📊</span>
          Course Statistics
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📚</span>
              <span className="text-white font-medium">Total Lessons</span>
            </div>
            <span className="text-blue-300 font-bold text-xl">{lessons?.length || 0}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🎯</span>
              <span className="text-white font-medium">Total Assignments</span>
            </div>
            <span className="text-blue-300 font-bold text-xl">{assignments?.length || 0}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🤖</span>
              <span className="text-white font-medium">AI Generated</span>
            </div>
            <span className="text-purple-300 font-bold text-xl">
              {assignments?.filter(a => a.source === 'AI_GENERATED' || a.aiGenerated).length || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏆</span>
              <span className="text-white font-medium">Codeforces</span>
            </div>
            <span className="text-green-300 font-bold text-xl">
              {assignments?.filter(a => a.source === 'CODEFORCES').length || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏭️</span>
              <span className="text-white font-medium">Skipped</span>
            </div>
            <span className="text-gray-300 font-bold text-xl">
              {assignments?.filter(a => a.source === 'SKIPPED').length || 0}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderLessonsTab = () => (
    <Card background="transparent" className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <span className="mr-3">📚</span>
          Course Lessons
        </h2>
        <div className="text-blue-200 text-sm">
          {lessons?.length || 0} lesson{(lessons?.length || 0) !== 1 ? 's' : ''} available
        </div>
      </div>

      {lessons && lessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:from-white/10 hover:to-white/15 hover:border-white/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{lesson.title}</h3>
                    <div className="flex items-center text-blue-200 text-sm mt-1">
                      <span className="mr-3">⏱️ {lesson.durationMinutes || 30} min</span>
                      {lesson.videoUrl && <span className="mr-3">🎥 Video</span>}
                    </div>
                  </div>
                </div>
                <span className="text-3xl">📚</span>
              </div>

              <p className="text-blue-200 text-sm mb-4 line-clamp-3">
                {lesson.content || lesson.description || 'Lesson content will be available when you start learning.'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="info" size="sm">Lesson {index + 1}</Badge>
                  {lesson.videoUrl && <Badge variant="success" size="sm">Video</Badge>}
                </div>
                <Link to={`/courses/${courseId}/lessons/${lesson.id || index}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    📖 Start Lesson
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-8xl mb-6 animate-pulse">📚</div>
          <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            No Lessons Available Yet
          </h3>
          <p className="text-blue-200 text-lg mb-8 max-w-md mx-auto">
            The instructor is still preparing lesson content. Check back soon for engaging learning materials!
          </p>
        </div>
      )}
    </Card>
  );

  const renderAssignmentsTab = () => (
    <Card background="transparent" className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <span className="mr-3">🎯</span>
          Course Assignments
        </h2>
        <div className="text-blue-200 text-sm">
          {assignments?.length || 0} assignment{(assignments?.length || 0) !== 1 ? 's' : ''} available
        </div>
      </div>

      {assignments && assignments.length > 0 ? (
        <div className="space-y-6">
          {/* Assignment Type Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3 border border-white/20">
              <span className="text-white font-medium">Filter by type:</span>
              <Badge variant="info" size="sm" className="bg-purple-500/20 text-purple-300">
                🤖 AI ({assignments.filter(a => a.source === 'AI_GENERATED' || a.aiGenerated).length})
              </Badge>
              <Badge variant="success" size="sm" className="bg-green-500/20 text-green-300">
                🏆 Codeforces ({assignments.filter(a => a.source === 'CODEFORCES').length})
              </Badge>
              <Badge variant="secondary" size="sm" className="bg-gray-500/20 text-gray-300">
                ⏭️ Skipped ({assignments.filter(a => a.source === 'SKIPPED').length})
              </Badge>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment, index) => {
              const sourceBadge = getAssignmentSourceBadge(assignment);
              const isSkipped = assignment.source === 'SKIPPED';

              return (
                <div key={assignment.id} className={`bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:from-white/10 hover:to-white/15 hover:border-white/30 transition-all duration-300 ${isSkipped ? 'opacity-75' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 ${isSkipped ? 'bg-gray-500/20' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
                        {getAssignmentIcon(assignment)}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{assignment.title}</h3>
                        <div className="flex items-center space-x-3 text-blue-200 text-sm mt-1">
                          <Badge
                            variant={assignment.type === 'CODING' ? 'primary' : 'info'}
                            size="sm"
                          >
                            {assignment.type}
                          </Badge>
                          <Badge
                            variant={
                              assignment.difficulty === 'EASY' ? 'success' :
                              assignment.difficulty === 'MEDIUM' ? 'warning' : 'danger'
                            }
                            size="sm"
                          >
                            {assignment.difficulty}
                          </Badge>
                          <span className={sourceBadge.color + ' px-2 py-1 rounded-full text-xs font-medium border'}>
                            {sourceBadge.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-blue-200 text-sm mb-4 line-clamp-3">
                    {assignment.description || 'Assignment details will be available when you start working on it.'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-blue-200 text-sm">
                      {!isSkipped && (
                        <>
                          <span>⏱️ {assignment.timeLimit || 60} min</span>
                          <span>🎯 {assignment.points || 100} pts</span>
                        </>
                      )}
                    </div>

                    {isSkipped ? (
                      <div className="text-gray-400 text-sm font-medium">
                        Assignment was skipped during course creation
                      </div>
                    ) : (
                      <Link to={`/assignments/${assignment.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {assignment.type === 'CODING' ? '🚀 Start Coding' : '📝 Start Assignment'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-8xl mb-6 animate-pulse">🎯</div>
          <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            No Assignments Available Yet
          </h3>
          <p className="text-blue-200 text-lg mb-8 max-w-md mx-auto">
            The instructor is still preparing assignments for this course. Check back soon for exciting coding challenges!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-blue-200 text-sm">AI Generated</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-blue-200 text-sm">Codeforces</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-blue-200 text-sm">Custom</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );

  const renderProgressTab = () => (
    <Card background="transparent" className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <span className="mr-3">📊</span>
          Learning Progress
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overall Progress */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">🎯</span>
            Overall Progress
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-200">Course Completion</span>
              <span className="text-white font-bold">
                {Math.round((completedItems.size / Math.max(courseFlow.length, 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(completedItems.size / Math.max(courseFlow.length, 1)) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{completedItems.size}</div>
                <div className="text-blue-200 text-sm">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{courseFlow.length - completedItems.size}</div>
                <div className="text-blue-200 text-sm">Remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">🏆</span>
            Achievements
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-3xl mb-2">🎓</div>
              <div className="text-white font-semibold text-sm">Course Explorer</div>
              <div className="text-blue-200 text-xs">Started learning</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-center opacity-50">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-white font-semibold text-sm">Lesson Master</div>
              <div className="text-blue-200 text-xs">Complete 5 lessons</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-center opacity-50">
              <div className="text-3xl mb-2">💻</div>
              <div className="text-white font-semibold text-sm">Code Warrior</div>
              <div className="text-blue-200 text-xs">Complete 3 assignments</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-center opacity-50">
              <div className="text-3xl mb-2">🌟</div>
              <div className="text-white font-semibold text-sm">Course Champion</div>
              <div className="text-blue-200 text-xs">Complete course</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const getItemProgress = (item) => {
    if (completedItems.has(item.id)) {
      return 'completed';
    }
    return 'pending';
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white';
      case 'current': return 'bg-blue-600 text-white';
      case 'pending': return 'bg-white/20 text-blue-200';
      default: return 'bg-white/20 text-blue-200';
    }
  };

  const renderFlowItem = (item, index) => {
    const progress = getItemProgress(item);
    const isSelected = selectedItem?.id === item.id;

    return (
      <div
        key={item.id}
        className={`group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 cursor-pointer transition-all duration-300 hover:from-white/10 hover:to-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/10 ${
          isSelected ? 'ring-2 ring-blue-400 from-white/15 to-white/20 border-blue-400/50 shadow-lg shadow-blue-500/20' : ''
        }`}
        onClick={() => setSelectedItem(item)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getProgressColor(progress)} ${
              isSelected ? 'scale-110' : 'group-hover:scale-105'
            }`}>
              {progress === 'completed' ? '✓' : index + 1}
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
              <div>
                <h3 className="text-white font-bold text-lg group-hover:text-blue-200 transition-colors duration-300">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-3 text-blue-200 text-sm mt-1">
                  <Badge
                    variant={item.type === 'lesson' ? 'info' : 'primary'}
                    size="sm"
                    className="capitalize font-medium"
                  >
                    {item.type}
                  </Badge>
                  <span className="flex items-center">
                    <span className="mr-1">⏱️</span>
                    {item.duration} min
                  </span>
                  {item.data.difficulty && (
                    <Badge
                      variant={
                        item.data.difficulty === 'EASY' ? 'success' :
                        item.data.difficulty === 'MEDIUM' ? 'warning' : 'danger'
                      }
                      size="sm"
                      className="font-medium"
                    >
                      {item.data.difficulty}
                    </Badge>
                  )}
                  {item.data.points && (
                    <span className="flex items-center text-yellow-300">
                      <span className="mr-1">🎯</span>
                      {item.data.points} pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {item.type === 'assignment' && (
            <Link to={`/assignments/${item.data.id}`}>
              <Button
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {item.data.type === 'CODING' ? '🚀 Solve' : '📝 Start'}
              </Button>
            </Link>
          )}
        </div>

        {/* Progress indicator */}
        {index < courseFlow.length - 1 && (
          <div className="flex justify-center mt-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full opacity-60"></div>
          </div>
        )}
      </div>
    );
  };

  const renderSelectedContent = () => {
    if (!selectedItem) {
      return (
        <Card background="transparent" className="text-center p-12">
          <div className="text-8xl mb-6 animate-bounce">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to {courseTitle}!
          </h2>
          <p className="text-blue-200 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            🗺️ Follow the learning path on the left to progress through lessons and assignments.
            Each step builds upon the previous one for optimal learning experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-white font-semibold mb-2">Interactive Lessons</h3>
              <p className="text-blue-200 text-sm">Learn with rich content, videos, and examples</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="text-white font-semibold mb-2">Coding Challenges</h3>
              <p className="text-blue-200 text-sm">Practice with real programming problems</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-white font-semibold mb-2">Track Progress</h3>
              <p className="text-blue-200 text-sm">Monitor your learning journey</p>
            </div>
          </div>

          {!isEnrolled && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-3">
                <span className="text-2xl mr-2">💡</span>
                <span className="text-yellow-200 font-semibold">Pro Tip</span>
              </div>
              <p className="text-yellow-200 text-sm">
                Enroll in this course to track your progress, save your work, and access all premium features!
              </p>
            </div>
          )}
        </Card>
      );
    }

    if (selectedItem.type === 'lesson') {
      return (
        <EnhancedLessonDisplay
          lesson={selectedItem.data}
          isInstructor={false}
        />
      );
    }

    if (selectedItem.type === 'assignment') {
      return (
        <Card background="transparent" className="overflow-hidden">
          {/* Assignment Header */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-5xl">{selectedItem.icon}</div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedItem.data.title}</h2>
                  <div className="flex items-center space-x-3 text-blue-200">
                    <Badge variant="primary" size="md" className="font-semibold">
                      {selectedItem.data.type}
                    </Badge>
                    <Badge
                      variant={
                        selectedItem.data.difficulty === 'EASY' ? 'success' :
                        selectedItem.data.difficulty === 'MEDIUM' ? 'warning' : 'danger'
                      }
                      size="md"
                      className="font-semibold"
                    >
                      {selectedItem.data.difficulty}
                    </Badge>
                    <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                      <span className="mr-1">⏱️</span>
                      {selectedItem.data.timeLimit || 60} min
                    </span>
                    <span className="flex items-center bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                      <span className="mr-1">🎯</span>
                      {selectedItem.data.points} points
                    </span>
                  </div>
                </div>
              </div>

              {selectedItem.data.aiGenerated && (
                <Badge variant="info" size="lg" className="flex items-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-400/30">
                  <span className="mr-1">🤖</span>
                  AI Generated
                </Badge>
              )}
            </div>
          </div>

          {/* Assignment Content */}
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Assignment Description
              </h3>
              <p className="text-blue-200 leading-relaxed text-lg">
                {selectedItem.data.description || 'Complete this assignment to test your understanding and apply what you\'ve learned.'}
              </p>
            </div>

            {selectedItem.data.problemStatement && (
              <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl p-6 border border-blue-400/20">
                <h4 className="text-white font-bold text-xl mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Problem Statement
                </h4>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <p className="text-blue-100 whitespace-pre-wrap leading-relaxed text-lg">
                    {selectedItem.data.problemStatement}
                  </p>
                </div>
              </div>
            )}

            {selectedItem.data.examples && selectedItem.data.examples.length > 0 && (
              <div className="bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-xl p-6 border border-green-400/20">
                <h4 className="text-white font-bold text-xl mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  Example
                </h4>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="font-bold text-green-300 w-20 flex-shrink-0">Input:</span>
                      <span className="text-blue-200 font-mono bg-white/10 px-3 py-1 rounded">
                        {selectedItem.data.examples[0].input}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-blue-300 w-20 flex-shrink-0">Output:</span>
                      <span className="text-blue-200 font-mono bg-white/10 px-3 py-1 rounded">
                        {selectedItem.data.examples[0].output}
                      </span>
                    </div>
                    {selectedItem.data.examples[0].explanation && (
                      <div className="flex items-start">
                        <span className="font-bold text-purple-300 w-20 flex-shrink-0">Note:</span>
                        <span className="text-blue-200">
                          {selectedItem.data.examples[0].explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="p-6 bg-gradient-to-r from-white/5 to-white/10 border-t border-white/10">
            <Link to={`/assignments/${selectedItem.data.id}`} className="block">
              <Button
                variant="primary"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                {selectedItem.data.type === 'CODING' ? '🚀 Start Coding Challenge' : '📝 Begin Assignment'}
              </Button>
            </Link>
          </div>
        </Card>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-white text-lg">Loading course content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{courseTitle}</h1>
            <p className="text-blue-200 text-lg">Your learning journey starts here</p>
          </div>
          <div className="text-6xl">🎓</div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-white font-bold text-xl">{lessons?.length || 0}</div>
            <div className="text-blue-200 text-sm">Lessons</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-white font-bold text-xl">{assignments?.length || 0}</div>
            <div className="text-blue-200 text-sm">Assignments</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-white font-bold text-xl">{Math.round((completedItems.size / Math.max(courseFlow.length, 1)) * 100)}%</div>
            <div className="text-blue-200 text-sm">Progress</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-white font-bold text-xl">{isEnrolled ? 'Enrolled' : 'Not Enrolled'}</div>
            <div className="text-blue-200 text-sm">Status</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: '📋 Overview', icon: '📋' },
            { id: 'lessons', label: '📚 Lessons', icon: '📚' },
            { id: 'assignments', label: '🎯 Assignments', icon: '🎯' },
            { id: 'progress', label: '📊 Progress', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'lessons' && renderLessonsTab()}
        {activeTab === 'assignments' && renderAssignmentsTab()}
        {activeTab === 'progress' && renderProgressTab()}
      </div>
    </div>
  );
};

export default StudentCourseFlow;

// Add custom scrollbar styles
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #2563eb, #7c3aed);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
