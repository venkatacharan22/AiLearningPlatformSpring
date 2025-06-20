package com.learningplatform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignments")
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String courseId;

    @Column(nullable = false)
    private String instructorId;

    @Enumerated(EnumType.STRING)
    private AssignmentType type; // CODING, QUIZ, ESSAY, PROJECT

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty; // EASY, MEDIUM, HARD

    @Column(length = 5000)
    private String problemStatement;

    @Column(length = 2000)
    private String constraints;

    @ElementCollection
    @CollectionTable(name = "assignment_examples", joinColumns = @JoinColumn(name = "assignment_id"))
    private List<Example> examples;

    @ElementCollection
    @CollectionTable(name = "assignment_test_cases", joinColumns = @JoinColumn(name = "assignment_id"))
    private List<TestCase> testCases;

    @Column(length = 1000)
    private String starterCode;

    @Column(length = 1000)
    private String solution;

    private String programmingLanguage; // java, python, javascript, etc.

    private int timeLimit; // in minutes
    private int maxAttempts;
    private int points;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime dueDate;

    @Column(nullable = false)
    private boolean published;

    private boolean aiGenerated;

    @Enumerated(EnumType.STRING)
    private AssignmentSource source; // AI_GENERATED, CODEFORCES, MANUAL, SKIPPED

    // Constructors
    public Assignment() {
        this.examples = new ArrayList<>();
        this.testCases = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.published = false;
        this.aiGenerated = false;
        this.source = AssignmentSource.MANUAL;
        this.timeLimit = 60; // default 1 hour
        this.maxAttempts = 3;
        this.points = 100;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getInstructorId() { return instructorId; }
    public void setInstructorId(String instructorId) { this.instructorId = instructorId; }

    public AssignmentType getType() { return type; }
    public void setType(AssignmentType type) { this.type = type; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }

    public List<Example> getExamples() { return examples; }
    public void setExamples(List<Example> examples) { this.examples = examples; }

    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }

    public String getStarterCode() { return starterCode; }
    public void setStarterCode(String starterCode) { this.starterCode = starterCode; }

    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

    public String getProgrammingLanguage() { return programmingLanguage; }
    public void setProgrammingLanguage(String programmingLanguage) { this.programmingLanguage = programmingLanguage; }

    public int getTimeLimit() { return timeLimit; }
    public void setTimeLimit(int timeLimit) { this.timeLimit = timeLimit; }

    public int getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public boolean isAiGenerated() { return aiGenerated; }
    public void setAiGenerated(boolean aiGenerated) { this.aiGenerated = aiGenerated; }

    public AssignmentSource getSource() { return source; }
    public void setSource(AssignmentSource source) { this.source = source; }

    // Enums
    public enum AssignmentType {
        CODING, QUIZ, ESSAY, PROJECT
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum AssignmentSource {
        AI_GENERATED, CODEFORCES, MANUAL, SKIPPED
    }

    // Embedded classes
    @Embeddable
    public static class Example {
        @Column(length = 1000)
        private String input;

        @Column(length = 1000)
        private String output;

        @Column(length = 500)
        private String explanation;

        public Example() {}

        public Example(String input, String output, String explanation) {
            this.input = input;
            this.output = output;
            this.explanation = explanation;
        }

        // Getters and Setters
        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }

        public String getOutput() { return output; }
        public void setOutput(String output) { this.output = output; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    @Embeddable
    public static class TestCase {
        @Column(length = 1000)
        private String input;

        @Column(length = 1000)
        private String expectedOutput;

        private boolean isHidden; // Hidden test cases for evaluation

        public TestCase() {}

        public TestCase(String input, String expectedOutput, boolean isHidden) {
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.isHidden = isHidden;
        }

        // Getters and Setters
        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }

        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

        public boolean isHidden() { return isHidden; }
        public void setHidden(boolean hidden) { isHidden = hidden; }
    }
}
