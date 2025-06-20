package com.learningplatform.service;

import com.learningplatform.model.User;
import com.learningplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Set creation time
        user.setCreatedAt(java.time.LocalDateTime.now());

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public List<User> findByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    public User updateUser(Long id, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = existingUser.get();
        
        // Update fields (excluding password and username)
        if (updatedUser.getFirstName() != null) {
            user.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            user.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getBio() != null) {
            user.setBio(updatedUser.getBio());
        }
        if (updatedUser.getExpertise() != null) {
            user.setExpertise(updatedUser.getExpertise());
        }

        return userRepository.save(user);
    }

    public void updatePassword(Long id, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void updateLastLogin(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    public void enrollInCourse(Long userId, String courseId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.getEnrolledCourses().contains(courseId)) {
                user.getEnrolledCourses().add(courseId);
                userRepository.save(user);
            }
        }
    }

    public void unenrollFromCourse(Long userId, String courseId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.getEnrolledCourses().remove(courseId);
            userRepository.save(user);
        }
    }

    public void updateEstimatedIQ(Long userId, Integer iqScore) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEstimatedIQ(iqScore);
            userRepository.save(user);
        }
    }

    @Transactional
    public void addCreatedCourse(Long instructorId, String courseId) {
        Optional<User> userOpt = userRepository.findById(instructorId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            try {
                if (!user.getCreatedCourses().contains(courseId)) {
                    user.getCreatedCourses().add(courseId);
                    userRepository.save(user);
                }
            } catch (Exception e) {
                // Handle lazy initialization gracefully
                System.out.println("Warning: Could not add course to user's created courses: " + e.getMessage());
            }
        }
    }

    @Transactional
    public void removeCreatedCourse(Long instructorId, String courseId) {
        Optional<User> userOpt = userRepository.findById(instructorId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            try {
                user.getCreatedCourses().remove(courseId);
                userRepository.save(user);
            } catch (Exception e) {
                // Handle lazy initialization gracefully
                System.out.println("Warning: Could not remove course from user's created courses: " + e.getMessage());
            }
        }
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getUsersByRole(User.Role role) {
        return userRepository.countByRole(role);
    }

    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
