package com.learningplatform.controller;

import com.learningplatform.model.User;
import com.learningplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/setup")
@CrossOrigin(origins = "*")
public class SetupController {

    @Autowired
    private UserService userService;

    @PostMapping("/demo-users")
    public ResponseEntity<?> createDemoUsers() {
        try {
            int created = 0;

            // Create Admin User
            if (userService.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@learningplatform.com");
                admin.setPassword("admin123");
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setRole(User.Role.ADMIN);
                admin.setActive(true);
                userService.createUser(admin);
                created++;
            }

            // Create Instructor User
            if (userService.findByUsername("instructor").isEmpty()) {
                User instructor = new User();
                instructor.setUsername("instructor");
                instructor.setEmail("instructor@learningplatform.com");
                instructor.setPassword("instructor123");
                instructor.setFirstName("John");
                instructor.setLastName("Doe");
                instructor.setRole(User.Role.INSTRUCTOR);
                instructor.setBio("Experienced software developer and educator with 10+ years in the industry.");
                instructor.setExpertise("Java, Spring Boot, React, Machine Learning");
                instructor.setActive(true);
                userService.createUser(instructor);
                created++;
            }

            // Create Student User
            if (userService.findByUsername("student").isEmpty()) {
                User student = new User();
                student.setUsername("student");
                student.setEmail("student@learningplatform.com");
                student.setPassword("student123");
                student.setFirstName("Jane");
                student.setLastName("Smith");
                student.setRole(User.Role.STUDENT);
                student.setActive(true);
                student.setEstimatedIQ(110);
                userService.createUser(student);
                created++;
            }

            return ResponseEntity.ok(Map.of(
                "message", "Demo users created successfully",
                "created", created,
                "accounts", Map.of(
                    "admin", "admin/admin123",
                    "instructor", "instructor/instructor123",
                    "student", "student/student123"
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-passwords")
    public ResponseEntity<?> resetDemoPasswords() {
        try {
            int updated = 0;

            // Reset admin password
            Optional<User> adminOpt = userService.findByUsername("admin");
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                admin.setPassword(userService.encodePassword("admin123"));
                userService.save(admin);
                updated++;
            }

            // Reset instructor password
            Optional<User> instructorOpt = userService.findByUsername("instructor");
            if (instructorOpt.isPresent()) {
                User instructor = instructorOpt.get();
                instructor.setPassword(userService.encodePassword("instructor123"));
                userService.save(instructor);
                updated++;
            }

            // Reset student password
            Optional<User> studentOpt = userService.findByUsername("student");
            if (studentOpt.isPresent()) {
                User student = studentOpt.get();
                student.setPassword(userService.encodePassword("student123"));
                userService.save(student);
                updated++;
            }

            return ResponseEntity.ok(Map.of(
                "message", "Demo user passwords reset successfully",
                "updated", updated,
                "accounts", Map.of(
                    "admin", "admin/admin123",
                    "instructor", "instructor/instructor123",
                    "student", "student/student123"
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }



    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        try {
            boolean adminExists = userService.findByUsername("admin").isPresent();
            boolean instructorExists = userService.findByUsername("instructor").isPresent();
            boolean studentExists = userService.findByUsername("student").isPresent();

            return ResponseEntity.ok(Map.of(
                "status", "Backend is running",
                "demoUsers", Map.of(
                    "admin", adminExists,
                    "instructor", instructorExists,
                    "student", studentExists
                ),
                "totalUsers", userService.getTotalUsers()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.findAll();
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRole().name());
                userMap.put("active", user.isActive());
                userMap.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
                userMap.put("lastName", user.getLastName() != null ? user.getLastName() : "");
                return userMap;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "users", userList,
                "total", users.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}
