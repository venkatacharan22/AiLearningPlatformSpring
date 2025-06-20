package com.learningplatform.controller;

import com.learningplatform.model.Assignment;
import com.learningplatform.model.AssignmentSubmission;
import com.learningplatform.model.Course;
import com.learningplatform.model.Course;
import com.learningplatform.service.AssignmentService;
import com.learningplatform.service.CourseService;
import com.learningplatform.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private SubmissionService submissionService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable String courseId, HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            List<Assignment> assignments;

            // If user is instructor and owns the course, show all assignments (published and unpublished)
            if ("INSTRUCTOR".equals(userRole) || "ADMIN".equals(userRole)) {
                // Verify instructor owns the course
                Optional<Course> courseOpt = courseService.findById(courseId);
                if (courseOpt.isPresent() && courseOpt.get().getInstructorId().equals(userId)) {
                    assignments = assignmentService.findAllByCourseId(courseId);
                } else {
                    // If instructor doesn't own the course, show only published
                    assignments = assignmentService.findByCourseId(courseId);
                }
            } else {
                // For students and others, show only published assignments
                assignments = assignmentService.findByCourseId(courseId);
            }

            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            // Fallback to published assignments only
            List<Assignment> assignments = assignmentService.findByCourseId(courseId);
            return ResponseEntity.ok(assignments);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignment(@PathVariable Long id) {
        Optional<Assignment> assignment = assignmentService.findById(id);
        return assignment.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createAssignment(@RequestBody AssignmentCreateRequest request, 
                                            HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            
            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(request.getCourseId());
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            Assignment assignment = new Assignment();
            assignment.setTitle(request.getTitle());
            assignment.setDescription(request.getDescription());
            assignment.setCourseId(request.getCourseId());
            assignment.setInstructorId(instructorId);
            assignment.setType(request.getType());
            assignment.setDifficulty(request.getDifficulty());
            assignment.setProblemStatement(request.getProblemStatement());
            assignment.setConstraints(request.getConstraints());
            assignment.setProgrammingLanguage(request.getProgrammingLanguage());
            assignment.setTimeLimit(request.getTimeLimit());
            assignment.setPoints(request.getPoints());
            assignment.setDueDate(request.getDueDate());

            Assignment savedAssignment = assignmentService.createAssignment(assignment);
            return ResponseEntity.ok(savedAssignment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> generateCodingAssignment(@RequestBody GenerateAssignmentRequest request,
                                                    HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            
            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(request.getCourseId());
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            Assignment assignment = assignmentService.generateCodingAssignment(
                course.getTitle(),
                request.getTopic(),
                request.getDifficulty(),
                request.getProgrammingLanguage()
            );
            
            assignment.setCourseId(request.getCourseId());
            assignment.setInstructorId(instructorId);
            
            Assignment savedAssignment = assignmentService.createAssignment(assignment);

            // Auto-publish AI-generated assignments for better student experience
            if (savedAssignment.isAiGenerated()) {
                savedAssignment = assignmentService.publishAssignment(savedAssignment.getId());
            }

            return ResponseEntity.ok(Map.of(
                "message", "Coding assignment generated and published successfully",
                "assignment", savedAssignment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate assignment: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> publishAssignment(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            
            Optional<Assignment> assignmentOpt = assignmentService.findById(id);
            if (assignmentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Assignment assignment = assignmentOpt.get();
            if (!assignment.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized"));
            }

            Assignment publishedAssignment = assignmentService.publishAssignment(id);
            return ResponseEntity.ok(Map.of(
                "message", "Assignment published successfully",
                "assignment", publishedAssignment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> unpublishAssignment(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            
            Optional<Assignment> assignmentOpt = assignmentService.findById(id);
            if (assignmentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Assignment assignment = assignmentOpt.get();
            if (!assignment.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized"));
            }

            Assignment unpublishedAssignment = assignmentService.unpublishAssignment(id);
            return ResponseEntity.ok(Map.of(
                "message", "Assignment unpublished successfully",
                "assignment", unpublishedAssignment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            
            Optional<Assignment> assignmentOpt = assignmentService.findById(id);
            if (assignmentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Assignment assignment = assignmentOpt.get();
            if (!assignment.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized"));
            }

            assignmentService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/instructor/my-assignments")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getMyAssignments(HttpServletRequest httpRequest) {
        String instructorId = (String) httpRequest.getAttribute("userId");
        List<Assignment> assignments = assignmentService.findByInstructorId(instructorId);
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> submitAssignment(@PathVariable Long id,
                                            @RequestBody AssignmentSubmissionRequest request,
                                            HttpServletRequest httpRequest) {
        try {
            String studentId = (String) httpRequest.getAttribute("userId");

            // Convert test results to proper format
            List<AssignmentSubmission.TestResult> testResults = new java.util.ArrayList<>();
            if (request.getTestResults() != null) {
                for (int i = 0; i < request.getTestResults().size(); i++) {
                    boolean passed = request.getTestResults().get(i);
                    testResults.add(new AssignmentSubmission.TestResult(
                        "test_" + i,
                        passed,
                        passed ? "Correct" : "Incorrect",
                        "Expected output"
                    ));
                }
            }

            AssignmentSubmission submission = submissionService.submitAssignment(
                id, studentId, request.getCode(), request.getTimeSpent(), testResults
            );

            return ResponseEntity.ok(Map.of(
                "submissionId", submission.getId(),
                "score", submission.getScore(),
                "maxScore", submission.getMaxScore(),
                "passed", submission.isPassed(),
                "attemptNumber", submission.getAttemptNumber(),
                "feedback", submission.getFeedback(),
                "message", submission.isPassed() ?
                    "Great job! Assignment completed successfully!" :
                    "Good effort! Keep practicing!"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private int calculateScore(Assignment assignment, AssignmentSubmissionRequest request) {
        // Simple scoring logic - in production, this would involve code execution and testing
        if (assignment.getType() == Assignment.AssignmentType.CODING) {
            // For coding assignments, simulate test case results
            int totalTests = assignment.getTestCases() != null ? assignment.getTestCases().size() : 5;
            int passedTests = request.getTestResults() != null ?
                (int) request.getTestResults().stream().mapToInt(result -> result ? 1 : 0).sum() :
                (int) (totalTests * 0.8); // 80% pass rate for demo

            return (passedTests * assignment.getPoints()) / totalTests;
        }

        // For other assignment types, return a default score
        return (int) (assignment.getPoints() * 0.85); // 85% for demo
    }

    // Request DTOs
    public static class AssignmentCreateRequest {
        private String title;
        private String description;
        private String courseId;
        private Assignment.AssignmentType type;
        private Assignment.Difficulty difficulty;
        private String problemStatement;
        private String constraints;
        private String programmingLanguage;
        private int timeLimit;
        private int points;
        private java.time.LocalDateTime dueDate;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCourseId() { return courseId; }
        public void setCourseId(String courseId) { this.courseId = courseId; }

        public Assignment.AssignmentType getType() { return type; }
        public void setType(Assignment.AssignmentType type) { this.type = type; }

        public Assignment.Difficulty getDifficulty() { return difficulty; }
        public void setDifficulty(Assignment.Difficulty difficulty) { this.difficulty = difficulty; }

        public String getProblemStatement() { return problemStatement; }
        public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

        public String getConstraints() { return constraints; }
        public void setConstraints(String constraints) { this.constraints = constraints; }

        public String getProgrammingLanguage() { return programmingLanguage; }
        public void setProgrammingLanguage(String programmingLanguage) { this.programmingLanguage = programmingLanguage; }

        public int getTimeLimit() { return timeLimit; }
        public void setTimeLimit(int timeLimit) { this.timeLimit = timeLimit; }

        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }

        public java.time.LocalDateTime getDueDate() { return dueDate; }
        public void setDueDate(java.time.LocalDateTime dueDate) { this.dueDate = dueDate; }
    }

    public static class GenerateAssignmentRequest {
        private String courseId;
        private String topic;
        private Assignment.Difficulty difficulty;
        private String programmingLanguage;
        private Integer problemCount;

        // Getters and Setters
        public String getCourseId() { return courseId; }
        public void setCourseId(String courseId) { this.courseId = courseId; }

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }

        public Assignment.Difficulty getDifficulty() { return difficulty; }
        public void setDifficulty(Assignment.Difficulty difficulty) { this.difficulty = difficulty; }

        public String getProgrammingLanguage() { return programmingLanguage; }
        public void setProgrammingLanguage(String programmingLanguage) { this.programmingLanguage = programmingLanguage; }

        public Integer getProblemCount() { return problemCount; }
        public void setProblemCount(Integer problemCount) { this.problemCount = problemCount; }
    }

    public static class AssignmentSubmissionRequest {
        private String code;
        private int timeSpent;
        private int attempts;
        private java.util.List<Boolean> testResults;

        // Getters and Setters
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public int getTimeSpent() { return timeSpent; }
        public void setTimeSpent(int timeSpent) { this.timeSpent = timeSpent; }

        public int getAttempts() { return attempts; }
        public void setAttempts(int attempts) { this.attempts = attempts; }

        public java.util.List<Boolean> getTestResults() { return testResults; }
        public void setTestResults(java.util.List<Boolean> testResults) { this.testResults = testResults; }
    }

    @PostMapping("/generate-with-codeforces")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> generateAssignmentWithCodeforces(@RequestBody GenerateAssignmentRequest request,
                                                            HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");

            // Verify instructor owns the course
            Optional<Course> courseOpt = courseService.findById(request.getCourseId());
            if (courseOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
            }

            Course course = courseOpt.get();
            if (!course.getInstructorId().equals(instructorId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized: You don't own this course"));
            }

            Assignment assignment = assignmentService.generateAssignmentWithCodeforcesProblems(
                course.getTitle(),
                request.getTopic(),
                request.getDifficulty(),
                request.getProgrammingLanguage(),
                request.getProblemCount() != null ? request.getProblemCount() : 3
            );

            assignment.setCourseId(request.getCourseId());
            assignment.setInstructorId(instructorId);

            Assignment savedAssignment = assignmentService.createAssignment(assignment);

            // Auto-publish Codeforces assignments for better student experience
            savedAssignment = assignmentService.publishAssignment(savedAssignment.getId());

            return ResponseEntity.ok(Map.of(
                "message", "Assignment with Codeforces problems generated and published successfully",
                "assignment", savedAssignment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate assignment: " + e.getMessage()));
        }
    }

    @GetMapping("/codeforces-problems")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getAvailableCodeforcesProblems(
            @RequestParam String difficulty,
            @RequestParam(required = false) String topic,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> problems = assignmentService.getAvailableCodeforcesProblems(difficulty, topic, limit);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "problems", problems,
                "count", problems.size(),
                "difficulty", difficulty,
                "topic", topic != null ? topic : "general"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to fetch Codeforces problems: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/create-skipped")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createSkippedAssignment(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        try {
            String instructorId = (String) httpRequest.getAttribute("userId");
            if (instructorId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }

            // Create a skipped assignment placeholder
            Assignment assignment = new Assignment();
            assignment.setCourseId((String) request.get("courseId"));
            assignment.setInstructorId(instructorId);
            assignment.setTitle((String) request.get("title"));
            assignment.setDescription((String) request.get("description"));
            assignment.setType(Assignment.AssignmentType.valueOf((String) request.get("type")));
            assignment.setDifficulty(Assignment.Difficulty.valueOf((String) request.get("difficulty")));
            assignment.setSource(Assignment.AssignmentSource.SKIPPED);
            assignment.setPublished(true); // Publish so students can see it was skipped
            assignment.setPoints(0); // No points for skipped assignments
            assignment.setTimeLimit(0);
            assignment.setMaxAttempts(0);

            Assignment savedAssignment = assignmentService.createAssignment(assignment);

            return ResponseEntity.ok(Map.of(
                "message", "Skipped assignment placeholder created successfully",
                "assignment", savedAssignment
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
