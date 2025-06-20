package com.learningplatform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "assignment_submissions")
public class AssignmentSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assignmentId;

    @Column(nullable = false)
    private String studentId;

    @Column(length = 10000)
    private String submittedCode;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private int score;
    private int maxScore;
    private boolean passed;

    private int attemptNumber;
    private int timeSpentSeconds;

    @ElementCollection
    @CollectionTable(name = "submission_test_results", joinColumns = @JoinColumn(name = "submission_id"))
    private List<TestResult> testResults;

    @Column(length = 2000)
    private String feedback;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    private LocalDateTime gradedAt;
    private String gradedBy; // instructor ID

    public AssignmentSubmission() {
        this.submittedAt = LocalDateTime.now();
        this.status = SubmissionStatus.SUBMITTED;
    }

    public AssignmentSubmission(Long assignmentId, String studentId, String submittedCode) {
        this();
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.submittedCode = submittedCode;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSubmittedCode() { return submittedCode; }
    public void setSubmittedCode(String submittedCode) { this.submittedCode = submittedCode; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getMaxScore() { return maxScore; }
    public void setMaxScore(int maxScore) { this.maxScore = maxScore; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public int getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(int attemptNumber) { this.attemptNumber = attemptNumber; }

    public int getTimeSpentSeconds() { return timeSpentSeconds; }
    public void setTimeSpentSeconds(int timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }

    public List<TestResult> getTestResults() { return testResults; }
    public void setTestResults(List<TestResult> testResults) { this.testResults = testResults; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public String getGradedBy() { return gradedBy; }
    public void setGradedBy(String gradedBy) { this.gradedBy = gradedBy; }

    // Enums and Embedded Classes
    public enum SubmissionStatus {
        SUBMITTED, GRADED, PENDING_REVIEW, REJECTED
    }

    @Embeddable
    public static class TestResult {
        private String testCaseId;
        private boolean passed;
        private String actualOutput;
        private String expectedOutput;
        private String errorMessage;
        private long executionTimeMs;

        public TestResult() {}

        public TestResult(String testCaseId, boolean passed, String actualOutput, String expectedOutput) {
            this.testCaseId = testCaseId;
            this.passed = passed;
            this.actualOutput = actualOutput;
            this.expectedOutput = expectedOutput;
        }

        // Getters and Setters
        public String getTestCaseId() { return testCaseId; }
        public void setTestCaseId(String testCaseId) { this.testCaseId = testCaseId; }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }

        public String getActualOutput() { return actualOutput; }
        public void setActualOutput(String actualOutput) { this.actualOutput = actualOutput; }

        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public long getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
    }
}
