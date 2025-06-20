package com.learningplatform.controller;

import com.learningplatform.model.Course;
import com.learningplatform.model.Quiz;
import com.learningplatform.service.CourseService;
import com.learningplatform.service.GeminiService;
import com.learningplatform.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private QuizService quizService;

    @GetMapping("/public")
    public ResponseEntity<List<Course>> getPublishedCourses() {
        List<Course> courses = courseService.findPublishedCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourse(@PathVariable String id) {
        Optional<Course> course = courseService.findById(id);
        if (course.isPresent()) {
            return ResponseEntity.ok(course.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/quiz")
    public ResponseEntity<?> getCourseQuiz(@PathVariable String id) {
        try {
            Optional<Course> courseOpt = courseService.findById(id);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            Map<String, Object> quiz = quizService.generateQuizForCourse(course);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate quiz: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam String query) {
        List<Course> courses = courseService.searchCourses(query);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Course>> getCoursesByCategory(@PathVariable String category) {
        List<Course> courses = courseService.findByCategory(category);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Course>> getCoursesByDifficulty(@PathVariable String difficulty) {
        List<Course> courses = courseService.findByDifficulty(difficulty);
        return ResponseEntity.ok(courses);
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody Course course, HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            Course createdCourse = courseService.createCourse(course, instructorId);
            return ResponseEntity.ok(createdCourse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable String id, @RequestBody Course course, HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            Course updatedCourse = courseService.updateCourse(id, course, instructorId);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> publishCourse(@PathVariable String id, HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            courseService.publishCourse(id, instructorId);
            return ResponseEntity.ok(Map.of("message", "Course published successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> unpublishCourse(@PathVariable String id, HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            courseService.unpublishCourse(id, instructorId);
            return ResponseEntity.ok(Map.of("message", "Course unpublished successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> enrollInCourse(@PathVariable String id, HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");
            courseService.enrollStudent(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Enrolled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/unenroll")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> unenrollFromCourse(@PathVariable String id, HttpServletRequest request) {
        try {
            String studentId = (String) request.getAttribute("userId");
            courseService.unenrollStudent(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Unenrolled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/materials")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadMaterial(@PathVariable String id, 
                                          @RequestParam("file") MultipartFile file,
                                          HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            String filePath = courseService.uploadMaterial(id, file, instructorId);
            return ResponseEntity.ok(Map.of("filePath", filePath));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/generate-summary")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> generateSummary(@PathVariable String id, HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            courseService.generateCourseSummary(id, instructorId);
            return ResponseEntity.ok(Map.of("message", "Summary generated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/generate-quiz")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> generateQuiz(@PathVariable String id, 
                                        @RequestBody QuizGenerationRequest request,
                                        HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            
            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(id);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized"));
            }

            try {
                Quiz quiz = geminiService.generateQuiz(request.getTopic(), request.getContent(), request.getNumberOfQuestions());
                quiz.setCourseId(id);

                // For now, just return the quiz without saving to course (since Quiz is commented out in Course model)
                return ResponseEntity.ok(quiz);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate quiz: " + e.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> addReview(@PathVariable String id, 
                                     @RequestBody ReviewRequest request,
                                     HttpServletRequest httpRequest) {
        try {
            String studentId = (String) httpRequest.getAttribute("userId");
            courseService.addReview(id, studentId, request.getRating(), request.getComment());
            return ResponseEntity.ok(Map.of("message", "Review added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable String id, HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            courseService.deleteCourse(id, instructorId);
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request DTOs
    public static class QuizGenerationRequest {
        private String topic;
        private String content;
        private int numberOfQuestions = 5;

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public int getNumberOfQuestions() { return numberOfQuestions; }
        public void setNumberOfQuestions(int numberOfQuestions) { this.numberOfQuestions = numberOfQuestions; }
    }

    public static class ReviewRequest {
        private int rating;
        private String comment;

        public int getRating() { return rating; }
        public void setRating(int rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }
}
