package com.learningplatform.controller;

import com.learningplatform.model.User;
import com.learningplatform.service.UserService;
import com.learningplatform.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }

            Optional<User> userOpt = userService.findById(Long.parseLong(userId));
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            
            // Get enrolled courses count
            int enrolledCoursesCount = user.getEnrolledCourses().size();
            
            // Get created courses count (for instructors)
            int createdCoursesCount = user.getCreatedCourses().size();

            return ResponseEntity.ok(Map.of(
                "user", user,
                "stats", Map.of(
                    "enrolledCourses", enrolledCoursesCount,
                    "createdCourses", createdCoursesCount,
                    "estimatedIQ", user.getEstimatedIQ() != null ? user.getEstimatedIQ() : 0
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request, HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }

            Optional<User> userOpt = userService.findById(Long.parseLong(userId));
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            
            // Update fields
            if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
                user.setFirstName(request.getFirstName().trim());
            }
            if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
                user.setLastName(request.getLastName().trim());
            }
            if (request.getBio() != null) {
                user.setBio(request.getBio().trim());
            }
            if (request.getExpertise() != null) {
                user.setExpertise(request.getExpertise().trim());
            }

            userService.save(user);

            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request, HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }

            Optional<User> userOpt = userService.findById(Long.parseLong(userId));
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            
            // Verify current password
            if (!userService.checkPassword(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }

            // Validate new password
            if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters"));
            }

            // Update password
            user.setPassword(userService.encodePassword(request.getNewPassword()));
            userService.save(user);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    public static class ProfileUpdateRequest {
        private String firstName;
        private String lastName;
        private String bio;
        private String expertise;

        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getExpertise() { return expertise; }
        public void setExpertise(String expertise) { this.expertise = expertise; }
    }

    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
