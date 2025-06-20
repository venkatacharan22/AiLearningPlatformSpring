package com.learningplatform.service;

import com.learningplatform.model.User;
import com.learningplatform.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> login(String username, String password) {
        Optional<User> userOpt = userService.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOpt.get();
        
        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        if (!userService.validatePassword(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Update last login
        userService.updateLastLogin(user.getId());

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", sanitizeUser(user));
        response.put("role", user.getRole().name());

        return response;
    }

    public Map<String, Object> register(User user) {
        // Create user
        User createdUser = userService.createUser(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(createdUser.getUsername(), createdUser.getRole().name(), createdUser.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", sanitizeUser(createdUser));
        response.put("role", createdUser.getRole().name());

        return response;
    }

    public boolean validateToken(String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            Optional<User> user = userService.findByUsername(username);
            return user.isPresent() && jwtUtil.validateToken(token, username);
        } catch (Exception e) {
            return false;
        }
    }

    public Optional<User> getUserFromToken(String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            return userService.findByUsername(username);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private User sanitizeUser(User user) {
        // Create a copy without sensitive information
        User sanitized = new User();
        sanitized.setId(user.getId());
        sanitized.setUsername(user.getUsername());
        sanitized.setEmail(user.getEmail());
        sanitized.setFirstName(user.getFirstName());
        sanitized.setLastName(user.getLastName());
        sanitized.setRole(user.getRole());
        sanitized.setCreatedAt(user.getCreatedAt());
        sanitized.setLastLoginAt(user.getLastLoginAt());
        sanitized.setActive(user.isActive());
        sanitized.setEnrolledCourses(user.getEnrolledCourses());
        sanitized.setEstimatedIQ(user.getEstimatedIQ());
        sanitized.setCreatedCourses(user.getCreatedCourses());
        sanitized.setBio(user.getBio());
        sanitized.setExpertise(user.getExpertise());
        // Note: password is intentionally excluded for security
        return sanitized;
    }
}
