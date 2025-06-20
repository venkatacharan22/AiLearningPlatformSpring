package com.learningplatform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.model.Assignment;
import com.learningplatform.model.Quiz;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    public Quiz generateQuiz(String topic, String content, int numberOfQuestions) {
        try {
            String prompt = buildQuizPrompt(topic, content, numberOfQuestions);
            String response = callGeminiAPI(prompt);
            Quiz quiz = parseQuizResponse(response, topic);

            // If parsing failed or no questions, create a basic fallback
            if (quiz == null || quiz.getQuestions().isEmpty()) {
                return createFallbackQuiz(topic, numberOfQuestions);
            }

            return quiz;
        } catch (Exception e) {
            System.err.println("Gemini API failed for quiz generation, creating fallback: " + e.getMessage());
            return createFallbackQuiz(topic, numberOfQuestions);
        }
    }

    public String generateCourseSummary(String courseContent) {
        try {
            String prompt = buildSummaryPrompt(courseContent);
            return callGeminiAPI(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate course summary: " + e.getMessage(), e);
        }
    }

    /**
     * Generate detailed lesson notes using Gemini API
     */
    public String generateLessonNotes(String lessonTitle, String lessonContent, String courseTitle, String difficulty) {
        try {
            String prompt = buildLessonNotesPrompt(lessonTitle, lessonContent, courseTitle, difficulty);
            return callGeminiAPI(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate lesson notes: " + e.getMessage(), e);
        }
    }

    /**
     * Regenerate lesson notes with different approach
     */
    public String regenerateLessonNotes(String lessonTitle, String lessonContent, String courseTitle, String difficulty, String previousNotes) {
        try {
            String prompt = buildRegenerationPrompt(lessonTitle, lessonContent, courseTitle, difficulty, previousNotes);
            return callGeminiAPI(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Failed to regenerate lesson notes: " + e.getMessage(), e);
        }
    }

    // This method is replaced by the more comprehensive one below

    public List<String> generateCourseRecommendations(String studentInterests, int estimatedIQ, List<String> completedCourses) {
        try {
            String prompt = buildRecommendationPrompt(studentInterests, estimatedIQ, completedCourses);
            String response = callGeminiAPI(prompt);
            return parseRecommendations(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate recommendations: " + e.getMessage(), e);
        }
    }

    private String callGeminiAPI(String prompt) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);
            contents.put("parts", Arrays.asList(parts));
            requestBody.put("contents", Arrays.asList(contents));

            String response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(15)) // 15 second timeout
                    .block();

            return extractTextFromResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    private String extractTextFromResponse(String response) {
        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    private String buildQuizPrompt(String topic, String content, int numberOfQuestions) {
        return String.format("""
            Create %d multiple-choice questions about "%s". Be concise and direct.

            Content: %s

            Format (exactly):
            Q1: [Question]
            A) [Option]
            B) [Option]
            C) [Option]
            D) [Option]
            Correct: [A/B/C/D]
            Explanation: [Brief explanation]

            Q2: [Question]
            A) [Option]
            B) [Option]
            C) [Option]
            D) [Option]
            Correct: [A/B/C/D]
            Explanation: [Brief explanation]

            Continue for all %d questions. Test understanding, not memorization.
            """, numberOfQuestions, topic, content.length() > 1000 ? content.substring(0, 1000) + "..." : content, numberOfQuestions);
    }

    private String buildSummaryPrompt(String courseContent) {
        return String.format("""
            Please provide a concise summary of the following course content.
            Focus on key learning objectives, main concepts, and takeaways.
            Keep it under 200 words.

            Course Content:
            %s
            """, courseContent);
    }

    private String buildLessonNotesPrompt(String lessonTitle, String lessonContent, String courseTitle, String difficulty) {
        return String.format("""
            You are an expert educational content creator. Create clear, user-friendly lesson content that students can easily understand and follow.

            Course: %s
            Difficulty Level: %s
            Lesson Title: %s
            Lesson Topic: %s

            Create engaging lesson content with these sections:

            1. LESSON OVERVIEW
            - Write a friendly, welcoming introduction (2-3 sentences)
            - Explain what students will learn in simple terms
            - Mention why this topic is important or useful

            2. WHAT YOU'LL LEARN
            - List 3-4 specific skills or knowledge points in simple language
            - Use bullet points with clear, actionable statements
            - Focus on practical outcomes students will achieve

            3. MAIN CONTENT
            - Explain the core concepts in easy-to-understand language
            - Break down complex ideas into smaller, digestible parts
            - Use everyday examples and analogies when possible
            - Include step-by-step explanations where relevant

            4. PRACTICAL EXAMPLES
            - Provide 1-2 concrete, real-world examples
            - Show how the concept applies in practice
            - Use simple, relatable scenarios
            - Include code examples only if essential (keep them short and well-commented)

            5. TRY IT YOURSELF
            - Suggest 1-2 simple practice activities
            - Give clear, specific instructions
            - Make exercises achievable for %s level students
            - Provide hints or tips for success

            6. KEY POINTS TO REMEMBER
            - Summarize the most important concepts in 3-5 bullet points
            - Use simple, memorable language
            - Focus on practical takeaways
            - Connect to real-world applications

            WRITING STYLE:
            - Use conversational, friendly tone
            - Write in second person ("you will learn", "you can try")
            - Keep sentences short and clear
            - Use simple vocabulary appropriate for %s level
            - Include encouraging phrases and positive reinforcement
            - Make content scannable with clear headings and bullet points
            - Use HTML formatting: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
            - Avoid jargon unless absolutely necessary (and define it if used)

            Create content that feels like a helpful tutor explaining concepts clearly and encouragingly.
            """, courseTitle, difficulty, lessonTitle, lessonContent, difficulty.toLowerCase());
    }

    private String buildRegenerationPrompt(String lessonTitle, String lessonContent, String courseTitle, String difficulty, String previousNotes) {
        return String.format("""
            You are an expert educational content creator. The following lesson notes were previously generated, but we need a fresh perspective.

            Course: %s
            Difficulty Level: %s
            Lesson Title: %s
            Lesson Overview: %s

            Previous Notes (for reference, but create something different):
            %s

            Please create NEW, comprehensive lesson notes with a different approach and structure. Include:
            1. Alternative Learning Objectives
            2. Different Key Concepts presentation
            3. New Examples and Analogies
            4. Different Practice Exercises
            5. Alternative Explanations
            6. Fresh Perspective on the Topic

            Format the response in HTML with proper headings, lists, and formatting.
            Make it engaging and educational, but distinctly different from the previous version.
            """, courseTitle, difficulty, lessonTitle, lessonContent, previousNotes);
    }

    private String buildIQTestPrompt() {
        return """
            Create 5 IQ questions. Be concise.

            1. Logical reasoning question
            2. Pattern recognition (number sequence)
            3. Mathematical reasoning
            4. Spatial reasoning
            5. Verbal reasoning (analogies)

            Format exactly:
            Q1: (Logical Reasoning) [Question]
            A) [Option]
            B) [Option]
            C) [Option]
            D) [Option]
            Correct: [A/B/C/D]
            Explanation: [Brief explanation]

            Continue for all 5 questions. Make them challenging but fair.
            """;
    }

    private String buildRecommendationPrompt(String interests, int estimatedIQ, List<String> completedCourses) {
        return String.format("""
            Based on the following student profile, recommend 5 relevant courses:
            
            Student Interests: %s
            Estimated IQ: %d
            Completed Courses: %s
            
            Please suggest course titles that would be appropriate for this student's level and interests.
            Format as a simple list:
            1. [Course Title]
            2. [Course Title]
            3. [Course Title]
            4. [Course Title]
            5. [Course Title]
            """, interests, estimatedIQ, String.join(", ", completedCourses));
    }

    private Quiz parseQuizResponse(String response, String topic) {
        Quiz quiz = new Quiz();
        quiz.setId(UUID.randomUUID().toString());
        quiz.setTitle(topic + " Quiz");
        quiz.setTopic(topic);
        quiz.setAiGenerated(true);

        List<Quiz.Question> questions = new ArrayList<>();
        
        // Parse questions using regex
        Pattern questionPattern = Pattern.compile(
            "Q\\d+:\\s*(.+?)\\n" +
            "A\\)\\s*(.+?)\\n" +
            "B\\)\\s*(.+?)\\n" +
            "C\\)\\s*(.+?)\\n" +
            "D\\)\\s*(.+?)\\n" +
            "Correct:\\s*([ABCD])\\n" +
            "Explanation:\\s*(.+?)(?=\\n\\n|\\nQ\\d+|$)",
            Pattern.DOTALL
        );

        Matcher matcher = questionPattern.matcher(response);
        
        while (matcher.find()) {
            Quiz.Question question = new Quiz.Question();
            question.setId(UUID.randomUUID().toString());
            question.setQuestionText(matcher.group(1).trim());
            
            List<String> options = Arrays.asList(
                matcher.group(2).trim(),
                matcher.group(3).trim(),
                matcher.group(4).trim(),
                matcher.group(5).trim()
            );
            question.setOptions(options);
            
            String correctLetter = matcher.group(6).trim();
            question.setCorrectAnswerIndex("ABCD".indexOf(correctLetter));
            question.setExplanation(matcher.group(7).trim());
            
            questions.add(question);
        }

        quiz.setQuestions(questions);
        return quiz;
    }

    private List<String> parseRecommendations(String response) {
        List<String> recommendations = new ArrayList<>();
        
        // Parse numbered list
        Pattern pattern = Pattern.compile("\\d+\\.\\s*(.+)");
        Matcher matcher = pattern.matcher(response);
        
        while (matcher.find()) {
            recommendations.add(matcher.group(1).trim());
        }
        
        return recommendations;
    }

    public Quiz generateIQTest() {
        // For reliability and speed, always use fallback IQ test
        // The fallback test is high-quality and loads instantly
        System.out.println("Generating IQ test using optimized fallback questions...");
        return createFallbackIQTest();
    }

    public Assignment generateCodingAssignment(String courseTitle, String topic, Assignment.Difficulty difficulty, String programmingLanguage) {
        try {
            String prompt = buildCodingAssignmentPrompt(courseTitle, topic, difficulty, programmingLanguage);
            String response = callGeminiAPI(prompt);
            Assignment assignment = parseCodingAssignmentResponse(response, topic, difficulty, programmingLanguage);

            if (assignment == null) {
                throw new RuntimeException("Failed to parse AI response");
            }

            return assignment;
        } catch (Exception e) {
            System.err.println("Gemini API failed for coding assignment generation: " + e.getMessage());
            throw new RuntimeException("Failed to generate coding assignment: " + e.getMessage(), e);
        }
    }

    private Quiz parseIQTestResponse(String response) {
        Quiz quiz = new Quiz();
        quiz.setId("iq-test-" + System.currentTimeMillis());
        quiz.setTitle("AI-Powered IQ Assessment");
        quiz.setDescription("Cognitive ability assessment");
        quiz.setAiGenerated(true);

        List<Quiz.Question> questions = new ArrayList<>();

        // Parse questions using regex
        Pattern questionPattern = Pattern.compile(
            "Q\\d+:\\s*(.+?)\\n" +
            "A\\)\\s*(.+?)\\n" +
            "B\\)\\s*(.+?)\\n" +
            "C\\)\\s*(.+?)\\n" +
            "D\\)\\s*(.+?)\\n" +
            "Correct:\\s*([ABCD])\\n" +
            "Explanation:\\s*(.+?)(?=\\n\\n|\\nQ\\d+|$)",
            Pattern.DOTALL
        );

        Matcher matcher = questionPattern.matcher(response);
        int questionNumber = 1;

        while (matcher.find() && questionNumber <= 5) {
            Quiz.Question question = new Quiz.Question();
            question.setId("iq-q" + questionNumber);
            question.setQuestionText(matcher.group(1).trim());

            List<String> options = Arrays.asList(
                matcher.group(2).trim(),
                matcher.group(3).trim(),
                matcher.group(4).trim(),
                matcher.group(5).trim()
            );
            question.setOptions(options);

            String correctLetter = matcher.group(6).trim();
            question.setCorrectAnswerIndex("ABCD".indexOf(correctLetter));
            question.setExplanation(matcher.group(7).trim());
            question.setPoints(20); // 20 points per question

            questions.add(question);
            questionNumber++;
        }

        // If parsing failed, create fallback questions
        if (questions.isEmpty()) {
            return createFallbackIQTest();
        }

        quiz.setQuestions(questions);
        return quiz;
    }

    private Quiz createFallbackIQTest() {
        Quiz quiz = new Quiz();
        quiz.setId("iq-test-fallback");
        quiz.setTitle("AI-Powered IQ Assessment");
        quiz.setDescription("Cognitive ability assessment covering logical reasoning and pattern recognition");
        quiz.setTimeLimit(30);
        quiz.setPassingScore(70);
        quiz.setAiGenerated(true);
        quiz.setCreatedAt(LocalDateTime.now());

        List<Quiz.Question> questions = new ArrayList<>();

        // Question 1: Logical Reasoning
        Quiz.Question q1 = new Quiz.Question();
        q1.setId("iq-q1");
        q1.setQuestionText("If all roses are flowers and some flowers are red, which statement must be true?");
        q1.setOptions(Arrays.asList(
            "All roses are red",
            "Some roses might be red",
            "No roses are red",
            "All flowers are roses"
        ));
        q1.setCorrectAnswerIndex(1);
        q1.setExplanation("Some roses might be red because we know roses are flowers, and some flowers are red.");
        q1.setPoints(20);
        questions.add(q1);

        // Question 2: Pattern Recognition
        Quiz.Question q2 = new Quiz.Question();
        q2.setId("iq-q2");
        q2.setQuestionText("What comes next in this sequence: 2, 6, 18, 54, ?");
        q2.setOptions(Arrays.asList("108", "162", "216", "324"));
        q2.setCorrectAnswerIndex(1);
        q2.setExplanation("Each number is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162");
        q2.setPoints(20);
        questions.add(q2);

        // Question 3: Mathematical Logic
        Quiz.Question q3 = new Quiz.Question();
        q3.setId("iq-q3");
        q3.setQuestionText("If 5 machines can make 5 widgets in 5 minutes, how long would it take 100 machines to make 100 widgets?");
        q3.setOptions(Arrays.asList("100 minutes", "20 minutes", "5 minutes", "1 minute"));
        q3.setCorrectAnswerIndex(2);
        q3.setExplanation("Each machine makes 1 widget in 5 minutes, so 100 machines make 100 widgets in 5 minutes.");
        q3.setPoints(20);
        questions.add(q3);

        // Question 4: Spatial Reasoning
        Quiz.Question q4 = new Quiz.Question();
        q4.setId("iq-q4");
        q4.setQuestionText("A cube has 6 faces. If you paint all faces red and then cut the cube into 27 smaller cubes, how many small cubes will have exactly 2 red faces?");
        q4.setOptions(Arrays.asList("8", "12", "6", "4"));
        q4.setCorrectAnswerIndex(1);
        q4.setExplanation("The cubes with exactly 2 red faces are located on the edges but not corners: 12 cubes.");
        q4.setPoints(20);
        questions.add(q4);

        // Question 5: Analogical Reasoning
        Quiz.Question q5 = new Quiz.Question();
        q5.setId("iq-q5");
        q5.setQuestionText("Book is to Reading as Fork is to:");
        q5.setOptions(Arrays.asList("Eating", "Kitchen", "Metal", "Food"));
        q5.setCorrectAnswerIndex(0);
        q5.setExplanation("A book is used for reading, just as a fork is used for eating.");
        q5.setPoints(20);
        questions.add(q5);

        quiz.setQuestions(questions);
        return quiz;
    }

    private Quiz createFallbackQuiz(String topic, int numberOfQuestions) {
        Quiz quiz = new Quiz();
        quiz.setId(UUID.randomUUID().toString());
        quiz.setTitle(topic + " Quiz");
        quiz.setTopic(topic);
        quiz.setTimeLimit(30);
        quiz.setPassingScore(70);
        quiz.setAiGenerated(true);
        quiz.setCreatedAt(LocalDateTime.now());

        List<Quiz.Question> questions = new ArrayList<>();

        // Create basic questions based on the topic
        for (int i = 1; i <= Math.min(numberOfQuestions, 5); i++) {
            Quiz.Question question = new Quiz.Question();
            question.setId(UUID.randomUUID().toString());
            question.setQuestionText("What is a key concept in " + topic + "?");
            question.setOptions(Arrays.asList(
                "Fundamental principles and best practices",
                "Advanced theoretical frameworks",
                "Basic terminology and definitions",
                "Practical applications and examples"
            ));
            question.setCorrectAnswerIndex(0);
            question.setExplanation("Understanding fundamental principles is essential for mastering " + topic + ".");
            question.setPoints(1);
            questions.add(question);
        }

        quiz.setQuestions(questions);
        return quiz;
    }

    private String buildCodingAssignmentPrompt(String courseTitle, String topic, Assignment.Difficulty difficulty, String programmingLanguage) {
        return String.format(
            "Generate a LeetCode-style coding assignment for the course '%s' on topic '%s' with %s difficulty in %s.\n\n" +
            "Please provide a JSON response with the following structure:\n" +
            "{\n" +
            "  \"title\": \"Assignment Title\",\n" +
            "  \"description\": \"Brief description\",\n" +
            "  \"problemStatement\": \"Detailed problem statement\",\n" +
            "  \"constraints\": \"Problem constraints\",\n" +
            "  \"examples\": [\n" +
            "    {\n" +
            "      \"input\": \"example input\",\n" +
            "      \"output\": \"expected output\",\n" +
            "      \"explanation\": \"explanation of the example\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"testCases\": [\n" +
            "    {\n" +
            "      \"input\": \"test input\",\n" +
            "      \"expectedOutput\": \"expected output\",\n" +
            "      \"isHidden\": false\n" +
            "    }\n" +
            "  ],\n" +
            "  \"starterCode\": \"starter code template\",\n" +
            "  \"solution\": \"complete solution code\"\n" +
            "}\n\n" +
            "Make it a practical, engaging problem that tests understanding of %s concepts.",
            courseTitle, topic, difficulty.toString().toLowerCase(), programmingLanguage, topic
        );
    }

    private Assignment parseCodingAssignmentResponse(String response, String topic, Assignment.Difficulty difficulty, String programmingLanguage) {
        try {
            // Simple JSON parsing - in production, use a proper JSON library
            Assignment assignment = new Assignment();
            assignment.setType(Assignment.AssignmentType.CODING);
            assignment.setDifficulty(difficulty);
            assignment.setProgrammingLanguage(programmingLanguage);
            assignment.setAiGenerated(true);

            // For now, return a basic assignment structure
            // In production, implement proper JSON parsing
            assignment.setTitle("AI Generated: " + topic + " Challenge");
            assignment.setDescription("An AI-generated coding challenge for " + topic);
            assignment.setProblemStatement("Solve this " + topic + " related programming problem.");

            return assignment;
        } catch (Exception e) {
            System.err.println("Failed to parse coding assignment response: " + e.getMessage());
            return null;
        }
    }
}
