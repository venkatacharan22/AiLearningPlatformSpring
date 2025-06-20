import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  validateToken: (token) => api.post('/auth/validate', { token }).then(res => res.valid),
};

// Course API
export const courseAPI = {
  getPublicCourses: () => api.get('/courses/public'),
  getCourse: (id) => api.get(`/courses/${id}`),
  searchCourses: (query) => api.get(`/courses/search?query=${query}`),
  getCoursesByCategory: (category) => api.get(`/courses/category/${category}`),
  getCoursesByDifficulty: (difficulty) => api.get(`/courses/difficulty/${difficulty}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  publishCourse: (id) => api.post(`/courses/${id}/publish`),
  unpublishCourse: (id) => api.post(`/courses/${id}/unpublish`),
  enrollInCourse: (id) => api.post(`/courses/${id}/enroll`),
  unenrollFromCourse: (id) => api.post(`/courses/${id}/unenroll`),
  uploadMaterial: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/courses/${id}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  generateSummary: (id) => api.post(`/courses/${id}/generate-summary`),
  generateQuiz: (id, quizData) => api.post(`/courses/${id}/generate-quiz`, quizData),
  addReview: (id, reviewData) => api.post(`/courses/${id}/review`, reviewData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
};

// Student API
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getEnrolledCourses: () => api.get('/student/courses'),
  enrollInCourse: (courseId) => api.post(`/student/courses/${courseId}/enroll`),
  getCourseProgress: (courseId) => api.get(`/student/courses/${courseId}/progress`),
  updateLessonProgress: (courseId, lessonId, progressData) =>
    api.post(`/student/courses/${courseId}/lessons/${lessonId}/progress`, progressData),
  updateVideoProgress: (courseId, lessonId, progressData) =>
    api.post(`/student/courses/${courseId}/lessons/${lessonId}/video-progress`, progressData),
  submitLessonForReview: (courseId, lessonId, reviewData) =>
    api.post(`/student/courses/${courseId}/lessons/${lessonId}/submit-review`, reviewData),
  submitQuiz: (courseId, quizData) => api.post(`/student/courses/${courseId}/quiz/submit`, quizData),
  takeIQTest: () => api.post('/student/iq-test'),
  submitIQTest: (answers) => api.post('/student/iq-test/submit', answers),
  getStudentAssignments: () => api.get('/student/assignments'),
  getStudentSubmissions: () => api.get('/student/submissions'),
  getAssignmentSubmissions: (assignmentId) => api.get(`/student/assignments/${assignmentId}/submissions`),
  getRecommendations: () => api.get('/student/recommendations'),
};

// Instructor API
export const instructorAPI = {
  getDashboard: () => api.get('/instructor/dashboard'),
  getMyCourses: () => api.get('/instructor/courses'),
  getCourseStudents: (courseId) => api.get(`/instructor/courses/${courseId}/students`),
  getCourseAnalytics: (courseId) => api.get(`/instructor/courses/${courseId}/analytics`),
  getAllMyStudents: () => api.get('/instructor/students'),
  getStats: () => api.get('/instructor/stats'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllCourses: () => api.get('/admin/courses'),
  getCourse: (id) => api.get(`/admin/courses/${id}`),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  publishCourse: (id) => api.post(`/admin/courses/${id}/publish`),
  unpublishCourse: (id) => api.post(`/admin/courses/${id}/unpublish`),
  getAnalytics: () => api.get('/admin/analytics'),
  getUserActivityReport: () => api.get('/admin/reports/user-activity'),
  getCoursePerformanceReport: () => api.get('/admin/reports/course-performance'),
};

// Assignment API
export const assignmentAPI = {
  getAssignmentsByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (data) => api.post('/assignments', data),
  generateAssignment: (data) => api.post('/assignments/generate', data),
  generateWithCodeforces: (data) => api.post('/assignments/generate-with-codeforces', data),
  getCodeforcesProblems: (difficulty, topic, limit) => api.get(`/assignments/codeforces-problems?difficulty=${difficulty}&topic=${topic || ''}&limit=${limit || 10}`),
  publishAssignment: (id) => api.post(`/assignments/${id}/publish`),
  unpublishAssignment: (id) => api.post(`/assignments/${id}/unpublish`),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  getMyAssignments: () => api.get('/assignments/instructor/my-assignments'),
  submitAssignment: (id, data) => api.post(`/assignments/${id}/submit`, data),
  createSkippedAssignment: (data) => api.post('/assignments/create-skipped', data),
};

// Lesson API
export const lessonAPI = {
  addLesson: (courseId, lessonData) => api.post(`/lessons/course/${courseId}`, lessonData),
  updateLesson: (courseId, lessonId, lessonData) => api.put(`/lessons/course/${courseId}/lesson/${lessonId}`, lessonData),
  deleteLesson: (courseId, lessonId) => api.delete(`/lessons/course/${courseId}/lesson/${lessonId}`),
  getLesson: (courseId, lessonId) => api.get(`/lessons/course/${courseId}/lesson/${lessonId}`),
  getLessons: (courseId) => api.get(`/lessons/course/${courseId}`),
  reorderLessons: (courseId, lessonIds) => api.put(`/lessons/course/${courseId}/reorder`, { lessonIds }),
  validateYouTubeUrl: (url) => api.post('/lessons/validate-youtube-url', { url }),
  updateLessonNotes: (courseId, lessonId, notes) => api.put(`/lessons/course/${courseId}/lesson/${lessonId}/notes`, { notes }),
  generateLessonNotes: (courseId, lessonId) => api.post(`/lessons/course/${courseId}/lesson/${lessonId}/generate-notes`),
  regenerateLessonNotes: (courseId, lessonId) => api.post(`/lessons/course/${courseId}/lesson/${lessonId}/regenerate-notes`),
  generateLessonContent: (data) => api.post('/lessons/generate-lesson-content', data),
};

// AI API
export const aiAPI = {
  generateCourse: (data) => api.post('/ai/generate-ai-course', data),
  generateQuiz: (data) => api.post('/ai/generate-quiz', data),
  generateIQTest: () => api.post('/ai/generate-iq-test'),
  findYouTubeVideos: (data) => api.post('/ai/find-youtube-videos', data),
};

// Codeforces API
export const codeforcesAPI = {
  getProblems: (difficulty, tags, limit) => api.get(`/codeforces/problems?difficulty=${difficulty || ''}&tags=${tags || ''}&limit=${limit || 10}`),
  getProblemsByDifficulty: (difficulty, topic, count) => api.get(`/codeforces/problems/by-difficulty?difficulty=${difficulty}&topic=${topic || ''}&count=${count || 5}`),
  getContests: (gym) => api.get(`/codeforces/contests?gym=${gym || false}`),
  getUserInfo: (handle) => api.get(`/codeforces/user/${handle}`),
  getTags: () => api.get('/codeforces/tags'),
  testConnection: () => api.get('/codeforces/test'),
};

export default api;
