import React from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'adminDashboard',
    adminAPI.getDashboard
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600">Error loading dashboard</div>;

  const { stats, recentCourses, recentUsers } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage the learning platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Instructors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInstructors}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <EyeIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedCourses}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Courses */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
            <button className="btn btn-outline btn-sm">
              View All
            </button>
          </div>
          <div className="card-body">
            {recentCourses && recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map(course => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          by {course.instructorName}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{course.totalEnrollments} students</span>
                          <span className={`badge ${course.published ? 'badge-success' : 'badge-warning'}`}>
                            {course.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="btn btn-outline btn-sm">
                          View
                        </button>
                        <button className="btn btn-primary btn-sm">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent courses</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <button className="btn btn-outline btn-sm">
              View All
            </button>
          </div>
          <div className="card-body">
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${
                          user.role === 'ADMIN' ? 'badge-danger' :
                          user.role === 'INSTRUCTOR' ? 'badge-warning' :
                          'badge-primary'
                        }`}>
                          {user.role}
                        </span>
                        <button className="btn btn-outline btn-sm">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent users</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="btn btn-outline flex items-center justify-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Manage Users
              </button>
              <button className="btn btn-outline flex items-center justify-center">
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Manage Courses
              </button>
              <button className="btn btn-outline flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Analytics
              </button>
              <button className="btn btn-outline flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
