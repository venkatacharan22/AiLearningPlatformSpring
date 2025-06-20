package com.learningplatform.repository;

import com.learningplatform.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    List<Assignment> findByCourseIdAndPublishedTrue(String courseId);
    
    List<Assignment> findByCourseId(String courseId);
    
    List<Assignment> findByInstructorId(String instructorId);
    
    List<Assignment> findByType(Assignment.AssignmentType type);
    
    List<Assignment> findByDifficulty(Assignment.Difficulty difficulty);
    
    @Query("SELECT a FROM Assignment a WHERE a.courseId = :courseId AND a.type = :type AND a.published = true")
    List<Assignment> findByCourseIdAndType(@Param("courseId") String courseId, @Param("type") Assignment.AssignmentType type);
    
    @Query("SELECT a FROM Assignment a WHERE a.instructorId = :instructorId AND a.published = true")
    List<Assignment> findPublishedByInstructor(@Param("instructorId") String instructorId);
    
    @Query("SELECT COUNT(a) FROM Assignment a WHERE a.courseId = :courseId AND a.published = true")
    long countByCourseIdAndPublishedTrue(@Param("courseId") String courseId);
}
