package com.learningplatform.controller;

import com.learningplatform.service.CodeforcesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/codeforces")
@CrossOrigin(origins = "*")
public class CodeforcesController {

    @Autowired
    private CodeforcesService codeforcesService;

    /**
     * Get programming problems for assignments
     */
    @GetMapping("/problems")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getProblems(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String tags,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            System.out.println("🔍 Fetching Codeforces problems - Difficulty: " + difficulty + ", Tags: " + tags + ", Limit: " + limit);
            
            List<String> tagList = null;
            if (tags != null && !tags.trim().isEmpty()) {
                tagList = Arrays.asList(tags.split(","));
            }
            
            List<Map<String, Object>> problems = codeforcesService.getProblems(difficulty, tagList, limit);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "problems", problems,
                "count", problems.size(),
                "message", "Successfully fetched " + problems.size() + " problems from Codeforces"
            ));
        } catch (Exception e) {
            System.err.println("❌ Error in CodeforcesController.getProblems: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to fetch problems: " + e.getMessage()
            ));
        }
    }

    /**
     * Get problems by difficulty for course assignments
     */
    @GetMapping("/problems/by-difficulty")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getProblemsByDifficulty(
            @RequestParam String difficulty,
            @RequestParam(required = false) String topic,
            @RequestParam(defaultValue = "5") int count) {
        try {
            System.out.println("🎯 Fetching problems by difficulty - Difficulty: " + difficulty + ", Topic: " + topic + ", Count: " + count);
            
            List<Map<String, Object>> problems = codeforcesService.getProblemsByDifficulty(difficulty, topic, count);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "problems", problems,
                "difficulty", difficulty,
                "topic", topic != null ? topic : "general",
                "count", problems.size()
            ));
        } catch (Exception e) {
            System.err.println("❌ Error fetching problems by difficulty: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to fetch problems by difficulty: " + e.getMessage()
            ));
        }
    }

    /**
     * Get contests information
     */
    @GetMapping("/contests")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getContests(@RequestParam(defaultValue = "false") boolean gym) {
        try {
            System.out.println("🏆 Fetching Codeforces contests - Gym: " + gym);
            
            List<Map<String, Object>> contests = codeforcesService.getContests(gym);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "contests", contests,
                "count", contests.size()
            ));
        } catch (Exception e) {
            System.err.println("❌ Error fetching contests: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to fetch contests: " + e.getMessage()
            ));
        }
    }

    /**
     * Get user information
     */
    @GetMapping("/user/{handle}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserInfo(@PathVariable String handle) {
        try {
            System.out.println("👤 Fetching user info for handle: " + handle);
            
            Map<String, Object> userInfo = codeforcesService.getUserInfo(handle);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", userInfo
            ));
        } catch (Exception e) {
            System.err.println("❌ Error fetching user info: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to fetch user info: " + e.getMessage()
            ));
        }
    }

    /**
     * Get available problem tags
     */
    @GetMapping("/tags")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getAvailableTags() {
        try {
            List<String> commonTags = Arrays.asList(
                "implementation", "math", "greedy", "dp", "data structures",
                "brute force", "constructive algorithms", "graphs", "sortings",
                "binary search", "dfs and similar", "trees", "strings", "number theory",
                "combinatorics", "geometry", "bitmasks", "two pointers", "hashing"
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "tags", commonTags,
                "message", "Available problem tags for filtering"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to fetch tags: " + e.getMessage()
            ));
        }
    }

    /**
     * Test Codeforces API connection
     */
    @GetMapping("/test")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> testConnection() {
        try {
            System.out.println("🧪 Testing Codeforces API connection");
            
            // Try to fetch a small number of problems to test the connection
            List<Map<String, Object>> testProblems = codeforcesService.getProblems("EASY", null, 2);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Codeforces API connection is working!",
                "testProblems", testProblems.size(),
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            System.err.println("❌ Codeforces API test failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Codeforces API connection failed: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
}
