package com.learningplatform.controller;

import com.learningplatform.model.Course;
import com.learningplatform.service.CourseService;
import com.learningplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/course-details")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseDetailController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCourseDetails(@PathVariable String courseId) {
        try {
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<?> enrollInCourse(@PathVariable String courseId, HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }

            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            
            // Check if already enrolled
            if (course.getEnrolledStudents().contains(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Already enrolled in this course"));
            }

            // Add student to course
            course.getEnrolledStudents().add(userId);
            course.setTotalEnrollments(course.getTotalEnrollments() + 1);
            courseService.save(course);

            // Add course to user's enrolled courses
            var user = userService.findById(Long.parseLong(userId));
            if (user.isPresent()) {
                user.get().getEnrolledCourses().add(courseId);
                userService.save(user.get());
            }

            return ResponseEntity.ok(Map.of(
                "message", "Successfully enrolled in course",
                "courseId", courseId,
                "courseName", course.getTitle()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{courseId}/review")
    public ResponseEntity<?> addReview(@PathVariable String courseId, 
                                     @RequestBody ReviewRequest reviewRequest,
                                     HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }

            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            
            // Check if user is enrolled
            if (!course.getEnrolledStudents().contains(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Must be enrolled to review"));
            }

            // Get user details
            var user = userService.findById(Long.parseLong(userId));
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Create review
            Course.Review review = new Course.Review();
            review.setStudentId(userId);
            review.setStudentName(user.get().getFullName());
            review.setRating(reviewRequest.getRating());
            review.setComment(reviewRequest.getComment());
            review.setCreatedAt(LocalDateTime.now());

            // Add review to course
            course.getReviews().add(review);
            
            // Recalculate average rating
            double avgRating = course.getReviews().stream()
                    .mapToInt(Course.Review::getRating)
                    .average()
                    .orElse(0.0);
            course.setAverageRating(avgRating);

            courseService.save(course);

            return ResponseEntity.ok(Map.of(
                "message", "Review added successfully",
                "review", review,
                "newAverageRating", avgRating
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{courseId}/enrollment-status")
    public ResponseEntity<?> getEnrollmentStatus(@PathVariable String courseId, HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.ok(Map.of("enrolled", false));
            }

            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            boolean enrolled = course.getEnrolledStudents().contains(userId);

            return ResponseEntity.ok(Map.of(
                "enrolled", enrolled,
                "totalEnrollments", course.getTotalEnrollments()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
