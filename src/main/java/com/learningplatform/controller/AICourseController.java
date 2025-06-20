package com.learningplatform.controller;

import com.learningplatform.service.AICourseGenerationService;
import com.learningplatform.service.YouTubeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AICourseController {

    @Autowired
    private AICourseGenerationService aiCourseGenerationService;

    @Autowired
    private YouTubeService youTubeService;

    @PostMapping("/generate-ai-course")
    public ResponseEntity<?> generateAICourse(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("🚀 AI Course Controller - Endpoint called!");
            System.out.println("📝 Request body: " + request);

            String topic = (String) request.get("topic");
            String difficulty = (String) request.getOrDefault("difficulty", "INTERMEDIATE");

            System.out.println("📋 Parsed - Topic: " + topic + ", Difficulty: " + difficulty);

            if (topic == null || topic.trim().isEmpty()) {
                System.out.println("❌ Topic is null or empty");
                return ResponseEntity.badRequest().body(Map.of("error", "Topic is required"));
            }

            System.out.println("🤖 Generating AI course for topic: " + topic);

            // Use the actual AI course generation service
            Map<String, Object> courseData = aiCourseGenerationService.generateCourse(topic, difficulty);

            System.out.println("✅ AI course generated successfully");
            System.out.println("📚 Course title: " + courseData.get("title"));
            System.out.println("📝 Course lessons: " + ((List<?>) courseData.get("lessons")).size());
            System.out.println("🔍 Course data: " + courseData);

            return ResponseEntity.ok(courseData);
        } catch (Exception e) {
            System.err.println("❌ Error generating AI course: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate course: " + e.getMessage()));
        }
    }

    @PostMapping("/find-youtube-videos")
    public ResponseEntity<?> findYouTubeVideos(@RequestBody Map<String, Object> request) {
        try {
            String courseTitle = (String) request.get("courseTitle");
            @SuppressWarnings("unchecked")
            List<String> topics = (List<String>) request.get("topics");

            if (courseTitle == null || topics == null || topics.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course title and topics are required"));
            }

            System.out.println("🎥 Finding YouTube videos for course: " + courseTitle);
            System.out.println("📚 Topics: " + topics);

            // Use the AI service which now integrates with real YouTube API
            List<Map<String, Object>> videos = aiCourseGenerationService.findYouTubeVideos(courseTitle, topics);

            System.out.println("✅ Found " + videos.size() + " YouTube videos");

            return ResponseEntity.ok(videos);
        } catch (Exception e) {
            System.err.println("❌ Error finding YouTube videos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to find videos: " + e.getMessage()));
        }
    }

    @GetMapping("/youtube/test")
    public ResponseEntity<?> testYouTubeAPI() {
        try {
            System.out.println("🧪 Testing YouTube API connection...");
            boolean isConnected = youTubeService.testConnection();

            if (isConnected) {
                // Test search with a simple query
                List<Map<String, Object>> testVideos = youTubeService.searchVideos("programming tutorial", 3);

                return ResponseEntity.ok(Map.of(
                    "status", "YouTube API is working!",
                    "connected", true,
                    "testVideos", testVideos.size(),
                    "timestamp", System.currentTimeMillis(),
                    "message", "Successfully connected to YouTube API and found " + testVideos.size() + " videos"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "status", "YouTube API connection failed",
                    "connected", false,
                    "timestamp", System.currentTimeMillis(),
                    "message", "YouTube API is not accessible, using fallback videos"
                ));
            }
        } catch (Exception e) {
            System.err.println("❌ Error testing YouTube API: " + e.getMessage());
            return ResponseEntity.ok(Map.of(
                "status", "YouTube API test failed",
                "connected", false,
                "error", e.getMessage(),
                "timestamp", System.currentTimeMillis(),
                "message", "YouTube API test failed, using fallback videos"
            ));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testAI() {
        return ResponseEntity.ok(Map.of(
            "status", "AI Course Generation Service is working!",
            "timestamp", System.currentTimeMillis(),
            "message", "AI endpoints are accessible and working correctly!"
        ));
    }
}
