package com.learningplatform.controller;

import com.learningplatform.model.Course;
import com.learningplatform.model.Progress;
import com.learningplatform.model.Quiz;
import com.learningplatform.model.AssignmentSubmission;
import com.learningplatform.service.CourseService;
import com.learningplatform.service.GeminiService;
import com.learningplatform.service.ProgressService;
import com.learningplatform.service.QuizService;
import com.learningplatform.service.UserService;
import com.learningplatform.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/student")
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private UserService userService;

    @Autowired
    private SubmissionService submissionService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");

            // Get student progress
            List<Progress> studentProgress = progressService.getStudentProgress(studentId);
            List<Progress> completedCourses = progressService.getCompletedCourses(studentId);

            // Get recent submissions
            List<AssignmentSubmission> recentSubmissions = submissionService.getStudentSubmissions(studentId);

            // Calculate stats
            int totalCourses = studentProgress.size();
            int completedCoursesCount = completedCourses.size();
            int totalTimeSpent = studentProgress.stream()
                .mapToInt(Progress::getTotalTimeSpentMinutes)
                .sum();

            Double averageScore = submissionService.getAverageScore(studentId);
            if (averageScore == null) averageScore = 0.0;

            return ResponseEntity.ok(Map.of(
                "enrolledCourses", studentProgress,
                "completedCourses", completedCourses,
                "recentSubmissions", recentSubmissions.stream().limit(5).toList(),
                "stats", Map.of(
                    "totalCourses", totalCourses,
                    "completedCourses", completedCoursesCount,
                    "totalTimeSpent", totalTimeSpent,
                    "averageScore", averageScore.intValue()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getEnrolledCourses(HttpServletRequest request) {
        String studentId = (String) request.getAttribute("userId");

        // Get enrolled courses from progress
        List<Progress> studentProgress = progressService.getStudentProgress(studentId);
        List<Course> enrolledCourses = new java.util.ArrayList<>();

        for (Progress progress : studentProgress) {
            Optional<Course> courseOpt = courseService.findById(progress.getCourseId());
            courseOpt.ifPresent(enrolledCourses::add);
        }

        return ResponseEntity.ok(enrolledCourses);
    }

    @PostMapping("/courses/{courseId}/enroll")
    public ResponseEntity<?> enrollInCourse(@PathVariable String courseId, HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");

            // Check if course exists and is published
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            if (!course.isPublished()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course is not published"));
            }

            // Check if already enrolled
            if (progressService.isStudentEnrolled(studentId, courseId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Already enrolled in this course"));
            }

            // Enroll student
            progressService.enrollStudent(studentId, courseId);
            courseService.enrollStudent(courseId, studentId);

            return ResponseEntity.ok(Map.of(
                "message", "Successfully enrolled in course",
                "courseId", courseId,
                "courseTitle", course.getTitle()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/courses/{courseId}/progress")
    public ResponseEntity<?> getCourseProgress(@PathVariable String courseId, HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");

            Optional<Progress> progressOpt = progressService.getProgress(studentId, courseId);
            if (progressOpt.isEmpty()) {
                // Create new progress if student is not enrolled
                Progress progress = progressService.getOrCreateProgress(studentId, courseId);
                return ResponseEntity.ok(progress);
            }

            return ResponseEntity.ok(progressOpt.get());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/progress")
    public ResponseEntity<?> updateLessonProgress(@PathVariable String courseId,
                                                @PathVariable String lessonId,
                                                @RequestBody LessonProgressRequest request,
                                                HttpServletRequest httpRequest) {
        try {
            String studentId = (String) httpRequest.getAttribute("userId");

            Progress progress = progressService.updateLessonProgress(
                studentId, courseId, lessonId, request.isCompleted(), request.getTimeSpent()
            );

            return ResponseEntity.ok(Map.of(
                "progress", progress,
                "message", "Lesson progress updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/video-progress")
    public ResponseEntity<?> updateVideoProgress(@PathVariable String courseId,
                                               @PathVariable String lessonId,
                                               @RequestBody VideoProgressRequest request,
                                               HttpServletRequest httpRequest) {
        try {
            String studentId = (String) httpRequest.getAttribute("userId");

            Progress progress = progressService.updateVideoProgress(
                studentId, courseId, lessonId, request.getWatchedPercentage()
            );

            return ResponseEntity.ok(Map.of(
                "progress", progress,
                "message", "Video progress updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/courses/{courseId}/quiz/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable String courseId,
                                      @RequestBody QuizSubmissionRequest request,
                                      HttpServletRequest httpRequest) {
        try {
            String studentId = (String) httpRequest.getAttribute("userId");
            
            // Calculate score
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Course course = courseOpt.get();

            // Generate quiz for the course if not exists
            Map<String, Object> quiz = quizService.generateQuizForCourse(course);

            // Calculate score based on submitted answers
            List<Map<String, Object>> questions = (List<Map<String, Object>>) quiz.get("questions");
            int correctAnswers = 0;
            int totalQuestions = questions.size();

            for (int i = 0; i < questions.size(); i++) {
                Map<String, Object> question = questions.get(i);
                Integer correctAnswer = (Integer) question.get("correctAnswer");
                String submittedAnswerStr = request.getAnswers().get(String.valueOf(i));

                if (correctAnswer != null && submittedAnswerStr != null) {
                    try {
                        Integer submittedAnswer = Integer.parseInt(submittedAnswerStr);
                        if (correctAnswer.equals(submittedAnswer)) {
                            correctAnswers++;
                        }
                    } catch (NumberFormatException e) {
                        // Invalid answer format, skip
                    }
                }
            }

            int score = totalQuestions > 0 ? (correctAnswers * 100) / totalQuestions : 0;
            boolean passed = score >= 70; // 70% passing score

            return ResponseEntity.ok(Map.of(
                "score", score,
                "correctAnswers", correctAnswers,
                "totalQuestions", totalQuestions,
                "passed", passed,
                "message", passed ? "Congratulations! You passed the quiz!" : "Keep studying and try again!"
            ));

            /*
            Quiz quiz = course.getQuiz();
            if (quiz == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No quiz found for this course"));
            }

            int correctAnswers = 0;
            for (Quiz.Question question : quiz.getQuestions()) {
                String studentAnswer = request.getAnswers().get(question.getId());
                if (studentAnswer != null) {
                    int answerIndex = Integer.parseInt(studentAnswer);
                    if (answerIndex == question.getCorrectAnswerIndex()) {
                        correctAnswers++;
                    }
                }
            }

            int score = (correctAnswers * 100) / quiz.getQuestions().size();
            boolean passed = score >= quiz.getPassingScore();

            Progress progress = progressService.recordQuizAttempt(
                studentId, courseId, quiz.getId(), request.getAnswers(),
                score, quiz.getQuestions().size(), passed, request.getTimeSpent()
            );

            return ResponseEntity.ok(Map.of(
                "score", score,
                "passed", passed,
                "correctAnswers", correctAnswers,
                "totalQuestions", quiz.getQuestions().size(),
                "progress", progress
            ));
            */
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/iq-test")
    public ResponseEntity<?> takeIQTest(HttpServletRequest request) {
        try {
            Quiz iqTest = geminiService.generateIQTest();
            return ResponseEntity.ok(iqTest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/iq-test/submit")
    public ResponseEntity<?> submitIQTest(@RequestBody QuizSubmissionRequest request,
                                        HttpServletRequest httpRequest) {
        try {
            String studentId = (String) httpRequest.getAttribute("userId");
            
            // For IQ test, we'll use a simple scoring mechanism
            // In a real implementation, this would be more sophisticated
            int totalQuestions = request.getAnswers().size();
            int estimatedIQ = 85 + (totalQuestions * 5); // Simple estimation
            
            // Update user's estimated IQ
            userService.updateEstimatedIQ(Long.parseLong(studentId), estimatedIQ);

            return ResponseEntity.ok(Map.of(
                "estimatedIQ", estimatedIQ,
                "message", "IQ assessment completed successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getCourseRecommendations(HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");

            // Get student info
            Optional<com.learningplatform.model.User> userOpt = userService.findById(Long.parseLong(studentId));
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            com.learningplatform.model.User user = userOpt.get();

            // Progress tracking temporarily disabled - using basic recommendations
            String interests = user.getExpertise() != null ? user.getExpertise() : "General Learning";
            List<String> recommendations = geminiService.generateCourseRecommendations(
                interests, user.getEstimatedIQ(), java.util.Collections.emptyList()
            );

            return ResponseEntity.ok(Map.of(
                "recommendations", recommendations,
                "message", "Recommendations based on basic profile (progress tracking disabled)"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getStudentAssignments(HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");

            // Get student's enrolled courses
            List<Progress> studentProgress = progressService.getStudentProgress(studentId);
            List<Map<String, Object>> assignments = new java.util.ArrayList<>();

            for (Progress progress : studentProgress) {
                Optional<Course> courseOpt = courseService.findById(progress.getCourseId());
                if (courseOpt.isPresent()) {
                    Course course = courseOpt.get();
                    // Get assignments for this course (this would need to be implemented in AssignmentService)
                    // For now, return basic structure
                    assignments.add(Map.of(
                        "courseId", course.getId(),
                        "courseTitle", course.getTitle(),
                        "assignments", java.util.Collections.emptyList()
                    ));
                }
            }

            return ResponseEntity.ok(Map.of(
                "assignments", assignments,
                "message", "Student assignments retrieved successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/submissions")
    public ResponseEntity<?> getStudentSubmissions(HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");

            List<AssignmentSubmission> submissions = submissionService.getStudentSubmissions(studentId);

            return ResponseEntity.ok(Map.of(
                "submissions", submissions,
                "totalSubmissions", submissions.size(),
                "passedSubmissions", submissions.stream().mapToLong(s -> s.isPassed() ? 1 : 0).sum()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<?> getAssignmentSubmissions(@PathVariable Long assignmentId, HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");

            List<AssignmentSubmission> submissions = submissionService.getStudentAssignmentSubmissions(studentId, assignmentId);
            int attemptCount = submissionService.getAttemptCount(studentId, assignmentId);

            return ResponseEntity.ok(Map.of(
                "submissions", submissions,
                "attemptCount", attemptCount,
                "hasPassedAssignment", submissionService.hasPassedAssignment(studentId, assignmentId)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/submit-review")
    public ResponseEntity<?> submitLessonForReview(@PathVariable String courseId,
                                                 @PathVariable String lessonId,
                                                 @RequestBody LessonReviewRequest request,
                                                 HttpServletRequest httpRequest) {
        try {
            String studentId = (String) httpRequest.getAttribute("userId");

            // Update lesson progress as completed
            Progress progress = progressService.updateLessonProgress(
                studentId, courseId, lessonId, true, request.getTimeSpent()
            );

            // Log lesson review submission (in a real app, you'd save this to database)
            System.out.println("Lesson review submitted:");
            System.out.println("Student ID: " + studentId);
            System.out.println("Course ID: " + courseId);
            System.out.println("Lesson ID: " + lessonId);
            System.out.println("Time Spent: " + request.getTimeSpent() + " minutes");
            System.out.println("Video Progress: " + request.getVideoProgress() + "%");
            System.out.println("Notes: " + request.getNotes());

            return ResponseEntity.ok(Map.of(
                "progress", progress,
                "message", "Lesson submitted for review successfully",
                "reviewId", "review-" + System.currentTimeMillis(),
                "status", "PENDING"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request DTOs
    public static class LessonProgressRequest {
        private boolean completed;
        private int timeSpent;

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }

        public int getTimeSpent() { return timeSpent; }
        public void setTimeSpent(int timeSpent) { this.timeSpent = timeSpent; }
    }

    public static class VideoProgressRequest {
        private int watchedPercentage;

        public int getWatchedPercentage() { return watchedPercentage; }
        public void setWatchedPercentage(int watchedPercentage) { this.watchedPercentage = watchedPercentage; }
    }

    public static class QuizSubmissionRequest {
        private Map<String, String> answers;
        private int timeSpent;

        public Map<String, String> getAnswers() { return answers; }
        public void setAnswers(Map<String, String> answers) { this.answers = answers; }

        public int getTimeSpent() { return timeSpent; }
        public void setTimeSpent(int timeSpent) { this.timeSpent = timeSpent; }
    }

    public static class LessonReviewRequest {
        private int timeSpent;
        private int videoProgress;
        private String notes;
        private String completedAt;

        public int getTimeSpent() { return timeSpent; }
        public void setTimeSpent(int timeSpent) { this.timeSpent = timeSpent; }
        public int getVideoProgress() { return videoProgress; }
        public void setVideoProgress(int videoProgress) { this.videoProgress = videoProgress; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    }
}
