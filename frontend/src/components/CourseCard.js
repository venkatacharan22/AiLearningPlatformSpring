import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Button, Badge, DifficultyBadge } from './ui';

const CourseCard = ({ course, showEnrollButton = true, variant = 'default' }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Programming': return '💻';
      case 'Web Development': return '🌐';
      case 'Data Science': return '📊';
      case 'Machine Learning': return '🤖';
      case 'DevOps': return '🔧';
      case 'Mobile Development': return '📱';
      default: return '📚';
    }
  };

  if (variant === 'enhanced') {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{getCategoryIcon(course.category)}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors line-clamp-2">
              {course.title}
            </h3>
            <Badge variant="primary" size="sm" className="mt-1">
              {course.category}
            </Badge>
          </div>
        </div>

        <p className="text-blue-200 text-sm mb-4 line-clamp-3">{course.description}</p>

        <div className="flex items-center justify-between mb-4">
          <DifficultyBadge difficulty={course.difficulty} />
          <div className="flex items-center space-x-2">
            {course.averageRating > 0 && (
              <Badge variant="warning" size="sm">
                ⭐ {course.averageRating.toFixed(1)}
              </Badge>
            )}
            <Badge variant="info" size="sm">
              👥 {course.totalEnrollments}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 text-blue-200 text-sm">
          <span>⏱️ {course.estimatedHours} hours</span>
          <span>👨‍🏫 {course.instructorName}</span>
        </div>

        <Link to={`/courses/${course.id}`} className="w-full">
          <Button variant="primary" className="w-full">
            {showEnrollButton ? 'View Course Details' : 'Manage Course'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <AcademicCapIcon className="h-6 w-6 text-blue-600 flex-shrink-0 ml-2" />
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <DifficultyBadge difficulty={course.difficulty} />
          {course.category && (
            <Badge variant="primary" size="sm">
              {course.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {course.estimatedHours}h
          </div>
          <div className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {course.totalEnrollments} students
          </div>
          {course.averageRating > 0 && (
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
              {course.averageRating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Instructor:</span> {course.instructorName}
          </p>
        </div>

        <Link to={`/courses/${course.id}`} className="w-full">
          <Button variant="primary" className="w-full">
            {showEnrollButton ? 'View Course' : 'Manage Course'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
