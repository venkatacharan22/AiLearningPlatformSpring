package com.learningplatform.repository;

import com.learningplatform.model.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    
    List<AssignmentSubmission> findByStudentId(String studentId);
    
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    
    List<AssignmentSubmission> findByStudentIdAndAssignmentId(String studentId, Long assignmentId);
    
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.studentId = :studentId AND s.assignmentId = :assignmentId ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByStudentIdAndAssignmentIdOrderBySubmittedAtDesc(@Param("studentId") String studentId, @Param("assignmentId") Long assignmentId);
    
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.studentId = :studentId AND s.assignmentId = :assignmentId ORDER BY s.submittedAt DESC LIMIT 1")
    Optional<AssignmentSubmission> findLatestSubmissionByStudentAndAssignment(@Param("studentId") String studentId, @Param("assignmentId") Long assignmentId);
    
    @Query("SELECT COUNT(s) FROM AssignmentSubmission s WHERE s.studentId = :studentId AND s.assignmentId = :assignmentId")
    int countSubmissionsByStudentAndAssignment(@Param("studentId") String studentId, @Param("assignmentId") Long assignmentId);
    
    List<AssignmentSubmission> findByStatus(AssignmentSubmission.SubmissionStatus status);
    
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.assignmentId = :assignmentId AND s.passed = true")
    List<AssignmentSubmission> findPassedSubmissionsByAssignment(@Param("assignmentId") Long assignmentId);
    
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.studentId = :studentId AND s.passed = true")
    List<AssignmentSubmission> findPassedSubmissionsByStudent(@Param("studentId") String studentId);
    
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.submittedAt BETWEEN :startDate AND :endDate")
    List<AssignmentSubmission> findSubmissionsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT AVG(s.score) FROM AssignmentSubmission s WHERE s.assignmentId = :assignmentId")
    Double getAverageScoreByAssignment(@Param("assignmentId") Long assignmentId);
    
    @Query("SELECT AVG(s.score) FROM AssignmentSubmission s WHERE s.studentId = :studentId")
    Double getAverageScoreByStudent(@Param("studentId") String studentId);
    
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.studentId = :studentId ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findRecentSubmissionsByStudent(@Param("studentId") String studentId);
    
    @Query("SELECT DISTINCT s.assignmentId FROM AssignmentSubmission s WHERE s.studentId = :studentId AND s.passed = true")
    List<Long> findCompletedAssignmentIdsByStudent(@Param("studentId") String studentId);
}
