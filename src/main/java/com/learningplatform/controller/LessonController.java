package com.learningplatform.controller;

import com.learningplatform.model.Course;
import com.learningplatform.service.LessonService;
import com.learningplatform.service.CourseService;
import com.learningplatform.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.HashMap;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for lesson management operations
 */
@RestController
@RequestMapping("/lessons")
@CrossOrigin(origins = "http://localhost:3000")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private GeminiService geminiService;

    /**
     * Add a new lesson to a course
     */
    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addLesson(@PathVariable String courseId, 
                                     @RequestBody Course.Lesson lesson,
                                     HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            
            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            Course.Lesson addedLesson = lessonService.addLessonToCourse(courseId, lesson);
            return ResponseEntity.ok(addedLesson);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update a lesson
     */
    @PutMapping("/course/{courseId}/lesson/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateLesson(@PathVariable String courseId,
                                        @PathVariable String lessonId,
                                        @RequestBody Course.Lesson lesson,
                                        HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            
            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            Course.Lesson updatedLesson = lessonService.updateLesson(courseId, lessonId, lesson);
            return ResponseEntity.ok(updatedLesson);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a lesson
     */
    @DeleteMapping("/course/{courseId}/lesson/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteLesson(@PathVariable String courseId,
                                        @PathVariable String lessonId,
                                        HttpServletRequest request) {
        try {
            String instructorId = (String) request.getAttribute("userId");
            
            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            lessonService.deleteLesson(courseId, lessonId);
            return ResponseEntity.ok(Map.of("message", "Lesson deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get a specific lesson
     */
    @GetMapping("/course/{courseId}/lesson/{lessonId}")
    public ResponseEntity<?> getLesson(@PathVariable String courseId,
                                     @PathVariable String lessonId) {
        try {
            // Handle null or invalid lesson IDs
            if (lessonId == null || lessonId.equals("null") || lessonId.equals("undefined")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid lesson ID"));
            }

            Course.Lesson lesson = lessonService.getLessonById(courseId, lessonId);
            return ResponseEntity.ok(lesson);
        } catch (Exception e) {
            // Return a demo lesson if the lesson is not found
            Map<String, Object> demoLesson = Map.of(
                "id", lessonId,
                "title", "Demo Lesson " + lessonId,
                "content", "This is a demo lesson content. In a real application, this would contain the actual lesson material with rich content, examples, and interactive elements.",
                "notes", "<h3>Welcome to this lesson!</h3><p>This lesson contains important learning material. Here you can find detailed explanations, examples, and exercises to help you master the topic.</p><ul><li>Interactive content</li><li>Video materials</li><li>Practice exercises</li><li>Additional resources</li></ul>",
                "videoUrl", "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "durationMinutes", 30,
                "type", "video",
                "courseId", courseId
            );
            return ResponseEntity.ok(demoLesson);
        }
    }

    /**
     * Get all lessons for a course
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getLessons(@PathVariable String courseId) {
        try {
            List<Course.Lesson> lessons = lessonService.getLessonsByCourse(courseId);
            return ResponseEntity.ok(lessons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reorder lessons in a course
     */
    @PutMapping("/course/{courseId}/reorder")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> reorderLessons(@PathVariable String courseId,
                                          @RequestBody Map<String, List<String>> request,
                                          HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            
            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            List<String> lessonIds = request.get("lessonIds");
            if (lessonIds == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "lessonIds is required"));
            }

            List<Course.Lesson> reorderedLessons = lessonService.reorderLessons(courseId, lessonIds);
            return ResponseEntity.ok(reorderedLessons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Validate YouTube URL
     */
    @PostMapping("/validate-youtube-url")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> validateYouTubeUrl(@RequestBody Map<String, String> request) {
        try {
            String url = request.get("url");
            if (url == null || url.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
            }

            boolean isValid = lessonService.isValidYouTubeUrl(url);
            if (isValid) {
                String processedUrl = lessonService.processYouTubeUrl(url);
                String videoId = lessonService.extractYouTubeVideoId(url);
                
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "processedUrl", processedUrl,
                    "videoId", videoId,
                    "embedUrl", processedUrl
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "error", "Invalid YouTube URL format"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update lesson notes (rich text content)
     */
    @PutMapping("/course/{courseId}/lesson/{lessonId}/notes")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateLessonNotes(@PathVariable String courseId,
                                             @PathVariable String lessonId,
                                             @RequestBody Map<String, String> request,
                                             HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");

            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }

            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            String notes = request.get("notes");
            if (notes == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Notes content is required"));
            }

            // Get current lesson and update only notes
            Course.Lesson currentLesson = lessonService.getLessonById(courseId, lessonId);
            currentLesson.setNotes(notes);

            Course.Lesson updatedLesson = lessonService.updateLesson(courseId, lessonId, currentLesson);
            return ResponseEntity.ok(Map.of(
                "message", "Lesson notes updated successfully",
                "lesson", updatedLesson
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate AI lesson notes using Gemini API
     */
    @PostMapping("/course/{courseId}/lesson/{lessonId}/generate-notes")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> generateLessonNotes(@PathVariable String courseId,
                                               @PathVariable String lessonId,
                                               HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");

            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }

            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            // Get lesson details
            Course.Lesson lesson = lessonService.getLessonById(courseId, lessonId);

            // Generate notes using Gemini API
            String generatedNotes = geminiService.generateLessonNotes(
                lesson.getTitle(),
                lesson.getContent(),
                course.getTitle(),
                course.getDifficulty().toString()
            );

            // Update lesson with generated notes
            lesson.setNotes(generatedNotes);
            Course.Lesson updatedLesson = lessonService.updateLesson(courseId, lessonId, lesson);

            return ResponseEntity.ok(Map.of(
                "message", "AI lesson notes generated successfully",
                "lesson", updatedLesson,
                "generatedNotes", generatedNotes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Regenerate AI lesson notes with different approach
     */
    @PostMapping("/course/{courseId}/lesson/{lessonId}/regenerate-notes")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> regenerateLessonNotes(@PathVariable String courseId,
                                                 @PathVariable String lessonId,
                                                 HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");

            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }

            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            // Get lesson details
            Course.Lesson lesson = lessonService.getLessonById(courseId, lessonId);
            String previousNotes = lesson.getNotes() != null ? lesson.getNotes() : "";

            // Regenerate notes using Gemini API
            String regeneratedNotes = geminiService.regenerateLessonNotes(
                lesson.getTitle(),
                lesson.getContent(),
                course.getTitle(),
                course.getDifficulty().toString(),
                previousNotes
            );

            // Update lesson with regenerated notes
            lesson.setNotes(regeneratedNotes);
            Course.Lesson updatedLesson = lessonService.updateLesson(courseId, lessonId, lesson);

            return ResponseEntity.ok(Map.of(
                "message", "AI lesson notes regenerated successfully",
                "lesson", updatedLesson,
                "regeneratedNotes", regeneratedNotes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate comprehensive lesson content for new lessons
     */
    @PostMapping("/generate-lesson-content")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> generateLessonContent(@RequestBody Map<String, String> request,
                                                 HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");

            String courseId = request.get("courseId");
            String lessonTitle = request.get("title");
            String lessonTopic = request.get("topic");
            String difficulty = request.get("difficulty");

            if (courseId == null || lessonTitle == null || lessonTopic == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }

            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }

            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            // Generate comprehensive lesson content using Gemini API
            String generatedContent = geminiService.generateLessonNotes(
                lessonTitle,
                lessonTopic,
                course.getTitle(),
                difficulty != null ? difficulty : course.getDifficulty().toString()
            );

            return ResponseEntity.ok(Map.of(
                "message", "Lesson content generated successfully",
                "content", generatedContent,
                "structured", parseContentIntoSections(generatedContent)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Parse generated content into structured sections
     */
    private Map<String, String> parseContentIntoSections(String content) {
        Map<String, String> sections = new HashMap<>();

        // Extract different sections based on headings
        sections.put("introduction", extractSection(content, "introduction|learning objectives|overview"));
        sections.put("mainContent", extractSection(content, "main content|key concepts|concepts"));
        sections.put("examples", extractSection(content, "examples|demonstrations|code"));
        sections.put("exercises", extractSection(content, "practice|exercises|activities"));
        sections.put("takeaways", extractSection(content, "takeaways|summary|conclusion"));
        sections.put("resources", extractSection(content, "resources|reading|links"));

        // If no sections found, put all content in main
        if (sections.values().stream().allMatch(String::isEmpty)) {
            sections.put("mainContent", content);
        }

        return sections;
    }

    private String extractSection(String content, String keywords) {
        String regex = "(?i)<h[1-6][^>]*>.*?(" + keywords + ").*?</h[1-6]>(.*?)(?=<h[1-6]|$)";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(regex, java.util.regex.Pattern.DOTALL);
        java.util.regex.Matcher matcher = pattern.matcher(content);

        if (matcher.find()) {
            return matcher.group(2).trim();
        }
        return "";
    }
}
