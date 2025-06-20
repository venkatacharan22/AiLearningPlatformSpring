package com.learningplatform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Embeddable
public class Quiz {
    private String id;
    private String title;

    @Column(length = 1000)
    private String description;

    private String courseId;
    private String topic;

    @ElementCollection
    @CollectionTable(name = "quiz_questions", joinColumns = @JoinColumn(name = "quiz_id"))
    private List<Question> questions;

    private int timeLimit; // in minutes
    private int passingScore; // percentage
    private LocalDateTime createdAt;
    private boolean aiGenerated;

    public Quiz() {
        this.questions = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.passingScore = 70; // default 70%
        this.timeLimit = 30; // default 30 minutes
    }

    public Quiz(String title, String topic) {
        this();
        this.title = title;
        this.topic = topic;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public int getTimeLimit() { return timeLimit; }
    public void setTimeLimit(int timeLimit) { this.timeLimit = timeLimit; }

    public int getPassingScore() { return passingScore; }
    public void setPassingScore(int passingScore) { this.passingScore = passingScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isAiGenerated() { return aiGenerated; }
    public void setAiGenerated(boolean aiGenerated) { this.aiGenerated = aiGenerated; }

    @Embeddable
    public static class Question {
        private String id;

        @Column(length = 1000)
        private String questionText;

        @ElementCollection
        @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
        @Column(name = "option_text")
        private List<String> options;

        private int correctAnswerIndex;

        @Column(length = 1000)
        private String explanation;

        private int points;

        public Question() {
            this.options = new ArrayList<>();
            this.points = 1;
        }

        public Question(String questionText, List<String> options, int correctAnswerIndex) {
            this();
            this.questionText = questionText;
            this.options = options;
            this.correctAnswerIndex = correctAnswerIndex;
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }

        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }

        public int getCorrectAnswerIndex() { return correctAnswerIndex; }
        public void setCorrectAnswerIndex(int correctAnswerIndex) { this.correctAnswerIndex = correctAnswerIndex; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }

        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }
    }
}
