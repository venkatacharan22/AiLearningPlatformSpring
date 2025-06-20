package com.learningplatform.controller;

import com.learningplatform.model.Course;
import com.learningplatform.model.User;
import com.learningplatform.service.CourseService;
// import com.learningplatform.service.ProgressService;
import com.learningplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    // @Autowired
    // private ProgressService progressService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            long totalUsers = userService.getTotalUsers();
            long totalStudents = userService.getUsersByRole(User.Role.STUDENT);
            long totalInstructors = userService.getUsersByRole(User.Role.INSTRUCTOR);
            long totalCourses = courseService.getTotalCourses();
            long publishedCourses = courseService.getPublishedCoursesCount();

            List<Course> recentCourses = courseService.findAll().stream()
                    .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                    .limit(5)
                    .toList();

            List<User> recentUsers = userService.findAll().stream()
                    .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                    .limit(5)
                    .toList();

            return ResponseEntity.ok(Map.of(
                "stats", Map.of(
                    "totalUsers", totalUsers,
                    "totalStudents", totalStudents,
                    "totalInstructors", totalInstructors,
                    "totalCourses", totalCourses,
                    "publishedCourses", publishedCourses
                ),
                "recentCourses", recentCourses,
                "recentUsers", recentUsers
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            List<User> users = userService.findByRole(userRole);
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.findAll();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<?> getCourse(@PathVariable String id) {
        return courseService.findById(id)
                .map(course -> ResponseEntity.ok(course))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable String id) {
        try {
            Course course = courseService.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Admin can delete any course
            courseService.deleteCourse(id, course.getInstructorId());
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/courses/{id}/publish")
    public ResponseEntity<?> publishCourse(@PathVariable String id) {
        try {
            Course course = courseService.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.notFound().build();
            }
            
            courseService.publishCourse(id, course.getInstructorId());
            return ResponseEntity.ok(Map.of("message", "Course published successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/courses/{id}/unpublish")
    public ResponseEntity<?> unpublishCourse(@PathVariable String id) {
        try {
            Course course = courseService.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.notFound().build();
            }
            
            courseService.unpublishCourse(id, course.getInstructorId());
            return ResponseEntity.ok(Map.of("message", "Course unpublished successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getSystemAnalytics() {
        try {
            // User analytics
            long totalUsers = userService.getTotalUsers();
            long totalStudents = userService.getUsersByRole(User.Role.STUDENT);
            long totalInstructors = userService.getUsersByRole(User.Role.INSTRUCTOR);
            long totalAdmins = userService.getUsersByRole(User.Role.ADMIN);

            // Course analytics
            long totalCourses = courseService.getTotalCourses();
            long publishedCourses = courseService.getPublishedCoursesCount();
            
            List<Course> allCourses = courseService.findAll();
            int totalEnrollments = allCourses.stream()
                    .mapToInt(Course::getTotalEnrollments)
                    .sum();
            
            double averageRating = allCourses.stream()
                    .filter(course -> course.getAverageRating() > 0)
                    .mapToDouble(Course::getAverageRating)
                    .average()
                    .orElse(0.0);

            // Category distribution
            Map<String, Long> categoryDistribution = allCourses.stream()
                    .filter(course -> course.getCategory() != null)
                    .collect(java.util.stream.Collectors.groupingBy(
                        Course::getCategory,
                        java.util.stream.Collectors.counting()
                    ));

            // Difficulty distribution
            Map<String, Long> difficultyDistribution = allCourses.stream()
                    .filter(course -> course.getDifficulty() != null)
                    .collect(java.util.stream.Collectors.groupingBy(
                        Course::getDifficulty,
                        java.util.stream.Collectors.counting()
                    ));

            return ResponseEntity.ok(Map.of(
                "userStats", Map.of(
                    "totalUsers", totalUsers,
                    "totalStudents", totalStudents,
                    "totalInstructors", totalInstructors,
                    "totalAdmins", totalAdmins
                ),
                "courseStats", Map.of(
                    "totalCourses", totalCourses,
                    "publishedCourses", publishedCourses,
                    "totalEnrollments", totalEnrollments,
                    "averageRating", averageRating
                ),
                "categoryDistribution", categoryDistribution,
                "difficultyDistribution", difficultyDistribution
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports/user-activity")
    public ResponseEntity<?> getUserActivityReport() {
        try {
            List<User> allUsers = userService.findAll();
            
            List<Map<String, Object>> userActivity = allUsers.stream()
                    .map(user -> {
                        int enrolledCourses = user.getEnrolledCourses().size();
                        int createdCourses = user.getCreatedCourses().size();

                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("userId", user.getId());
                        userMap.put("username", user.getUsername());
                        userMap.put("fullName", user.getFullName());
                        userMap.put("role", user.getRole());
                        userMap.put("enrolledCourses", enrolledCourses);
                        userMap.put("createdCourses", createdCourses);
                        userMap.put("lastLoginAt", user.getLastLoginAt());
                        userMap.put("active", user.isActive());
                        return userMap;
                    })
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(Map.of("userActivity", userActivity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports/course-performance")
    public ResponseEntity<?> getCoursePerformanceReport() {
        try {
            List<Course> allCourses = courseService.findAll();
            
            List<Map<String, Object>> coursePerformance = allCourses.stream()
                    .map(course -> {
                        Map<String, Object> courseMap = new HashMap<>();
                        courseMap.put("courseId", course.getId());
                        courseMap.put("title", course.getTitle());
                        courseMap.put("instructor", course.getInstructorName());
                        courseMap.put("category", course.getCategory() != null ? course.getCategory() : "Uncategorized");
                        courseMap.put("difficulty", course.getDifficulty() != null ? course.getDifficulty() : "Not Set");
                        courseMap.put("published", course.isPublished());
                        courseMap.put("totalEnrollments", course.getTotalEnrollments());
                        courseMap.put("averageRating", course.getAverageRating());
                        courseMap.put("totalReviews", course.getReviews().size());
                        courseMap.put("createdAt", course.getCreatedAt());
                        return courseMap;
                    })
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(Map.of("coursePerformance", coursePerformance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
