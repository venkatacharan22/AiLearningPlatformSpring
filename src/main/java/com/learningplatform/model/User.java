package com.learningplatform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt;

    @Column(nullable = false)
    private boolean active;

    // Student-specific fields
    @ElementCollection
    @CollectionTable(name = "user_enrolled_courses", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "course_id")
    private List<String> enrolledCourses;

    private Integer estimatedIQ;

    // Instructor-specific fields
    @ElementCollection
    @CollectionTable(name = "user_created_courses", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "course_id")
    private List<String> createdCourses;

    @Column(length = 1000)
    private String bio;

    @Column(length = 500)
    private String expertise;

    public User() {
        this.enrolledCourses = new ArrayList<>();
        this.createdCourses = new ArrayList<>();
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public User(String username, String email, String password, Role role) {
        this();
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<String> getEnrolledCourses() { return enrolledCourses; }
    public void setEnrolledCourses(List<String> enrolledCourses) { this.enrolledCourses = enrolledCourses; }

    public Integer getEstimatedIQ() { return estimatedIQ; }
    public void setEstimatedIQ(Integer estimatedIQ) { this.estimatedIQ = estimatedIQ; }

    public List<String> getCreatedCourses() { return createdCourses; }
    public void setCreatedCourses(List<String> createdCourses) { this.createdCourses = createdCourses; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getExpertise() { return expertise; }
    public void setExpertise(String expertise) { this.expertise = expertise; }

    @JsonIgnore
    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }

    public enum Role {
        ADMIN, INSTRUCTOR, STUDENT
    }
}
