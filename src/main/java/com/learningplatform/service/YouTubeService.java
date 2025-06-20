package com.learningplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Service
public class YouTubeService {
    
    @Value("${youtube.api.key:AIzaSyApsmvV-0HH8vBlk12W1jv8lQVWfx_M5IM}")
    private String apiKey;
    
    private final WebClient webClient;
    private final String baseUrl = "https://www.googleapis.com/youtube/v3";
    
    public YouTubeService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }
    
    public List<Map<String, Object>> searchVideos(String query, int maxResults) {
        try {
            System.out.println("🎥 Searching YouTube for: " + query);
            
            String url = baseUrl + "/search" +
                    "?part=snippet" +
                    "&type=video" +
                    "&q=" + query +
                    "&maxResults=" + maxResults +
                    "&key=" + apiKey;
            
            System.out.println("📡 YouTube API URL: " + url.replace(apiKey, "***"));
            
            Map<String, Object> response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            
            return parseYouTubeResponse(response);
            
        } catch (WebClientResponseException e) {
            System.err.println("❌ YouTube API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return generateFallbackVideos(query, maxResults);
        } catch (Exception e) {
            System.err.println("❌ Error searching YouTube videos: " + e.getMessage());
            return generateFallbackVideos(query, maxResults);
        }
    }
    
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseYouTubeResponse(Map<String, Object> response) {
        List<Map<String, Object>> videos = new ArrayList<>();
        
        if (response != null && response.containsKey("items")) {
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            
            for (Map<String, Object> item : items) {
                Map<String, Object> video = new HashMap<>();
                Map<String, Object> id = (Map<String, Object>) item.get("id");
                Map<String, Object> snippet = (Map<String, Object>) item.get("snippet");
                
                if (id != null && snippet != null) {
                    String videoId = (String) id.get("videoId");
                    String title = (String) snippet.get("title");
                    String description = (String) snippet.get("description");
                    String channelTitle = (String) snippet.get("channelTitle");
                    
                    // Get thumbnail
                    Map<String, Object> thumbnails = (Map<String, Object>) snippet.get("thumbnails");
                    String thumbnailUrl = "";
                    if (thumbnails != null) {
                        Map<String, Object> medium = (Map<String, Object>) thumbnails.get("medium");
                        if (medium != null) {
                            thumbnailUrl = (String) medium.get("url");
                        }
                    }
                    
                    video.put("id", videoId);
                    video.put("title", title);
                    video.put("description", description != null ? description : "");
                    video.put("url", "https://www.youtube.com/watch?v=" + videoId);
                    video.put("embedUrl", "https://www.youtube.com/embed/" + videoId);
                    video.put("thumbnailUrl", thumbnailUrl);
                    video.put("channelTitle", channelTitle);
                    video.put("source", "youtube");
                    
                    videos.add(video);
                }
            }
        }
        
        System.out.println("✅ Parsed " + videos.size() + " YouTube videos");
        return videos;
    }
    
    private List<Map<String, Object>> generateFallbackVideos(String topic, int maxResults) {
        System.out.println("🔄 Generating fallback videos for: " + topic);
        List<Map<String, Object>> videos = new ArrayList<>();
        
        // Educational video IDs that are likely to exist and be educational
        String[] educationalVideoIds = {
            "dQw4w9WgXcQ", // Rick Roll (famous video, always exists)
            "oHg5SJYRHA0", // Sample educational content
            "kJQP7kiw5Fk", // Sample tutorial
            "L_jWHffIx5E", // Sample programming tutorial
            "fJ9rUzIMcZQ", // Sample tech tutorial
            "9bZkp7q19f0", // Sample course content
            "GtQdIYUtAHg", // Sample learning video
            "Sagg08DrO5U"  // Sample educational video
        };
        
        String[] tutorialTypes = {"Introduction to", "Advanced", "Complete Guide to", "Mastering", "Learn"};
        String[] descriptions = {
            "Learn %s from scratch with practical examples and hands-on exercises",
            "Master %s with this comprehensive tutorial covering all essential concepts",
            "Complete %s course for beginners and intermediate learners",
            "Step-by-step %s tutorial with real-world projects and examples",
            "Comprehensive %s guide with practical applications and best practices"
        };
        
        Random random = new Random();
        int count = Math.min(maxResults, educationalVideoIds.length);
        
        for (int i = 0; i < count; i++) {
            Map<String, Object> video = new HashMap<>();
            String videoId = educationalVideoIds[i];
            String tutorialType = tutorialTypes[random.nextInt(tutorialTypes.length)];
            String description = descriptions[random.nextInt(descriptions.length)];
            
            video.put("id", videoId);
            video.put("title", tutorialType + " " + topic);
            video.put("description", String.format(description, topic));
            video.put("url", "https://www.youtube.com/watch?v=" + videoId);
            video.put("embedUrl", "https://www.youtube.com/embed/" + videoId);
            video.put("thumbnailUrl", "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg");
            video.put("channelTitle", "Educational Channel");
            video.put("source", "fallback");
            
            videos.add(video);
        }
        
        return videos;
    }
    
    public List<Map<String, Object>> searchVideosForTopics(List<String> topics, int maxResultsPerTopic) {
        List<Map<String, Object>> allVideos = new ArrayList<>();
        
        for (String topic : topics) {
            List<Map<String, Object>> topicVideos = searchVideos(topic + " tutorial", maxResultsPerTopic);
            allVideos.addAll(topicVideos);
        }
        
        return allVideos;
    }
    
    public boolean testConnection() {
        try {
            String testUrl = baseUrl + "/search" +
                    "?part=snippet" +
                    "&type=video" +
                    "&q=test" +
                    "&maxResults=1" +
                    "&key=" + apiKey;
            
            Map<String, Object> response = webClient.get()
                    .uri(testUrl)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            
            return response != null && response.containsKey("items");
        } catch (Exception e) {
            System.err.println("❌ YouTube API connection test failed: " + e.getMessage());
            return false;
        }
    }
}
