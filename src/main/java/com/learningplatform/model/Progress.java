package com.learningplatform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "student_progress")
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String courseId;

    private int completionPercentage;
    private LocalDateTime enrolledAt;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime completedAt;
    private boolean completed;

    // Lesson progress
    @ElementCollection
    @CollectionTable(name = "lesson_progress", joinColumns = @JoinColumn(name = "progress_id"))
    @MapKeyColumn(name = "lesson_key")
    private Map<String, LessonProgress> lessonProgress;

    // Quiz attempts
    @ElementCollection
    @CollectionTable(name = "quiz_attempts", joinColumns = @JoinColumn(name = "progress_id"))
    private List<QuizAttempt> quizAttempts;

    // Time tracking
    private int totalTimeSpentMinutes;

    // Performance metrics
    private double averageQuizScore;
    private int totalQuizAttempts;

    public Progress() {
        this.lessonProgress = new HashMap<>();
        this.quizAttempts = new ArrayList<>();
        this.enrolledAt = LocalDateTime.now();
        this.lastAccessedAt = LocalDateTime.now();
        this.completionPercentage = 0;
        this.completed = false;
    }

    public Progress(String studentId, String courseId) {
        this();
        this.studentId = studentId;
        this.courseId = courseId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public int getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(int completionPercentage) { this.completionPercentage = completionPercentage; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public LocalDateTime getLastAccessedAt() { return lastAccessedAt; }
    public void setLastAccessedAt(LocalDateTime lastAccessedAt) { this.lastAccessedAt = lastAccessedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public Map<String, LessonProgress> getLessonProgress() { return lessonProgress; }
    public void setLessonProgress(Map<String, LessonProgress> lessonProgress) { this.lessonProgress = lessonProgress; }

    public List<QuizAttempt> getQuizAttempts() { return quizAttempts; }
    public void setQuizAttempts(List<QuizAttempt> quizAttempts) { this.quizAttempts = quizAttempts; }

    public int getTotalTimeSpentMinutes() { return totalTimeSpentMinutes; }
    public void setTotalTimeSpentMinutes(int totalTimeSpentMinutes) { this.totalTimeSpentMinutes = totalTimeSpentMinutes; }

    public double getAverageQuizScore() { return averageQuizScore; }
    public void setAverageQuizScore(double averageQuizScore) { this.averageQuizScore = averageQuizScore; }

    public int getTotalQuizAttempts() { return totalQuizAttempts; }
    public void setTotalQuizAttempts(int totalQuizAttempts) { this.totalQuizAttempts = totalQuizAttempts; }

    @Embeddable
    public static class LessonProgress {
        @Column(name = "lesson_identifier")
        private String lessonId;
        private boolean completed;
        private LocalDateTime startedAt;
        private LocalDateTime completedAt;
        private int timeSpentMinutes;
        private int watchedPercentage; // for video lessons

        public LessonProgress() {
            this.startedAt = LocalDateTime.now();
        }

        public LessonProgress(String lessonId) {
            this();
            this.lessonId = lessonId;
        }

        // Getters and Setters
        public String getLessonId() { return lessonId; }
        public void setLessonId(String lessonId) { this.lessonId = lessonId; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }

        public LocalDateTime getStartedAt() { return startedAt; }
        public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

        public int getTimeSpentMinutes() { return timeSpentMinutes; }
        public void setTimeSpentMinutes(int timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; }

        public int getWatchedPercentage() { return watchedPercentage; }
        public void setWatchedPercentage(int watchedPercentage) { this.watchedPercentage = watchedPercentage; }
    }

    @Embeddable
    public static class QuizAttempt {
        private String quizId;
        private LocalDateTime attemptedAt;
        private int score;
        private int totalQuestions;
        private int correctAnswers;
        private boolean passed;
        private int timeSpentMinutes;

        // Store answers as JSON string instead of nested ElementCollection
        @Column(length = 2000)
        private String answersJson; // JSON representation of answers

        public QuizAttempt() {
            this.attemptedAt = LocalDateTime.now();
        }

        public QuizAttempt(String quizId) {
            this();
            this.quizId = quizId;
        }

        // Getters and Setters
        public String getQuizId() { return quizId; }
        public void setQuizId(String quizId) { this.quizId = quizId; }

        public LocalDateTime getAttemptedAt() { return attemptedAt; }
        public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

        public int getCorrectAnswers() { return correctAnswers; }
        public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }

        public int getTimeSpentMinutes() { return timeSpentMinutes; }
        public void setTimeSpentMinutes(int timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; }

        public String getAnswersJson() { return answersJson; }
        public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }

        // Helper methods for answers
        public Map<String, String> getAnswers() {
            if (answersJson == null || answersJson.isEmpty()) {
                return new HashMap<>();
            }
            try {
                // Simple JSON parsing - in production use Jackson or Gson
                Map<String, String> answers = new HashMap<>();
                String json = answersJson.replace("{", "").replace("}", "").replace("\"", "");
                if (!json.trim().isEmpty()) {
                    String[] pairs = json.split(",");
                    for (String pair : pairs) {
                        String[] keyValue = pair.split(":");
                        if (keyValue.length == 2) {
                            answers.put(keyValue[0].trim(), keyValue[1].trim());
                        }
                    }
                }
                return answers;
            } catch (Exception e) {
                return new HashMap<>();
            }
        }

        public void setAnswers(Map<String, String> answers) {
            if (answers == null || answers.isEmpty()) {
                this.answersJson = "{}";
                return;
            }
            // Simple JSON serialization - in production use Jackson or Gson
            StringBuilder json = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, String> entry : answers.entrySet()) {
                if (!first) json.append(",");
                json.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
                first = false;
            }
            json.append("}");
            this.answersJson = json.toString();
        }
    }
}
