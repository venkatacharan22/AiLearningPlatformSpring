package com.learningplatform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String instructorId;

    @Column(nullable = false)
    private String instructorName;

    private String category;
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private int estimatedHours;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean published;
    
    // Course content
    @ElementCollection
    @CollectionTable(name = "course_lessons", joinColumns = @JoinColumn(name = "course_id"))
    private List<Lesson> lessons;

    @ElementCollection
    @CollectionTable(name = "course_materials", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "material_path")
    private List<String> materials; // File paths

    private String videoUrl; // YouTube link or local file path

    @Column(length = 2000)
    private String outline;

    @Column(length = 2000)
    private String summary; // AI-generated summary

    // Enrollment and progress
    @ElementCollection
    @CollectionTable(name = "course_enrolled_students", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "student_id")
    private List<String> enrolledStudents;

    private int totalEnrollments;
    private double averageRating;

    @ElementCollection
    @CollectionTable(name = "course_reviews", joinColumns = @JoinColumn(name = "course_id"))
    private List<Review> reviews;

    // Quiz - temporarily removed for simplification
    // private Quiz quiz;

    public Course() {
        this.lessons = new ArrayList<>();
        this.materials = new ArrayList<>();
        this.enrolledStudents = new ArrayList<>();
        this.reviews = new ArrayList<>();
        this.published = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Course(String title, String description, String instructorId) {
        this();
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInstructorId() { return instructorId; }
    public void setInstructorId(String instructorId) { this.instructorId = instructorId; }

    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(int estimatedHours) { this.estimatedHours = estimatedHours; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public List<Lesson> getLessons() { return lessons; }
    public void setLessons(List<Lesson> lessons) { this.lessons = lessons; }

    public List<String> getMaterials() { return materials; }
    public void setMaterials(List<String> materials) { this.materials = materials; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getOutline() { return outline; }
    public void setOutline(String outline) { this.outline = outline; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getEnrolledStudents() { return enrolledStudents; }
    public void setEnrolledStudents(List<String> enrolledStudents) { this.enrolledStudents = enrolledStudents; }

    public int getTotalEnrollments() { return totalEnrollments; }
    public void setTotalEnrollments(int totalEnrollments) { this.totalEnrollments = totalEnrollments; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }

    // public Quiz getQuiz() { return quiz; }
    // public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    @Embeddable
    public static class Lesson {
        private String id;
        private String title;

        @Column(length = 5000)
        private String content;

        // Rich text notes for detailed lesson content
        @Column(length = 10000)
        private String notes;

        private String videoUrl;
        private String videoTitle;
        private String videoDescription;
        private boolean videoEmbedded; // Whether video should be embedded or linked

        @Column(name = "lesson_order")
        private int order;

        private int durationMinutes;

        // Lesson type to support course flow restructuring
        @Enumerated(EnumType.STRING)
        private LessonType type;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Constructors, getters, and setters
        public Lesson() {
            this.type = LessonType.LESSON;
            this.videoEmbedded = true;
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
        }

        public Lesson(String title, String content) {
            this();
            this.title = title;
            this.content = content;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) {
            this.notes = notes;
            this.updatedAt = LocalDateTime.now();
        }

        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

        public String getVideoTitle() { return videoTitle; }
        public void setVideoTitle(String videoTitle) { this.videoTitle = videoTitle; }

        public String getVideoDescription() { return videoDescription; }
        public void setVideoDescription(String videoDescription) { this.videoDescription = videoDescription; }

        public boolean isVideoEmbedded() { return videoEmbedded; }
        public void setVideoEmbedded(boolean videoEmbedded) { this.videoEmbedded = videoEmbedded; }

        public int getOrder() { return order; }
        public void setOrder(int order) { this.order = order; }

        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

        public LessonType getType() { return type; }
        public void setType(LessonType type) { this.type = type; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    // Enum for lesson types to support course flow restructuring
    public enum LessonType {
        LESSON, ASSIGNMENT_PLACEHOLDER, VIDEO_LESSON, TEXT_LESSON
    }

    @Embeddable
    public static class Review {
        private String studentId;
        private String studentName;
        private int rating;

        @Column(length = 1000)
        private String comment;

        private LocalDateTime createdAt;

        public Review() {
            this.createdAt = LocalDateTime.now();
        }

        // Getters and setters
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public int getRating() { return rating; }
        public void setRating(int rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
