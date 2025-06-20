package com.learningplatform.service;

import com.learningplatform.model.Course;
import com.learningplatform.model.User;
import com.learningplatform.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GeminiService geminiService;

    @Value("${app.uploads.path}")
    private String uploadsPath;

    private Optional<Course> findCourseById(String id) {
        try {
            return courseRepository.findById(Long.parseLong(id));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    public Course createCourse(Course course, String instructorId) {
        // Verify instructor exists
        Long instructorLongId = Long.parseLong(instructorId);
        Optional<User> instructor = userService.findById(instructorLongId);
        if (instructor.isEmpty() || instructor.get().getRole() != User.Role.INSTRUCTOR) {
            throw new RuntimeException("Invalid instructor");
        }

        course.setInstructorId(instructorId);
        course.setInstructorName(instructor.get().getFullName());

        Course savedCourse = courseRepository.save(course);

        // Add course to instructor's created courses
        userService.addCreatedCourse(instructorLongId, savedCourse.getId().toString());

        return savedCourse;
    }

    public Optional<Course> findById(String id) {
        return findCourseById(id);
    }

    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    public List<Course> findPublishedCourses() {
        return courseRepository.findByPublishedTrue();
    }

    public List<Course> findByInstructor(String instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    public List<Course> findByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    public List<Course> findByDifficulty(String difficulty) {
        return courseRepository.findByDifficulty(difficulty);
    }

    public List<Course> searchCourses(String query) {
        return courseRepository.findByTitleContaining(query);
    }

    public Course updateCourse(String id, Course updatedCourse, String instructorId) {
        Optional<Course> existingCourse = findCourseById(id);
        if (existingCourse.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = existingCourse.get();
        
        // Verify instructor owns the course
        if (!course.getInstructorId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to update this course");
        }

        // Update fields
        if (updatedCourse.getTitle() != null) {
            course.setTitle(updatedCourse.getTitle());
        }
        if (updatedCourse.getDescription() != null) {
            course.setDescription(updatedCourse.getDescription());
        }
        if (updatedCourse.getCategory() != null) {
            course.setCategory(updatedCourse.getCategory());
        }
        if (updatedCourse.getDifficulty() != null) {
            course.setDifficulty(updatedCourse.getDifficulty());
        }
        if (updatedCourse.getEstimatedHours() > 0) {
            course.setEstimatedHours(updatedCourse.getEstimatedHours());
        }
        if (updatedCourse.getVideoUrl() != null) {
            course.setVideoUrl(updatedCourse.getVideoUrl());
        }
        if (updatedCourse.getOutline() != null) {
            course.setOutline(updatedCourse.getOutline());
        }
        if (updatedCourse.getLessons() != null) {
            course.setLessons(updatedCourse.getLessons());
        }

        return courseRepository.save(course);
    }

    public void publishCourse(String id, String instructorId) {
        Optional<Course> courseOpt = findCourseById(id);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        // Verify instructor owns the course
        if (!course.getInstructorId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to publish this course");
        }

        course.setPublished(true);
        courseRepository.save(course);
    }

    public void unpublishCourse(String id, String instructorId) {
        Optional<Course> courseOpt = findCourseById(id);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        // Verify instructor owns the course
        if (!course.getInstructorId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to unpublish this course");
        }

        course.setPublished(false);
        courseRepository.save(course);
    }

    public void enrollStudent(String courseId, String studentId) {
        Optional<Course> courseOpt = findCourseById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        if (!course.isPublished()) {
            throw new RuntimeException("Cannot enroll in unpublished course");
        }

        if (!course.getEnrolledStudents().contains(studentId)) {
            course.getEnrolledStudents().add(studentId);
            course.setTotalEnrollments(course.getTotalEnrollments() + 1);
            courseRepository.save(course);
            
            // Add course to student's enrolled courses
            userService.enrollInCourse(Long.parseLong(studentId), courseId);
        }
    }

    public void unenrollStudent(String courseId, String studentId) {
        Optional<Course> courseOpt = findCourseById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.getEnrolledStudents().remove(studentId);
            course.setTotalEnrollments(Math.max(0, course.getTotalEnrollments() - 1));
            courseRepository.save(course);
            
            // Remove course from student's enrolled courses
            userService.unenrollFromCourse(Long.parseLong(studentId), courseId);
        }
    }

    public String uploadMaterial(String courseId, MultipartFile file, String instructorId) throws IOException {
        Optional<Course> courseOpt = findCourseById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        // Verify instructor owns the course
        if (!course.getInstructorId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to upload materials for this course");
        }

        // Create course directory
        Path courseDir = Paths.get(uploadsPath, "courses", courseId);
        Files.createDirectories(courseDir);

        // Save file
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = courseDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Add to course materials
        String relativePath = "courses/" + courseId + "/" + fileName;
        course.getMaterials().add(relativePath);
        courseRepository.save(course);

        return relativePath;
    }

    public void generateCourseSummary(String courseId, String instructorId) {
        Optional<Course> courseOpt = findCourseById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        // Verify instructor owns the course
        if (!course.getInstructorId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to generate summary for this course");
        }

        // Build content for AI summarization
        StringBuilder content = new StringBuilder();
        content.append("Course Title: ").append(course.getTitle()).append("\n");
        content.append("Description: ").append(course.getDescription()).append("\n");
        if (course.getOutline() != null) {
            content.append("Outline: ").append(course.getOutline()).append("\n");
        }
        
        // Add lesson content
        if (course.getLessons() != null) {
            content.append("Lessons:\n");
            for (Course.Lesson lesson : course.getLessons()) {
                content.append("- ").append(lesson.getTitle()).append(": ").append(lesson.getContent()).append("\n");
            }
        }

        // Generate summary using AI
        String summary = geminiService.generateCourseSummary(content.toString());
        course.setSummary(summary);
        courseRepository.save(course);
    }

    public void addReview(String courseId, String studentId, int rating, String comment) {
        Optional<Course> courseOpt = findCourseById(courseId);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        // Verify student is enrolled
        if (!course.getEnrolledStudents().contains(studentId)) {
            throw new RuntimeException("Student not enrolled in this course");
        }

        Optional<User> student = userService.findById(Long.parseLong(studentId));
        if (student.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        Course.Review review = new Course.Review();
        review.setStudentId(studentId);
        review.setStudentName(student.get().getFullName());
        review.setRating(rating);
        review.setComment(comment);

        course.getReviews().add(review);
        
        // Update average rating
        double averageRating = course.getReviews().stream()
                .mapToInt(Course.Review::getRating)
                .average()
                .orElse(0.0);
        course.setAverageRating(averageRating);
        
        courseRepository.save(course);
    }

    public void deleteCourse(String id, String instructorId) {
        Optional<Course> courseOpt = findCourseById(id);
        if (courseOpt.isEmpty()) {
            throw new RuntimeException("Course not found");
        }

        Course course = courseOpt.get();
        
        // Verify instructor owns the course
        if (!course.getInstructorId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to delete this course");
        }

        // Remove from instructor's created courses
        userService.removeCreatedCourse(Long.parseLong(instructorId), id);

        // Unenroll all students
        for (String studentId : course.getEnrolledStudents()) {
            userService.unenrollFromCourse(Long.parseLong(studentId), id);
        }

        try {
            courseRepository.deleteById(Long.parseLong(id));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid course ID format");
        }
    }

    public long getTotalCourses() {
        return courseRepository.count();
    }

    public long getPublishedCoursesCount() {
        return courseRepository.countByPublishedTrue();
    }

    public long getCoursesByInstructor(String instructorId) {
        return courseRepository.countByInstructorId(instructorId);
    }

    public Course save(Course course) {
        return courseRepository.save(course);
    }
}
