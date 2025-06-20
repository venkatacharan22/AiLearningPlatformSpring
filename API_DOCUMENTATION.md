# 🚀 AI Learning Platform API Documentation

## Base URL
```
http://localhost:8081/api
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
Login with username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "STUDENT|INSTRUCTOR|ADMIN",
    "firstName": "string",
    "lastName": "string"
  },
  "role": "string"
}
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "STUDENT|INSTRUCTOR",
  "bio": "string (optional, for instructors)",
  "expertise": "string (optional, for instructors)"
}
```

### POST /auth/validate
Validate a JWT token.

**Request Body:**
```json
{
  "token": "jwt-token-string"
}
```

**Response:**
```json
{
  "valid": true
}
```

---

## 📚 Course Endpoints

### GET /courses/public
Get all published courses (public access).

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "instructorId": "string",
    "instructorName": "string",
    "category": "string",
    "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
    "estimatedHours": 10,
    "totalEnrollments": 50,
    "averageRating": 4.5,
    "published": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

### GET /courses/{id}
Get course details by ID.

### GET /courses/search?query={query}
Search courses by title or description.

### GET /courses/category/{category}
Get courses by category.

### GET /courses/difficulty/{difficulty}
Get courses by difficulty level.

### POST /courses
Create a new course (Instructor/Admin only).

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "estimatedHours": 10,
  "videoUrl": "string (optional)",
  "outline": "string (optional)",
  "lessons": [
    {
      "title": "string",
      "content": "string",
      "durationMinutes": 30
    }
  ]
}
```

### PUT /courses/{id}
Update course (Instructor/Admin only).

### POST /courses/{id}/publish
Publish a course (Instructor/Admin only).

### POST /courses/{id}/unpublish
Unpublish a course (Instructor/Admin only).

### POST /courses/{id}/enroll
Enroll in a course (Student only).

### POST /courses/{id}/unenroll
Unenroll from a course (Student only).

### POST /courses/{id}/materials
Upload course materials (Instructor/Admin only).

**Request:** Multipart form data with file.

### POST /courses/{id}/generate-summary
Generate AI course summary (Instructor/Admin only).

### POST /courses/{id}/generate-quiz
Generate AI quiz for course (Instructor/Admin only).

**Request Body:**
```json
{
  "topic": "string",
  "content": "string",
  "numberOfQuestions": 5
}
```

### POST /courses/{id}/review
Add course review (Student only).

**Request Body:**
```json
{
  "rating": 5,
  "comment": "string"
}
```

### DELETE /courses/{id}
Delete course (Instructor/Admin only).

---

## 🎓 Student Endpoints

### GET /student/dashboard
Get student dashboard data.

**Response:**
```json
{
  "stats": {
    "totalCourses": 5,
    "completedCourses": 2,
    "inProgressCourses": 3,
    "totalTimeSpentMinutes": 1200,
    "averageCompletionPercentage": 65.5
  },
  "enrolledCourses": [],
  "completedCourses": [],
  "inProgressCourses": []
}
```

### GET /student/courses
Get enrolled courses.

### GET /student/courses/{courseId}/progress
Get progress for specific course.

### POST /student/courses/{courseId}/lessons/{lessonId}/progress
Update lesson progress.

**Request Body:**
```json
{
  "completed": true,
  "timeSpent": 30
}
```

### POST /student/courses/{courseId}/lessons/{lessonId}/video-progress
Update video watching progress.

**Request Body:**
```json
{
  "watchedPercentage": 85
}
```

### POST /student/courses/{courseId}/quiz/submit
Submit quiz answers.

**Request Body:**
```json
{
  "answers": {
    "questionId1": "0",
    "questionId2": "2"
  },
  "timeSpent": 25
}
```

### POST /student/iq-test
Generate IQ test.

### POST /student/iq-test/submit
Submit IQ test answers.

**Request Body:**
```json
{
  "answers": {
    "questionId1": "1",
    "questionId2": "3"
  }
}
```

### GET /student/recommendations
Get AI course recommendations.

---

## 👨‍🏫 Instructor Endpoints

### GET /instructor/dashboard
Get instructor dashboard data.

### GET /instructor/courses
Get instructor's courses.

### GET /instructor/courses/{courseId}/students
Get students enrolled in course.

### GET /instructor/courses/{courseId}/analytics
Get course analytics.

### GET /instructor/students
Get all students across instructor's courses.

### GET /instructor/stats
Get instructor statistics.

---

## 👑 Admin Endpoints

### GET /admin/dashboard
Get admin dashboard data.

### GET /admin/users
Get all users.

### GET /admin/users/{id}
Get user by ID.

### GET /admin/users/role/{role}
Get users by role.

### PUT /admin/users/{id}
Update user.

### DELETE /admin/users/{id}
Delete user.

### GET /admin/courses
Get all courses.

### GET /admin/courses/{id}
Get course by ID.

### DELETE /admin/courses/{id}
Delete course.

### POST /admin/courses/{id}/publish
Publish course.

### POST /admin/courses/{id}/unpublish
Unpublish course.

### GET /admin/analytics
Get system analytics.

### GET /admin/reports/user-activity
Get user activity report.

### GET /admin/reports/course-performance
Get course performance report.

---

## 🤖 AI Features

### Quiz Generation
The AI quiz generator uses Google's Gemini API to create multiple-choice questions based on course content.

**Features:**
- Generates 3-5 questions per request
- Includes explanations for correct answers
- Supports various topics and difficulty levels

### Course Summarization
AI-powered course summarization creates concise summaries of course content.

**Features:**
- Analyzes course outline and lessons
- Generates key takeaways
- Maintains focus on learning objectives

### IQ Assessment
Pattern recognition and logical reasoning test.

**Features:**
- 5 questions covering different cognitive areas
- Estimates IQ score for course recommendations
- Adaptive difficulty based on performance

### Smart Recommendations
Personalized course suggestions based on:
- Student performance history
- Estimated IQ level
- Completed courses
- Learning preferences

---

## 📊 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## 🔧 Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users
- AI features: 10 requests per minute

---

## 📝 Examples

### Complete Authentication Flow
```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"student123"}'

# 2. Use token for authenticated requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/student/dashboard
```

### Create and Enroll in Course
```bash
# 1. Create course (as instructor)
curl -X POST http://localhost:8080/api/courses \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to React",
    "description": "Learn React fundamentals",
    "category": "Web Development",
    "difficulty": "BEGINNER",
    "estimatedHours": 20
  }'

# 2. Enroll in course (as student)
curl -X POST http://localhost:8080/api/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### Generate AI Quiz
```bash
curl -X POST http://localhost:8080/api/courses/COURSE_ID/generate-quiz \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "React Hooks",
    "content": "React Hooks allow you to use state and lifecycle methods in functional components...",
    "numberOfQuestions": 5
  }'
```
