package com.learningplatform.service;

import com.learningplatform.model.Course;
import com.learningplatform.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for managing lesson content, notes, and YouTube video integration
 */
@Service
@Transactional
public class LessonService {

    @Autowired
    private CourseRepository courseRepository;

    @Value("${youtube.api.key}")
    private String youtubeApiKey;

    // YouTube URL patterns for validation
    private static final Pattern YOUTUBE_URL_PATTERN = Pattern.compile(
        "^(https?://)?(www\\.)?(youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([a-zA-Z0-9_-]{11}).*$"
    );

    /**
     * Add a new lesson to a course
     */
    public Course.Lesson addLessonToCourse(String courseId, Course.Lesson lesson) {
        Optional<Course> courseOpt = courseRepository.findById(Long.parseLong(courseId));
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        // Generate unique lesson ID
        lesson.setId(UUID.randomUUID().toString());
        lesson.setCreatedAt(LocalDateTime.now());
        lesson.setUpdatedAt(LocalDateTime.now());
        
        // Set order if not specified
        if (lesson.getOrder() == 0) {
            lesson.setOrder(course.getLessons().size() + 1);
        }

        // Validate and process video URL if provided
        if (lesson.getVideoUrl() != null && !lesson.getVideoUrl().trim().isEmpty()) {
            String processedVideoUrl = processYouTubeUrl(lesson.getVideoUrl());
            lesson.setVideoUrl(processedVideoUrl);
        }

        course.getLessons().add(lesson);
        course.setUpdatedAt(LocalDateTime.now());
        
        Course savedCourse = courseRepository.save(course);
        
        // Return the added lesson
        return savedCourse.getLessons().stream()
            .filter(l -> l.getId().equals(lesson.getId()))
            .findFirst()
            .orElse(lesson);
    }

    /**
     * Update lesson content and notes
     */
    public Course.Lesson updateLesson(String courseId, String lessonId, Course.Lesson updatedLesson) {
        Optional<Course> courseOpt = courseRepository.findById(Long.parseLong(courseId));
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        List<Course.Lesson> lessons = course.getLessons();
        
        for (int i = 0; i < lessons.size(); i++) {
            Course.Lesson lesson = lessons.get(i);
            if (lesson.getId().equals(lessonId)) {
                // Update lesson fields
                lesson.setTitle(updatedLesson.getTitle());
                lesson.setContent(updatedLesson.getContent());
                lesson.setNotes(updatedLesson.getNotes());
                lesson.setDurationMinutes(updatedLesson.getDurationMinutes());
                lesson.setUpdatedAt(LocalDateTime.now());
                
                // Process video URL if provided
                if (updatedLesson.getVideoUrl() != null && !updatedLesson.getVideoUrl().trim().isEmpty()) {
                    String processedVideoUrl = processYouTubeUrl(updatedLesson.getVideoUrl());
                    lesson.setVideoUrl(processedVideoUrl);
                    lesson.setVideoTitle(updatedLesson.getVideoTitle());
                    lesson.setVideoDescription(updatedLesson.getVideoDescription());
                    lesson.setVideoEmbedded(updatedLesson.isVideoEmbedded());
                }
                
                lessons.set(i, lesson);
                course.setUpdatedAt(LocalDateTime.now());
                courseRepository.save(course);
                
                return lesson;
            }
        }
        
        throw new RuntimeException("Lesson not found");
    }

    /**
     * Delete a lesson from a course
     */
    public void deleteLesson(String courseId, String lessonId) {
        Optional<Course> courseOpt = courseRepository.findById(Long.parseLong(courseId));
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        List<Course.Lesson> lessons = course.getLessons();
        
        boolean removed = lessons.removeIf(lesson -> lesson.getId().equals(lessonId));
        
        if (removed) {
            // Reorder remaining lessons
            for (int i = 0; i < lessons.size(); i++) {
                lessons.get(i).setOrder(i + 1);
            }
            
            course.setUpdatedAt(LocalDateTime.now());
            courseRepository.save(course);
        } else {
            throw new RuntimeException("Lesson not found");
        }
    }

    /**
     * Reorder lessons in a course
     */
    public List<Course.Lesson> reorderLessons(String courseId, List<String> lessonIds) {
        Optional<Course> courseOpt = courseRepository.findById(Long.parseLong(courseId));
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        List<Course.Lesson> lessons = course.getLessons();
        
        // Create a new ordered list
        List<Course.Lesson> reorderedLessons = new java.util.ArrayList<>();
        
        for (int i = 0; i < lessonIds.size(); i++) {
            String lessonId = lessonIds.get(i);
            Course.Lesson lesson = lessons.stream()
                .filter(l -> l.getId().equals(lessonId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));
            
            lesson.setOrder(i + 1);
            lesson.setUpdatedAt(LocalDateTime.now());
            reorderedLessons.add(lesson);
        }
        
        course.setLessons(reorderedLessons);
        course.setUpdatedAt(LocalDateTime.now());
        Course savedCourse = courseRepository.save(course);
        
        return savedCourse.getLessons();
    }

    /**
     * Process and validate YouTube URL
     */
    public String processYouTubeUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }

        String trimmedUrl = url.trim();
        
        // Check if it's a valid YouTube URL
        Matcher matcher = YOUTUBE_URL_PATTERN.matcher(trimmedUrl);
        if (!matcher.matches()) {
            throw new RuntimeException("Invalid YouTube URL format");
        }

        // Extract video ID
        String videoId = matcher.group(4);
        
        // Return standardized embed URL
        return "https://www.youtube.com/embed/" + videoId;
    }

    /**
     * Extract YouTube video ID from URL
     */
    public String extractYouTubeVideoId(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }

        Matcher matcher = YOUTUBE_URL_PATTERN.matcher(url.trim());
        if (matcher.matches()) {
            return matcher.group(4);
        }
        
        return null;
    }

    /**
     * Validate YouTube URL
     */
    public boolean isValidYouTubeUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        return YOUTUBE_URL_PATTERN.matcher(url.trim()).matches();
    }

    /**
     * Get lesson by ID from a course
     */
    public Course.Lesson getLessonById(String courseId, String lessonId) {
        Optional<Course> courseOpt = courseRepository.findById(Long.parseLong(courseId));
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        return course.getLessons().stream()
            .filter(lesson -> lesson.getId().equals(lessonId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    /**
     * Get all lessons for a course
     */
    public List<Course.Lesson> getLessonsByCourse(String courseId) {
        Optional<Course> courseOpt = courseRepository.findById(Long.parseLong(courseId));
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        return course.getLessons();
    }
}
