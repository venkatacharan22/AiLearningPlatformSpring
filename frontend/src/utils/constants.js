// Application constants

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT'
};

export const COURSE_DIFFICULTIES = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
};

export const COURSE_CATEGORIES = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Cybersecurity',
  'Cloud Computing',
  'DevOps',
  'Database',
  'UI/UX Design',
  'Digital Marketing',
  'Business',
  'Mathematics',
  'Science',
  'Language Learning',
  'Personal Development',
  'Health & Fitness',
  'Arts & Crafts',
  'Music',
  'Photography',
  'Other'
];

export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  FILL_IN_BLANK: 'FILL_IN_BLANK',
  ESSAY: 'ESSAY'
};

export const PROGRESS_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VALIDATE: '/auth/validate'
  },
  COURSES: {
    PUBLIC: '/courses/public',
    DETAIL: '/courses',
    SEARCH: '/courses/search',
    CATEGORY: '/courses/category',
    DIFFICULTY: '/courses/difficulty',
    CREATE: '/courses',
    UPDATE: '/courses',
    PUBLISH: '/courses/{id}/publish',
    UNPUBLISH: '/courses/{id}/unpublish',
    ENROLL: '/courses/{id}/enroll',
    UNENROLL: '/courses/{id}/unenroll',
    MATERIALS: '/courses/{id}/materials',
    GENERATE_SUMMARY: '/courses/{id}/generate-summary',
    GENERATE_QUIZ: '/courses/{id}/generate-quiz',
    REVIEW: '/courses/{id}/review',
    DELETE: '/courses/{id}'
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    COURSES: '/student/courses',
    PROGRESS: '/student/courses/{courseId}/progress',
    LESSON_PROGRESS: '/student/courses/{courseId}/lessons/{lessonId}/progress',
    VIDEO_PROGRESS: '/student/courses/{courseId}/lessons/{lessonId}/video-progress',
    SUBMIT_QUIZ: '/student/courses/{courseId}/quiz/submit',
    IQ_TEST: '/student/iq-test',
    SUBMIT_IQ_TEST: '/student/iq-test/submit',
    RECOMMENDATIONS: '/student/recommendations'
  },
  INSTRUCTOR: {
    DASHBOARD: '/instructor/dashboard',
    COURSES: '/instructor/courses',
    COURSE_STUDENTS: '/instructor/courses/{courseId}/students',
    COURSE_ANALYTICS: '/instructor/courses/{courseId}/analytics',
    STUDENTS: '/instructor/students',
    STATS: '/instructor/stats'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/{id}',
    USERS_BY_ROLE: '/admin/users/role/{role}',
    UPDATE_USER: '/admin/users/{id}',
    DELETE_USER: '/admin/users/{id}',
    COURSES: '/admin/courses',
    COURSE_DETAIL: '/admin/courses/{id}',
    DELETE_COURSE: '/admin/courses/{id}',
    PUBLISH_COURSE: '/admin/courses/{id}/publish',
    UNPUBLISH_COURSE: '/admin/courses/{id}/unpublish',
    ANALYTICS: '/admin/analytics',
    USER_ACTIVITY: '/admin/reports/user-activity',
    COURSE_PERFORMANCE: '/admin/reports/course-performance'
  }
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};

export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
    AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg']
  }
};

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  COURSE_TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100
  },
  COURSE_DESCRIPTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 1000
  }
};

export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  }
};

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

export const QUIZ_SETTINGS = {
  DEFAULT_TIME_LIMIT: 30, // minutes
  DEFAULT_PASSING_SCORE: 70, // percentage
  MAX_QUESTIONS: 50,
  MIN_QUESTIONS: 1
};

export const IQ_TEST_SETTINGS = {
  QUESTION_COUNT: 5,
  TIME_LIMIT: 30, // minutes
  SCORING: {
    MIN_IQ: 70,
    MAX_IQ: 160,
    AVERAGE_IQ: 100
  }
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MM/dd/yyyy HH:mm',
  ISO: 'yyyy-MM-dd'
};

export const COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

export const ENROLLMENT_STATUS = {
  ENROLLED: 'ENROLLED',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED'
};
