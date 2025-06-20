package com.learningplatform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CodeforcesService {

    @Value("${codeforces.api.key}")
    private String apiKey;

    @Value("${codeforces.api.secret}")
    private String apiSecret;

    @Value("${codeforces.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public CodeforcesService() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get programming problems from Codeforces based on difficulty and tags
     */
    public List<Map<String, Object>> getProblems(String difficulty, List<String> tags, int limit) {
        try {
            System.out.println("🔍 Fetching Codeforces problems - Difficulty: " + difficulty + ", Tags: " + tags);
            
            // Build API URL for problemset.problems
            String method = "problemset.problems";
            Map<String, String> params = new HashMap<>();
            
            if (tags != null && !tags.isEmpty()) {
                params.put("tags", String.join(";", tags));
            }
            
            // Use public API without authentication
            String apiCall = apiUrl + "/" + method;
            if (!params.isEmpty()) {
                apiCall += "?" + params.entrySet().stream()
                    .map(entry -> entry.getKey() + "=" + entry.getValue())
                    .reduce((a, b) -> a + "&" + b)
                    .orElse("");
            }
            System.out.println("📡 API Call: " + apiCall);
            
            String response = webClient.get()
                    .uri(apiCall)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseProblemsResponse(response, difficulty, limit);
        } catch (Exception e) {
            System.err.println("❌ Error fetching Codeforces problems: " + e.getMessage());
            return getFallbackProblems(difficulty, limit);
        }
    }

    /**
     * Get contest information
     */
    public List<Map<String, Object>> getContests(boolean gym) {
        try {
            String method = "contest.list";
            Map<String, String> params = new HashMap<>();
            params.put("gym", String.valueOf(gym));
            
            String apiCall = buildApiCall(method, params);
            
            String response = webClient.get()
                    .uri(apiCall)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseContestsResponse(response);
        } catch (Exception e) {
            System.err.println("❌ Error fetching Codeforces contests: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Get user information
     */
    public Map<String, Object> getUserInfo(String handle) {
        try {
            String method = "user.info";
            Map<String, String> params = new HashMap<>();
            params.put("handles", handle);
            
            String apiCall = buildApiCall(method, params);
            
            String response = webClient.get()
                    .uri(apiCall)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseUserResponse(response);
        } catch (Exception e) {
            System.err.println("❌ Error fetching user info: " + e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * Get problems by difficulty level for assignments
     */
    public List<Map<String, Object>> getProblemsByDifficulty(String difficulty, String topic, int count) {
        List<String> tags = getTagsForTopic(topic);
        return getProblems(difficulty, tags, count);
    }

    private String buildApiCall(String method, Map<String, String> params) {
        long time = Instant.now().getEpochSecond();
        String rand = String.format("%06d", new Random().nextInt(100000));

        // Add required parameters
        params.put("apiKey", apiKey);
        params.put("time", String.valueOf(time));

        // Sort parameters
        List<String> sortedKeys = new ArrayList<>(params.keySet());
        Collections.sort(sortedKeys);

        // Build query string for signature (without URL encoding)
        StringBuilder queryBuilder = new StringBuilder();
        for (String key : sortedKeys) {
            if (queryBuilder.length() > 0) {
                queryBuilder.append("&");
            }
            queryBuilder.append(key).append("=").append(params.get(key));
        }

        // Create signature according to Codeforces API specification
        String toHash = rand + "/" + method + "?" + queryBuilder.toString() + "#" + apiSecret;
        String hash = sha512(toHash);
        String apiSig = rand + hash;

        // Build final URL with proper encoding
        StringBuilder urlBuilder = new StringBuilder(apiUrl + "/" + method + "?");
        for (String key : sortedKeys) {
            if (!urlBuilder.toString().endsWith("?")) {
                urlBuilder.append("&");
            }
            try {
                urlBuilder.append(key).append("=").append(java.net.URLEncoder.encode(params.get(key), "UTF-8"));
            } catch (Exception e) {
                urlBuilder.append(key).append("=").append(params.get(key));
            }
        }
        urlBuilder.append("&apiSig=").append(apiSig);

        return urlBuilder.toString();
    }

    private String sha512(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] hash = md.digest(input.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error creating SHA-512 hash", e);
        }
    }

    private List<Map<String, Object>> parseProblemsResponse(String response, String difficulty, int limit) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            if (!"OK".equals(root.get("status").asText())) {
                throw new RuntimeException("API returned error: " + root.get("comment").asText());
            }
            
            JsonNode result = root.get("result");
            JsonNode problems = result.get("problems");
            JsonNode problemStatistics = result.get("problemStatistics");
            
            List<Map<String, Object>> filteredProblems = new ArrayList<>();
            
            for (int i = 0; i < problems.size() && filteredProblems.size() < limit; i++) {
                JsonNode problem = problems.get(i);
                JsonNode stats = problemStatistics.get(i);
                
                // Filter by difficulty if specified
                if (difficulty != null && !difficulty.isEmpty()) {
                    if (!matchesDifficulty(problem, stats, difficulty)) {
                        continue;
                    }
                }
                
                Map<String, Object> problemMap = new HashMap<>();
                problemMap.put("contestId", problem.get("contestId").asInt());
                problemMap.put("index", problem.get("index").asText());
                problemMap.put("name", problem.get("name").asText());
                problemMap.put("type", problem.get("type").asText());
                problemMap.put("rating", problem.has("rating") ? problem.get("rating").asInt() : null);
                problemMap.put("tags", getTagsList(problem.get("tags")));
                problemMap.put("solvedCount", stats.get("solvedCount").asInt());
                problemMap.put("url", "https://codeforces.com/problemset/problem/" + 
                                    problem.get("contestId").asInt() + "/" + problem.get("index").asText());
                
                filteredProblems.add(problemMap);
            }
            
            System.out.println("✅ Parsed " + filteredProblems.size() + " problems from Codeforces");
            return filteredProblems;
            
        } catch (Exception e) {
            System.err.println("❌ Error parsing problems response: " + e.getMessage());
            return getFallbackProblems(difficulty, limit);
        }
    }

    private boolean matchesDifficulty(JsonNode problem, JsonNode stats, String difficulty) {
        if (!problem.has("rating")) {
            return false;
        }
        
        int rating = problem.get("rating").asInt();
        
        switch (difficulty.toUpperCase()) {
            case "EASY":
            case "BEGINNER":
                return rating >= 800 && rating <= 1200;
            case "MEDIUM":
            case "INTERMEDIATE":
                return rating >= 1200 && rating <= 1600;
            case "HARD":
            case "ADVANCED":
                return rating >= 1600 && rating <= 2100;
            case "EXPERT":
                return rating >= 2100;
            default:
                return true;
        }
    }

    private List<String> getTagsList(JsonNode tagsNode) {
        List<String> tags = new ArrayList<>();
        if (tagsNode.isArray()) {
            for (JsonNode tag : tagsNode) {
                tags.add(tag.asText());
            }
        }
        return tags;
    }

    private List<String> getTagsForTopic(String topic) {
        if (topic == null) return new ArrayList<>();
        
        String lowerTopic = topic.toLowerCase();
        List<String> tags = new ArrayList<>();
        
        if (lowerTopic.contains("algorithm") || lowerTopic.contains("sorting")) {
            tags.add("sortings");
        }
        if (lowerTopic.contains("graph")) {
            tags.add("graphs");
        }
        if (lowerTopic.contains("dynamic") || lowerTopic.contains("dp")) {
            tags.add("dp");
        }
        if (lowerTopic.contains("string")) {
            tags.add("strings");
        }
        if (lowerTopic.contains("math")) {
            tags.add("math");
        }
        if (lowerTopic.contains("greedy")) {
            tags.add("greedy");
        }
        if (lowerTopic.contains("implementation")) {
            tags.add("implementation");
        }
        
        return tags;
    }

    private List<Map<String, Object>> parseContestsResponse(String response) {
        // Implementation for parsing contests
        return new ArrayList<>();
    }

    private Map<String, Object> parseUserResponse(String response) {
        // Implementation for parsing user info
        return new HashMap<>();
    }

    private List<Map<String, Object>> getFallbackProblems(String difficulty, int limit) {
        List<Map<String, Object>> fallbackProblems = new ArrayList<>();
        
        for (int i = 1; i <= Math.min(limit, 5); i++) {
            Map<String, Object> problem = new HashMap<>();
            problem.put("contestId", 1000 + i);
            problem.put("index", "A");
            problem.put("name", "Sample Problem " + i + " (" + difficulty + ")");
            problem.put("type", "PROGRAMMING");
            problem.put("rating", getDifficultyRating(difficulty));
            problem.put("tags", Arrays.asList("implementation", "math"));
            problem.put("solvedCount", 1000 + i * 100);
            problem.put("url", "https://codeforces.com/problemset/problem/" + (1000 + i) + "/A");
            
            fallbackProblems.add(problem);
        }
        
        return fallbackProblems;
    }

    private int getDifficultyRating(String difficulty) {
        switch (difficulty.toUpperCase()) {
            case "EASY":
            case "BEGINNER":
                return 1000;
            case "MEDIUM":
            case "INTERMEDIATE":
                return 1400;
            case "HARD":
            case "ADVANCED":
                return 1800;
            case "EXPERT":
                return 2200;
            default:
                return 1200;
        }
    }
}
