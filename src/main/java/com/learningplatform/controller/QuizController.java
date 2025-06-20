package com.learningplatform.controller;

import com.learningplatform.model.Course;
import com.learningplatform.model.Quiz;
import com.learningplatform.service.CourseService;
import com.learningplatform.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/generate/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<?> generateQuizForCourse(@PathVariable String courseId, HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            // Verify course exists
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();

            // For instructors, verify they own the course
            if ("INSTRUCTOR".equals(userRole) && !course.getInstructorId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            try {
                // Generate quiz content based on course
                String topic = course.getTitle();
                String content = course.getDescription();
                if (course.getOutline() != null && !course.getOutline().isEmpty()) {
                    content += "\n\nCourse Outline:\n" + course.getOutline();
                }
                if (course.getSummary() != null && !course.getSummary().isEmpty()) {
                    content += "\n\nCourse Summary:\n" + course.getSummary();
                }

                // Add lesson content if available
                if (course.getLessons() != null && !course.getLessons().isEmpty()) {
                    StringBuilder lessonContent = new StringBuilder(content);
                    lessonContent.append("\n\nLessons:\n");
                    course.getLessons().forEach(lesson -> {
                        lessonContent.append("- ").append(lesson.getTitle()).append(": ").append(lesson.getContent()).append("\n");
                    });
                    content = lessonContent.toString();
                }

                Quiz quiz = geminiService.generateQuiz(topic, content, 5);
                quiz.setCourseId(courseId);

                return ResponseEntity.ok(Map.of(
                    "message", "Quiz generated successfully",
                    "quiz", quiz
                ));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate quiz: " + e.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/generate/custom")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> generateCustomQuiz(@RequestBody CustomQuizRequest request, HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            
            try {
                Quiz quiz = geminiService.generateQuiz(
                    request.getTopic(), 
                    request.getContent(), 
                    request.getNumberOfQuestions()
                );
                
                if (request.getCourseId() != null) {
                    // Verify instructor owns the course if courseId is provided
                    Optional<Course> courseOpt = courseService.findById(request.getCourseId());
                    if (courseOpt.isPresent()) {
                        Course course = courseOpt.get();
                        if (!course.getInstructorId().equals(instructorId)) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
                        }
                        quiz.setCourseId(request.getCourseId());
                    }
                }

                return ResponseEntity.ok(Map.of(
                    "message", "Custom quiz generated successfully",
                    "quiz", quiz
                ));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate quiz: " + e.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request DTO
    public static class CustomQuizRequest {
        private String topic;
        private String content;
        private int numberOfQuestions = 5;
        private String courseId;

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public int getNumberOfQuestions() { return numberOfQuestions; }
        public void setNumberOfQuestions(int numberOfQuestions) { this.numberOfQuestions = numberOfQuestions; }

        public String getCourseId() { return courseId; }
        public void setCourseId(String courseId) { this.courseId = courseId; }
    }
}
