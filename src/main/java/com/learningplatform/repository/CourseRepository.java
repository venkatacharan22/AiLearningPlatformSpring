package com.learningplatform.repository;

import com.learningplatform.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findByPublishedTrue();
    
    List<Course> findByInstructorId(String instructorId);
    
    List<Course> findByCategory(String category);
    
    List<Course> findByDifficulty(String difficulty);

    @Query("SELECT c FROM Course c WHERE " +
           "LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Course> findByTitleContaining(@Param("query") String query);

    @Query("SELECT c FROM Course c WHERE c.published = true AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Course> searchPublishedCourses(@Param("query") String query);
    
    @Query("SELECT c FROM Course c WHERE c.instructorId = :instructorId AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Course> searchInstructorCourses(@Param("instructorId") String instructorId, @Param("query") String query);
    
    long countByPublishedTrue();
    
    long countByInstructorId(String instructorId);
    
    @Query("SELECT AVG(c.averageRating) FROM Course c WHERE c.published = true AND c.averageRating > 0")
    Double getAverageRatingOfAllCourses();
}
