package com.learningplatform.service;

import com.learningplatform.model.Assignment;
import com.learningplatform.model.AssignmentSubmission;
import com.learningplatform.repository.AssignmentSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private AssignmentService assignmentService;

    public AssignmentSubmission submitAssignment(Long assignmentId, String studentId, String code, 
                                               int timeSpent, List<AssignmentSubmission.TestResult> testResults) {
        
        // Get assignment details
        Optional<Assignment> assignmentOpt = assignmentService.findById(assignmentId);
        if (assignmentOpt.isEmpty()) {
            throw new RuntimeException("Assignment not found");
        }
        
        Assignment assignment = assignmentOpt.get();
        
        // Check if student has exceeded max attempts
        int currentAttempts = getAttemptCount(studentId, assignmentId);
        if (currentAttempts >= assignment.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts exceeded for this assignment");
        }
        
        // Create submission
        AssignmentSubmission submission = new AssignmentSubmission(assignmentId, studentId, code);
        submission.setAttemptNumber(currentAttempts + 1);
        submission.setTimeSpentSeconds(timeSpent);
        submission.setTestResults(testResults);
        submission.setMaxScore(assignment.getPoints());
        
        // Calculate score and determine if passed
        int score = calculateScore(testResults, assignment.getPoints());
        boolean passed = score >= (assignment.getPoints() * 0.7); // 70% to pass
        
        submission.setScore(score);
        submission.setPassed(passed);
        
        // Generate feedback
        String feedback = generateFeedback(testResults, passed, score, assignment.getPoints());
        submission.setFeedback(feedback);
        
        // Set status
        submission.setStatus(AssignmentSubmission.SubmissionStatus.GRADED);
        submission.setGradedAt(LocalDateTime.now());
        
        return submissionRepository.save(submission);
    }

    public List<AssignmentSubmission> getStudentSubmissions(String studentId) {
        return submissionRepository.findRecentSubmissionsByStudent(studentId);
    }

    public List<AssignmentSubmission> getAssignmentSubmissions(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<AssignmentSubmission> getStudentAssignmentSubmissions(String studentId, Long assignmentId) {
        return submissionRepository.findByStudentIdAndAssignmentIdOrderBySubmittedAtDesc(studentId, assignmentId);
    }

    public Optional<AssignmentSubmission> getLatestSubmission(String studentId, Long assignmentId) {
        return submissionRepository.findLatestSubmissionByStudentAndAssignment(studentId, assignmentId);
    }

    public int getAttemptCount(String studentId, Long assignmentId) {
        return submissionRepository.countSubmissionsByStudentAndAssignment(studentId, assignmentId);
    }

    public List<AssignmentSubmission> getPassedSubmissions(String studentId) {
        return submissionRepository.findPassedSubmissionsByStudent(studentId);
    }

    public List<Long> getCompletedAssignments(String studentId) {
        return submissionRepository.findCompletedAssignmentIdsByStudent(studentId);
    }

    public Double getAverageScore(String studentId) {
        return submissionRepository.getAverageScoreByStudent(studentId);
    }

    public Double getAssignmentAverageScore(Long assignmentId) {
        return submissionRepository.getAverageScoreByAssignment(assignmentId);
    }

    public boolean hasPassedAssignment(String studentId, Long assignmentId) {
        List<AssignmentSubmission> submissions = submissionRepository.findByStudentIdAndAssignmentId(studentId, assignmentId);
        return submissions.stream().anyMatch(AssignmentSubmission::isPassed);
    }

    public AssignmentSubmission gradeSubmission(Long submissionId, int score, String feedback, String gradedBy) {
        Optional<AssignmentSubmission> submissionOpt = submissionRepository.findById(submissionId);
        if (submissionOpt.isEmpty()) {
            throw new RuntimeException("Submission not found");
        }
        
        AssignmentSubmission submission = submissionOpt.get();
        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setGradedBy(gradedBy);
        submission.setGradedAt(LocalDateTime.now());
        submission.setStatus(AssignmentSubmission.SubmissionStatus.GRADED);
        submission.setPassed(score >= (submission.getMaxScore() * 0.7));
        
        return submissionRepository.save(submission);
    }

    private int calculateScore(List<AssignmentSubmission.TestResult> testResults, int maxScore) {
        if (testResults == null || testResults.isEmpty()) {
            return 0;
        }
        
        long passedTests = testResults.stream().mapToLong(tr -> tr.isPassed() ? 1 : 0).sum();
        return (int) ((passedTests * maxScore) / testResults.size());
    }

    private String generateFeedback(List<AssignmentSubmission.TestResult> testResults, boolean passed, 
                                  int score, int maxScore) {
        StringBuilder feedback = new StringBuilder();
        
        if (passed) {
            feedback.append("🎉 Excellent work! You've successfully completed this assignment.\n\n");
        } else {
            feedback.append("Good effort! Keep practicing to improve your solution.\n\n");
        }
        
        feedback.append(String.format("Score: %d/%d (%d%%)\n", score, maxScore, (score * 100) / maxScore));
        
        if (testResults != null && !testResults.isEmpty()) {
            long passedTests = testResults.stream().mapToLong(tr -> tr.isPassed() ? 1 : 0).sum();
            feedback.append(String.format("Test Cases: %d/%d passed\n\n", passedTests, testResults.size()));
            
            if (!passed) {
                feedback.append("💡 Tips for improvement:\n");
                feedback.append("- Review the problem statement carefully\n");
                feedback.append("- Check your logic for edge cases\n");
                feedback.append("- Test your solution with the provided examples\n");
                feedback.append("- Consider the time and space complexity\n");
            }
        }
        
        return feedback.toString();
    }

    public List<AssignmentSubmission> getPendingSubmissions() {
        return submissionRepository.findByStatus(AssignmentSubmission.SubmissionStatus.PENDING_REVIEW);
    }

    public void deleteSubmission(Long submissionId) {
        submissionRepository.deleteById(submissionId);
    }

    public Optional<AssignmentSubmission> findById(Long submissionId) {
        return submissionRepository.findById(submissionId);
    }
}
