package com.learningplatform.repository;

import com.learningplatform.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    
    Optional<Progress> findByStudentIdAndCourseId(String studentId, String courseId);
    
    List<Progress> findByStudentId(String studentId);
    
    List<Progress> findByCourseId(String courseId);
    
    List<Progress> findByCompleted(boolean completed);
    
    @Query("SELECT p FROM Progress p WHERE p.studentId = :studentId AND p.completed = true")
    List<Progress> findCompletedCoursesByStudent(@Param("studentId") String studentId);
    
    @Query("SELECT p FROM Progress p WHERE p.courseId = :courseId AND p.completed = true")
    List<Progress> findCompletedStudentsByCourse(@Param("courseId") String courseId);
    
    @Query("SELECT AVG(p.completionPercentage) FROM Progress p WHERE p.courseId = :courseId")
    Double getAverageCompletionByCourse(@Param("courseId") String courseId);
    
    @Query("SELECT AVG(p.averageQuizScore) FROM Progress p WHERE p.studentId = :studentId")
    Double getAverageQuizScoreByStudent(@Param("studentId") String studentId);
    
    @Query("SELECT COUNT(p) FROM Progress p WHERE p.courseId = :courseId")
    long countEnrollmentsByCourse(@Param("courseId") String courseId);
    
    @Query("SELECT COUNT(p) FROM Progress p WHERE p.studentId = :studentId")
    long countEnrollmentsByStudent(@Param("studentId") String studentId);
    
    @Query("SELECT p FROM Progress p WHERE p.completionPercentage >= :minPercentage")
    List<Progress> findByCompletionPercentageGreaterThanEqual(@Param("minPercentage") int minPercentage);
}
