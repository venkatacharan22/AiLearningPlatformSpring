package com.learningplatform.controller;

import com.learningplatform.model.Course;
import com.learningplatform.model.Progress;
import com.learningplatform.service.CourseService;
// import com.learningplatform.service.ProgressService;
import com.learningplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/instructor")
@PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class InstructorController {

    @Autowired
    private CourseService courseService;

    // @Autowired
    // private ProgressService progressService;

    @Autowired
    private UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            
            List<Course> myCourses = courseService.findByInstructor(instructorId);
            long totalCourses = myCourses.size();
            long publishedCourses = myCourses.stream().filter(Course::isPublished).count();
            
            int totalEnrollments = myCourses.stream()
                    .mapToInt(Course::getTotalEnrollments)
                    .sum();
            
            double averageRating = myCourses.stream()
                    .filter(course -> course.getAverageRating() > 0)
                    .mapToDouble(Course::getAverageRating)
                    .average()
                    .orElse(0.0);

            return ResponseEntity.ok(Map.of(
                "totalCourses", totalCourses,
                "publishedCourses", publishedCourses,
                "totalEnrollments", totalEnrollments,
                "averageRating", averageRating,
                "courses", myCourses
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getMyCourses(HttpServletRequest request) {
        String instructorId = (String) request.getAttribute("userId");
        List<Course> courses = courseService.findByInstructor(instructorId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<?> getCourseStudents(@PathVariable String courseId, HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");

            // Verify instructor owns the course
            Course course = courseService.findById(courseId).orElse(null);
            if (course == null) {
                return ResponseEntity.notFound().build();
            }

            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized"));
            }

            // Progress functionality temporarily disabled
            return ResponseEntity.ok(Map.of(
                "course", course,
                "students", java.util.Collections.emptyList(),
                "totalStudents", 0,
                "message", "Progress tracking temporarily disabled"
            ));

            /*
            List<Progress> studentProgress = progressService.getCourseProgress(courseId);
            */
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/courses/{courseId}/analytics")
    public ResponseEntity<?> getCourseAnalytics(@PathVariable String courseId, HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");

            // Verify instructor owns the course
            Course course = courseService.findById(courseId).orElse(null);
            if (course == null) {
                return ResponseEntity.notFound().build();
            }

            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized"));
            }

            // Progress analytics temporarily disabled
            return ResponseEntity.ok(Map.of(
                "totalEnrollments", course.getTotalEnrollments(),
                "completedStudents", 0,
                "completionRate", 0,
                "averageCompletionPercentage", 0,
                "averageTimeSpentMinutes", 0,
                "averageQuizScore", 0,
                "courseRating", course.getAverageRating(),
                "totalReviews", course.getReviews().size(),
                "message", "Progress analytics temporarily disabled"
            ));

            /*
            List<Progress> progressList = progressService.getCourseProgress(courseId);
            */
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllMyStudents(HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");

            List<Course> myCourses = courseService.findByInstructor(instructorId);

            // Get all unique students across all courses
            List<String> allStudentIds = myCourses.stream()
                    .flatMap(course -> course.getEnrolledStudents().stream())
                    .distinct()
                    .toList();

            List<Map<String, Object>> students = allStudentIds.stream()
                    .map(studentId -> {
                        var student = userService.findById(Long.parseLong(studentId)).orElse(null);
                        if (student != null) {
                            Map<String, Object> studentMap = new HashMap<>();
                            studentMap.put("studentId", student.getId());
                            studentMap.put("studentName", student.getFullName());
                            studentMap.put("email", student.getEmail());
                            studentMap.put("enrolledCourses", 0); // Temporarily disabled
                            studentMap.put("estimatedIQ", student.getEstimatedIQ());
                            return studentMap;
                        }
                        return null;
                    })
                    .filter(student -> student != null)
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "students", students,
                "totalStudents", students.size(),
                "message", "Progress tracking temporarily disabled"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getInstructorStats(HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            
            long totalCourses = courseService.getCoursesByInstructor(instructorId);
            long publishedCourses = courseService.findByInstructor(instructorId).stream()
                    .filter(Course::isPublished)
                    .count();
            
            List<Course> myCourses = courseService.findByInstructor(instructorId);
            int totalEnrollments = myCourses.stream()
                    .mapToInt(Course::getTotalEnrollments)
                    .sum();
            
            double averageRating = myCourses.stream()
                    .filter(course -> course.getAverageRating() > 0)
                    .mapToDouble(Course::getAverageRating)
                    .average()
                    .orElse(0.0);

            return ResponseEntity.ok(Map.of(
                "totalCourses", totalCourses,
                "publishedCourses", publishedCourses,
                "totalEnrollments", totalEnrollments,
                "averageRating", averageRating
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
