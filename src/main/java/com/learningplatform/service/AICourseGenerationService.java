package com.learningplatform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AICourseGenerationService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private YouTubeService youTubeService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> generateCourse(String topic, String difficulty) {
        try {
            // Use AI to generate course content
            Map<String, Object> course = generateAICourse(topic, difficulty);

            // Generate detailed lesson explanations for all lessons
            generateLessonExplanations(course, topic, difficulty);

            return course;
        } catch (Exception e) {
            System.err.println("❌ AI course generation failed, using fallback: " + e.getMessage());
            // Fallback to structured course generation
            Map<String, Object> fallbackCourse = generateFallbackCourse(topic, difficulty);

            // Still try to generate lesson explanations for fallback course
            try {
                generateLessonExplanations(fallbackCourse, topic, difficulty);
            } catch (Exception explanationError) {
                System.err.println("⚠️ Failed to generate lesson explanations for fallback course: " + explanationError.getMessage());
            }

            return fallbackCourse;
        }
    }

    private Map<String, Object> generateAICourse(String topic, String difficulty) {
        String prompt = String.format(
            "IMPORTANT: You must respond with ONLY valid JSON. No additional text, explanations, or markdown formatting.\n\n" +
            "Create a comprehensive course structure for the topic '%s' at %s difficulty level. " +
            "Return ONLY the JSON response with this exact structure:\n\n" +
            "{\n" +
            "  \"title\": \"engaging and descriptive course title\",\n" +
            "  \"description\": \"2-3 sentence course description\",\n" +
            "  \"category\": \"choose from: Programming, Web Development, Data Science, Machine Learning, DevOps, Mobile Development\",\n" +
            "  \"difficulty\": \"%s\",\n" +
            "  \"estimatedHours\": realistic_number,\n" +
            "  \"outline\": \"brief course overview\",\n" +
            "  \"summary\": \"key takeaways summary\",\n" +
            "  \"lessons\": [\n" +
            "    {\n" +
            "      \"title\": \"lesson title\",\n" +
            "      \"content\": \"lesson content description\",\n" +
            "      \"durationMinutes\": duration_in_minutes\n" +
            "    }\n" +
            "  ]\n" +
            "}\n\n" +
            "Generate 5-8 lessons that are practical, engaging, and suitable for %s level learners. " +
            "RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT.",
            topic, difficulty, difficulty.toUpperCase(), difficulty.toLowerCase()
        );

        try {
            System.out.println("🤖 Calling Gemini API for course generation...");
            String aiResponse = geminiService.generateCourseSummary(prompt);

            if (aiResponse != null && !aiResponse.trim().isEmpty()) {
                return parseAIResponse(aiResponse, topic, difficulty);
            } else {
                System.out.println("⚠️ Empty AI response, falling back to structured generation");
                return generateStructuredCourse(topic, difficulty);
            }
        } catch (Exception e) {
            System.err.println("❌ AI generation failed: " + e.getMessage());
            System.out.println("🔄 Falling back to structured course generation");
            return generateStructuredCourse(topic, difficulty);
        }
    }

    private Map<String, Object> generateStructuredCourse(String topic, String difficulty) {
        Map<String, Object> course = new HashMap<>();
        
        // Generate course metadata based on topic
        String cleanTopic = topic.trim();
        String category = determineCategory(cleanTopic);
        
        course.put("title", generateCourseTitle(cleanTopic, difficulty));
        course.put("description", generateCourseDescription(cleanTopic, difficulty));
        course.put("category", category);
        course.put("difficulty", difficulty.toUpperCase());
        course.put("estimatedHours", estimateHours(cleanTopic, difficulty));
        course.put("outline", generateCourseOutline(cleanTopic));
        course.put("summary", generateCourseSummary(cleanTopic));
        
        // Generate lessons
        List<Map<String, Object>> lessons = generateLessons(cleanTopic, category, difficulty);
        course.put("lessons", lessons);
        
        return course;
    }

    private String determineCategory(String topic) {
        String lowerTopic = topic.toLowerCase();
        
        if (lowerTopic.contains("react") || lowerTopic.contains("vue") || lowerTopic.contains("angular") || 
            lowerTopic.contains("html") || lowerTopic.contains("css") || lowerTopic.contains("javascript") ||
            lowerTopic.contains("web") || lowerTopic.contains("frontend") || lowerTopic.contains("backend")) {
            return "Web Development";
        } else if (lowerTopic.contains("python") || lowerTopic.contains("java") || lowerTopic.contains("c++") ||
                   lowerTopic.contains("programming") || lowerTopic.contains("coding") || lowerTopic.contains("algorithm")) {
            return "Programming";
        } else if (lowerTopic.contains("data") || lowerTopic.contains("analytics") || lowerTopic.contains("statistics") ||
                   lowerTopic.contains("pandas") || lowerTopic.contains("numpy")) {
            return "Data Science";
        } else if (lowerTopic.contains("machine learning") || lowerTopic.contains("ai") || lowerTopic.contains("neural") ||
                   lowerTopic.contains("deep learning") || lowerTopic.contains("tensorflow") || lowerTopic.contains("pytorch")) {
            return "Machine Learning";
        } else if (lowerTopic.contains("docker") || lowerTopic.contains("kubernetes") || lowerTopic.contains("devops") ||
                   lowerTopic.contains("ci/cd") || lowerTopic.contains("deployment")) {
            return "DevOps";
        } else if (lowerTopic.contains("mobile") || lowerTopic.contains("android") || lowerTopic.contains("ios") ||
                   lowerTopic.contains("flutter") || lowerTopic.contains("react native")) {
            return "Mobile Development";
        } else {
            return "Programming"; // Default category
        }
    }

    private String generateCourseTitle(String topic, String difficulty) {
        String level = difficulty.toLowerCase();
        if (level.equals("beginner")) {
            return topic + " for Beginners - Complete Guide";
        } else if (level.equals("advanced")) {
            return "Advanced " + topic + " Mastery";
        } else {
            return "Complete " + topic + " Course";
        }
    }

    private String generateCourseDescription(String topic, String difficulty) {
        String level = difficulty.toLowerCase();
        return String.format(
            "Master %s with this comprehensive %s-level course. " +
            "Learn practical skills through hands-on projects and real-world examples. " +
            "Perfect for %s looking to %s their %s skills.",
            topic, level, 
            level.equals("beginner") ? "beginners" : "developers",
            level.equals("beginner") ? "build" : "advance",
            topic.toLowerCase()
        );
    }

    private int estimateHours(String topic, String difficulty) {
        String level = difficulty.toLowerCase();
        if (level.equals("beginner")) {
            return 8; // Beginner courses are typically longer
        } else if (level.equals("advanced")) {
            return 6; // Advanced courses are more focused
        } else {
            return 10; // Intermediate courses are comprehensive
        }
    }

    private String generateCourseOutline(String topic) {
        return String.format(
            "This course covers fundamental concepts of %s, practical implementation, " +
            "best practices, and real-world applications. Students will work on hands-on projects " +
            "to reinforce their learning and build a portfolio.",
            topic
        );
    }

    private String generateCourseSummary(String topic) {
        return String.format(
            "By the end of this course, you'll have a solid understanding of %s concepts, " +
            "practical experience with industry tools, and the confidence to apply your skills " +
            "in real-world projects.",
            topic
        );
    }

    private List<Map<String, Object>> generateLessons(String topic, String category, String difficulty) {
        List<Map<String, Object>> lessons = new ArrayList<>();
        
        switch (category) {
            case "Web Development":
                lessons = generateWebDevelopmentLessons(topic, difficulty);
                break;
            case "Programming":
                lessons = generateProgrammingLessons(topic, difficulty);
                break;
            case "Data Science":
                lessons = generateDataScienceLessons(topic, difficulty);
                break;
            case "Machine Learning":
                lessons = generateMachineLearningLessons(topic, difficulty);
                break;
            case "DevOps":
                lessons = generateDevOpsLessons(topic, difficulty);
                break;
            case "Mobile Development":
                lessons = generateMobileDevelopmentLessons(topic, difficulty);
                break;
            default:
                lessons = generateGenericLessons(topic, difficulty);
                break;
        }
        
        return lessons;
    }

    private List<Map<String, Object>> generateWebDevelopmentLessons(String topic, String difficulty) {
        List<Map<String, Object>> lessons = new ArrayList<>();
        
        lessons.add(createLesson("Introduction to " + topic, 
            "Overview of " + topic + " and its role in modern web development", 30));
        lessons.add(createLesson("Setting Up Development Environment", 
            "Installing tools and configuring your development workspace", 45));
        lessons.add(createLesson("Core Concepts and Fundamentals", 
            "Understanding the basic principles and syntax", 60));
        lessons.add(createLesson("Building Your First Project", 
            "Hands-on project to apply what you've learned", 90));
        lessons.add(createLesson("Advanced Features and Techniques", 
            "Exploring advanced concepts and best practices", 75));
        lessons.add(createLesson("Styling and User Interface", 
            "Creating beautiful and responsive user interfaces", 60));
        lessons.add(createLesson("Testing and Debugging", 
            "Writing tests and debugging common issues", 45));
        lessons.add(createLesson("Deployment and Production", 
            "Deploying your application to production", 40));
        
        return lessons;
    }

    private List<Map<String, Object>> generateProgrammingLessons(String topic, String difficulty) {
        List<Map<String, Object>> lessons = new ArrayList<>();
        
        lessons.add(createLesson("Introduction to " + topic, 
            "Getting started with " + topic + " programming language", 30));
        lessons.add(createLesson("Variables and Data Types", 
            "Understanding different data types and variable declarations", 45));
        lessons.add(createLesson("Control Structures", 
            "Loops, conditionals, and program flow control", 60));
        lessons.add(createLesson("Functions and Methods", 
            "Creating reusable code with functions", 50));
        lessons.add(createLesson("Object-Oriented Programming", 
            "Classes, objects, and OOP principles", 75));
        lessons.add(createLesson("Error Handling and Debugging", 
            "Managing errors and debugging techniques", 40));
        lessons.add(createLesson("Working with Libraries", 
            "Using external libraries and frameworks", 55));
        lessons.add(createLesson("Final Project", 
            "Building a complete application", 90));
        
        return lessons;
    }

    private List<Map<String, Object>> generateDataScienceLessons(String topic, String difficulty) {
        List<Map<String, Object>> lessons = new ArrayList<>();
        
        lessons.add(createLesson("Introduction to " + topic, 
            "Overview of data science concepts and applications", 30));
        lessons.add(createLesson("Data Collection and Cleaning", 
            "Gathering and preparing data for analysis", 60));
        lessons.add(createLesson("Exploratory Data Analysis", 
            "Understanding your data through visualization", 75));
        lessons.add(createLesson("Statistical Analysis", 
            "Applying statistical methods to data", 90));
        lessons.add(createLesson("Data Visualization", 
            "Creating meaningful charts and graphs", 60));
        lessons.add(createLesson("Machine Learning Basics", 
            "Introduction to predictive modeling", 80));
        lessons.add(createLesson("Model Evaluation", 
            "Assessing model performance and accuracy", 45));
        lessons.add(createLesson("Real-World Project", 
            "Complete data science project from start to finish", 120));
        
        return lessons;
    }

    private List<Map<String, Object>> generateMachineLearningLessons(String topic, String difficulty) {
        List<Map<String, Object>> lessons = new ArrayList<>();
        
        lessons.add(createLesson("Introduction to " + topic, 
            "Understanding machine learning concepts and types", 40));
        lessons.add(createLesson("Data Preprocessing", 
            "Preparing data for machine learning models", 60));
        lessons.add(createLesson("Supervised Learning", 
            "Classification and regression algorithms", 90));
        lessons.add(createLesson("Unsupervised Learning", 
            "Clustering and dimensionality reduction", 75));
        lessons.add(createLesson("Model Training and Validation", 
            "Training models and avoiding overfitting", 80));
        lessons.add(createLesson("Deep Learning Fundamentals", 
            "Introduction to neural networks", 100));
        lessons.add(createLesson("Model Deployment", 
            "Deploying ML models to production", 60));
        
        return lessons;
    }

    private List<Map<String, Object>> generateDevOpsLessons(String topic, String difficulty) {
        List<Map<String, Object>> lessons = new ArrayList<>();
        
        lessons.add(createLesson("Introduction to " + topic, 
            "DevOps culture and practices overview", 30));
        lessons.add(createLesson("Version Control with Git", 
            "Managing code with Git and GitHub", 45));
        lessons.add(createLesson("Continuous Integration", 
            "Setting up CI pipelines", 60));
        lessons.add(createLesson("Containerization", 
            "Docker and container management", 75));
        lessons.add(createLesson("Infrastructure as Code", 
            "Managing infrastructure with code", 80));
        lessons.add(createLesson("Monitoring and Logging", 
            "Application monitoring and log management", 50));
        lessons.add(createLesson("Deployment Strategies", 
            "Blue-green, canary, and rolling deployments", 65));
        
        return lessons;
    }

    private List<Map<String, Object>> generateMobileDevelopmentLessons(String topic, String difficulty) {
        List<Map<String, Object>> lessons = new ArrayList<>();
        
        lessons.add(createLesson("Introduction to " + topic, 
            "Mobile development overview and setup", 30));
        lessons.add(createLesson("User Interface Design", 
            "Creating mobile user interfaces", 60));
        lessons.add(createLesson("Navigation and Routing", 
            "Managing app navigation", 45));
        lessons.add(createLesson("State Management", 
            "Managing application state", 70));
        lessons.add(createLesson("API Integration", 
            "Connecting to backend services", 60));
        lessons.add(createLesson("Device Features", 
            "Using camera, GPS, and other device features", 55));
        lessons.add(createLesson("Testing and Debugging", 
            "Mobile app testing strategies", 40));
        lessons.add(createLesson("App Store Deployment", 
            "Publishing your app", 35));
        
        return lessons;
    }

    private List<Map<String, Object>> generateGenericLessons(String topic, String difficulty) {
        List<Map<String, Object>> lessons = new ArrayList<>();
        
        lessons.add(createLesson("Introduction to " + topic, 
            "Getting started with " + topic, 30));
        lessons.add(createLesson("Basic Concepts", 
            "Understanding fundamental concepts", 45));
        lessons.add(createLesson("Practical Applications", 
            "Applying concepts in real scenarios", 60));
        lessons.add(createLesson("Advanced Techniques", 
            "Exploring advanced features", 75));
        lessons.add(createLesson("Best Practices", 
            "Industry standards and best practices", 50));
        lessons.add(createLesson("Final Project", 
            "Comprehensive project to demonstrate skills", 90));
        
        return lessons;
    }

    private Map<String, Object> createLesson(String title, String content, int durationMinutes) {
        Map<String, Object> lesson = new HashMap<>();
        lesson.put("title", title);
        lesson.put("content", content);
        lesson.put("durationMinutes", durationMinutes);
        return lesson;
    }

    private Map<String, Object> generateFallbackCourse(String topic, String difficulty) {
        System.out.println("🔄 Generating fallback course for: " + topic);
        return generateStructuredCourse(topic, difficulty);
    }

    public List<Map<String, Object>> findYouTubeVideos(String courseTitle, List<String> topics) {
        System.out.println("🎥 Finding YouTube videos for course: " + courseTitle);

        try {
            // Use real YouTube API to search for videos
            List<Map<String, Object>> videos = youTubeService.searchVideosForTopics(topics, 3);

            if (videos.isEmpty()) {
                System.out.println("⚠️ No YouTube videos found, using fallback videos");
                return generateFallbackVideos(topics);
            }

            System.out.println("✅ Found " + videos.size() + " YouTube videos");
            return videos;

        } catch (Exception e) {
            System.err.println("❌ Error finding YouTube videos: " + e.getMessage());
            return generateFallbackVideos(topics);
        }
    }

    private List<Map<String, Object>> generateFallbackVideos(List<String> topics) {
        List<Map<String, Object>> videos = new ArrayList<>();
        for (String topic : topics) {
            videos.addAll(generateMockVideos(topic));
        }
        return videos;
    }

    private List<Map<String, Object>> generateMockVideos(String topic) {
        List<Map<String, Object>> videos = new ArrayList<>();

        // Generate realistic mock videos with different YouTube IDs
        String[] videoIds = {
            "dQw4w9WgXcQ", "oHg5SJYRHA0", "kJQP7kiw5Fk", "L_jWHffIx5E",
            "fJ9rUzIMcZQ", "9bZkp7q19f0", "GtQdIYUtAHg", "Sagg08DrO5U"
        };

        String[] tutorialTypes = {"Introduction to", "Advanced", "Complete Guide to", "Mastering"};
        String[] descriptions = {
            "Learn %s from scratch with practical examples and hands-on exercises",
            "Master %s with this comprehensive tutorial covering all essential concepts",
            "Complete %s course for beginners and intermediate learners",
            "Step-by-step %s tutorial with real-world projects and examples"
        };

        // Generate 2-3 videos per topic
        for (int i = 0; i < Math.min(3, videoIds.length); i++) {
            Map<String, Object> video = new HashMap<>();
            String tutorialType = tutorialTypes[i % tutorialTypes.length];
            String description = descriptions[i % descriptions.length];

            video.put("title", tutorialType + " " + topic + (i > 0 ? " - Part " + (i + 1) : ""));
            video.put("description", String.format(description, topic));
            video.put("url", "https://www.youtube.com/watch?v=" + videoIds[i]);
            video.put("duration", "PT" + (15 + i * 10) + "M"); // 15, 25, 35 minutes
            video.put("thumbnail", "https://img.youtube.com/vi/" + videoIds[i] + "/maxresdefault.jpg");
            videos.add(video);
        }

        return videos;
    }

    /**
     * Generate detailed AI explanations for all lessons in a course
     */
    @SuppressWarnings("unchecked")
    private void generateLessonExplanations(Map<String, Object> course, String topic, String difficulty) {
        System.out.println("🧠 Generating AI lesson explanations for course: " + course.get("title"));

        List<Map<String, Object>> lessons = (List<Map<String, Object>>) course.get("lessons");
        if (lessons == null || lessons.isEmpty()) {
            System.out.println("⚠️ No lessons found to generate explanations for");
            return;
        }

        String courseTitle = (String) course.get("title");

        for (int i = 0; i < lessons.size(); i++) {
            Map<String, Object> lesson = lessons.get(i);
            String lessonTitle = (String) lesson.get("title");
            String lessonContent = (String) lesson.get("content");

            try {
                System.out.println("📝 Generating explanation for lesson " + (i + 1) + ": " + lessonTitle);

                // Generate detailed lesson explanation using Gemini API
                String lessonExplanation = geminiService.generateLessonNotes(
                    lessonTitle,
                    lessonContent != null ? lessonContent : lessonTitle,
                    courseTitle,
                    difficulty
                );

                // Add the generated explanation to the lesson
                lesson.put("notes", lessonExplanation);
                lesson.put("explanation", lessonExplanation); // Also add as explanation for frontend compatibility

                System.out.println("✅ Generated explanation for lesson: " + lessonTitle);

            } catch (Exception e) {
                System.err.println("❌ Failed to generate explanation for lesson '" + lessonTitle + "': " + e.getMessage());

                // Provide a fallback explanation
                String fallbackExplanation = generateFallbackLessonExplanation(lessonTitle, lessonContent, courseTitle, difficulty);
                lesson.put("notes", fallbackExplanation);
                lesson.put("explanation", fallbackExplanation);
            }
        }

        System.out.println("✅ Completed generating lesson explanations for " + lessons.size() + " lessons");
    }

    /**
     * Generate a fallback lesson explanation when AI generation fails
     */
    private String generateFallbackLessonExplanation(String lessonTitle, String lessonContent, String courseTitle, String difficulty) {
        StringBuilder explanation = new StringBuilder();

        explanation.append("<h2>").append(lessonTitle).append("</h2>\n\n");
        explanation.append("<h3>Lesson Overview</h3>\n");
        explanation.append("<p>").append(lessonContent != null ? lessonContent : "This lesson covers important concepts in " + lessonTitle.toLowerCase()).append("</p>\n\n");

        explanation.append("<h3>Learning Objectives</h3>\n");
        explanation.append("<ul>\n");
        explanation.append("<li>Understand the key concepts of ").append(lessonTitle.toLowerCase()).append("</li>\n");
        explanation.append("<li>Apply the knowledge in practical scenarios</li>\n");
        explanation.append("<li>Build confidence in using these concepts</li>\n");
        explanation.append("</ul>\n\n");

        explanation.append("<h3>Key Topics Covered</h3>\n");
        explanation.append("<p>This lesson will cover the fundamental aspects of ").append(lessonTitle.toLowerCase());
        explanation.append(" as part of the ").append(courseTitle).append(" course. ");
        explanation.append("The content is designed for ").append(difficulty.toLowerCase()).append(" level learners.</p>\n\n");

        explanation.append("<h3>Practice Exercises</h3>\n");
        explanation.append("<p>After completing this lesson, you should practice the concepts through hands-on exercises and examples.</p>\n\n");

        explanation.append("<h3>Additional Resources</h3>\n");
        explanation.append("<p>Consider exploring additional materials and documentation related to ").append(lessonTitle.toLowerCase()).append(" to deepen your understanding.</p>");

        return explanation.toString();
    }

    private Map<String, Object> parseAIResponse(String aiResponse, String topic, String difficulty) {
        try {
            System.out.println("🔍 Parsing AI response for course generation");
            System.out.println("📄 Raw AI Response: " + aiResponse.substring(0, Math.min(200, aiResponse.length())) + "...");

            // Clean the response - remove any markdown formatting and extra text
            String cleanResponse = aiResponse.trim();

            // Remove markdown code blocks
            if (cleanResponse.startsWith("```json")) {
                cleanResponse = cleanResponse.substring(7);
            }
            if (cleanResponse.startsWith("```")) {
                cleanResponse = cleanResponse.substring(3);
            }
            if (cleanResponse.endsWith("```")) {
                cleanResponse = cleanResponse.substring(0, cleanResponse.length() - 3);
            }

            // Try to extract JSON from the response if it contains extra text
            int jsonStart = cleanResponse.indexOf('{');
            int jsonEnd = cleanResponse.lastIndexOf('}');

            if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
                cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
            }

            cleanResponse = cleanResponse.trim();
            System.out.println("🧹 Cleaned Response: " + cleanResponse.substring(0, Math.min(200, cleanResponse.length())) + "...");

            // Try to parse as JSON
            JsonNode jsonNode = objectMapper.readTree(cleanResponse);

            Map<String, Object> course = new HashMap<>();
            course.put("title", jsonNode.has("title") ? jsonNode.get("title").asText() : topic + " - Complete Guide");
            course.put("description", jsonNode.has("description") ? jsonNode.get("description").asText() :
                "A comprehensive course covering " + topic + " from basics to advanced concepts.");
            course.put("category", jsonNode.has("category") ? jsonNode.get("category").asText() : determineCategory(topic));
            course.put("difficulty", difficulty.toUpperCase());
            course.put("estimatedHours", jsonNode.has("estimatedHours") ? jsonNode.get("estimatedHours").asInt() : estimateHours(topic, difficulty));
            course.put("outline", jsonNode.has("outline") ? jsonNode.get("outline").asText() : generateCourseOutline(topic));
            course.put("summary", jsonNode.has("summary") ? jsonNode.get("summary").asText() : generateCourseSummary(topic));

            // Parse lessons
            List<Map<String, Object>> lessons = new ArrayList<>();
            if (jsonNode.has("lessons") && jsonNode.get("lessons").isArray()) {
                for (JsonNode lessonNode : jsonNode.get("lessons")) {
                    Map<String, Object> lesson = new HashMap<>();
                    lesson.put("title", lessonNode.has("title") ? lessonNode.get("title").asText() : "Lesson");
                    lesson.put("content", lessonNode.has("content") ? lessonNode.get("content").asText() : "Lesson content");
                    lesson.put("durationMinutes", lessonNode.has("durationMinutes") ? lessonNode.get("durationMinutes").asInt() : 45);
                    lessons.add(lesson);
                }
            }

            // If no lessons were parsed, generate default ones
            if (lessons.isEmpty()) {
                lessons = generateLessons(topic, determineCategory(topic), difficulty);
            }

            course.put("lessons", lessons);

            System.out.println("✅ Successfully parsed AI response into course structure");
            return course;

        } catch (Exception e) {
            System.err.println("❌ Failed to parse AI response: " + e.getMessage());
            System.out.println("🔄 Falling back to structured course generation");
            return generateStructuredCourse(topic, difficulty);
        }
    }
}
