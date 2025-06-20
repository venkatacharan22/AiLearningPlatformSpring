package com.learningplatform.service;

import com.learningplatform.model.Course;
import com.learningplatform.model.Quiz;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QuizService {

    @Autowired
    private GeminiService geminiService;

    public Map<String, Object> generateQuizForCourse(Course course) {
        try {
            // Try to generate quiz using AI
            return generateAIQuiz(course);
        } catch (Exception e) {
            System.err.println("❌ Error generating AI quiz for course " + course.getTitle() + ": " + e.getMessage());
            // Fallback to predefined quiz
            return generateFallbackQuiz(course);
        }
    }

    private Map<String, Object> generateAIQuiz(Course course) {
        try {
            // Use just the course title for focused AI generation
            // This gives better, more targeted questions
            String courseTitle = course.getTitle();
            String simpleContent = "Course: " + courseTitle + "\nCategory: " + course.getCategory() + "\nDifficulty: " + course.getDifficulty();

            Quiz quiz = geminiService.generateQuiz(courseTitle, simpleContent, 10);

            // Convert Quiz object to Map format
            return convertQuizToMap(quiz);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate AI quiz: " + e.getMessage());
        }
    }

    private Map<String, Object> convertQuizToMap(Quiz quiz) {
        Map<String, Object> quizMap = new HashMap<>();
        quizMap.put("title", quiz.getTitle());
        quizMap.put("description", "Test your knowledge of " + quiz.getTopic());

        List<Map<String, Object>> questions = new ArrayList<>();
        for (int i = 0; i < quiz.getQuestions().size(); i++) {
            Quiz.Question q = quiz.getQuestions().get(i);
            Map<String, Object> questionMap = new HashMap<>();
            questionMap.put("id", i + 1);
            questionMap.put("question", q.getQuestionText());

            // Format options with A), B), C), D) prefixes
            List<String> formattedOptions = new ArrayList<>();
            for (int j = 0; j < q.getOptions().size(); j++) {
                formattedOptions.add((char)('A' + j) + ") " + q.getOptions().get(j));
            }
            questionMap.put("options", formattedOptions);
            questionMap.put("correctAnswer", q.getCorrectAnswerIndex());
            questionMap.put("explanation", q.getExplanation());
            questions.add(questionMap);
        }

        quizMap.put("questions", questions);
        return quizMap;
    }



    private Map<String, Object> createStructuredQuiz(Course course) {
        Map<String, Object> quiz = new HashMap<>();
        quiz.put("title", "Quiz for " + course.getTitle());
        quiz.put("description", "Test your knowledge of " + course.getTitle());
        
        List<Map<String, Object>> questions = new ArrayList<>();
        
        // Generate course-specific questions based on category
        switch (course.getCategory().toLowerCase()) {
            case "programming":
                questions = generateProgrammingQuestions(course);
                break;
            case "web development":
                questions = generateWebDevQuestions(course);
                break;
            case "data science":
                questions = generateDataScienceQuestions(course);
                break;
            case "machine learning":
                questions = generateMLQuestions(course);
                break;
            case "devops":
                questions = generateDevOpsQuestions(course);
                break;
            default:
                questions = generateGeneralQuestions(course);
                break;
        }
        
        quiz.put("questions", questions);
        return quiz;
    }

    private List<Map<String, Object>> generateProgrammingQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();
        String courseTitle = course.getTitle();

        // Generate more specific questions based on course title
        if (courseTitle.toLowerCase().contains("java")) {
            return generateJavaQuestions(course);
        } else if (courseTitle.toLowerCase().contains("python")) {
            return generatePythonQuestions(course);
        } else if (courseTitle.toLowerCase().contains("javascript") || courseTitle.toLowerCase().contains("js")) {
            return generateJavaScriptQuestions(course);
        }

        // Generic programming questions
        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "What is a fundamental concept in " + courseTitle + "?");
        q1.put("options", Arrays.asList(
            "A) Variables and data types",
            "B) Color theory",
            "C) Marketing strategies",
            "D) Physical laws"
        ));
        q1.put("correctAnswer", 0);
        q1.put("explanation", "Variables and data types are fundamental in programming.");
        questions.add(q1);

        Map<String, Object> q2 = new HashMap<>();
        q2.put("id", 2);
        q2.put("question", "Which programming paradigm is commonly used in " + courseTitle + "?");
        q2.put("options", Arrays.asList(
            "A) Object-Oriented Programming",
            "B) Procedural Programming",
            "C) Functional Programming",
            "D) All of the above"
        ));
        q2.put("correctAnswer", 3);
        q2.put("explanation", "Modern programming languages support multiple paradigms.");
        questions.add(q2);

        // Add more generic programming questions
        for (int i = 3; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "What is an important aspect of " + courseTitle + "?");
            q.put("options", Arrays.asList(
                "A) Code readability and maintainability",
                "B) Efficient algorithms and data structures",
                "C) Proper error handling",
                "D) All of the above"
            ));
            q.put("correctAnswer", 3);
            q.put("explanation", "All these aspects are crucial in programming.");
            questions.add(q);
        }

        return questions;
    }

    private List<Map<String, Object>> generateJavaQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();

        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "What is the main method signature in Java?");
        q1.put("options", Arrays.asList(
            "A) public static void main(String[] args)",
            "B) public void main(String args)",
            "C) static void main(String[] args)",
            "D) public main(String[] args)"
        ));
        q1.put("correctAnswer", 0);
        q1.put("explanation", "The main method must be public, static, void, and take String[] args.");
        questions.add(q1);

        Map<String, Object> q2 = new HashMap<>();
        q2.put("id", 2);
        q2.put("question", "Which of these is NOT a Java primitive data type?");
        q2.put("options", Arrays.asList(
            "A) int",
            "B) String",
            "C) boolean",
            "D) double"
        ));
        q2.put("correctAnswer", 1);
        q2.put("explanation", "String is a class, not a primitive data type in Java.");
        questions.add(q2);

        // Add more Java-specific questions
        for (int i = 3; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "What is a key feature of Java programming?");
            q.put("options", Arrays.asList(
                "A) Platform independence",
                "B) Object-oriented programming",
                "C) Automatic memory management",
                "D) All of the above"
            ));
            q.put("correctAnswer", 3);
            q.put("explanation", "Java is known for platform independence, OOP, and garbage collection.");
            questions.add(q);
        }

        return questions;
    }

    private List<Map<String, Object>> generatePythonQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();

        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "What is the correct way to define a function in Python?");
        q1.put("options", Arrays.asList(
            "A) def function_name():",
            "B) function function_name():",
            "C) define function_name():",
            "D) func function_name():"
        ));
        q1.put("correctAnswer", 0);
        q1.put("explanation", "Python functions are defined using the 'def' keyword.");
        questions.add(q1);

        // Add more Python questions
        for (int i = 2; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "What is a characteristic of Python?");
            q.put("options", Arrays.asList(
                "A) Interpreted language",
                "B) Dynamic typing",
                "C) Readable syntax",
                "D) All of the above"
            ));
            q.put("correctAnswer", 3);
            q.put("explanation", "Python is interpreted, dynamically typed, and has readable syntax.");
            questions.add(q);
        }

        return questions;
    }

    private List<Map<String, Object>> generateJavaScriptQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();

        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "How do you declare a variable in modern JavaScript?");
        q1.put("options", Arrays.asList(
            "A) var myVar",
            "B) let myVar",
            "C) const myVar",
            "D) Both B and C"
        ));
        q1.put("correctAnswer", 3);
        q1.put("explanation", "Modern JavaScript uses 'let' for mutable and 'const' for immutable variables.");
        questions.add(q1);

        // Add more JavaScript questions
        for (int i = 2; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "What is a feature of JavaScript?");
            q.put("options", Arrays.asList(
                "A) Event-driven programming",
                "B) Asynchronous programming",
                "C) Dynamic typing",
                "D) All of the above"
            ));
            q.put("correctAnswer", 3);
            q.put("explanation", "JavaScript supports event-driven, asynchronous programming with dynamic typing.");
            questions.add(q);
        }

        return questions;
    }

    private List<Map<String, Object>> generateWebDevQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();
        
        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "What does HTML stand for in web development?");
        q1.put("options", Arrays.asList(
            "A) Hyper Text Markup Language",
            "B) High Tech Modern Language",
            "C) Home Tool Markup Language",
            "D) Hyperlink and Text Markup Language"
        ));
        q1.put("correctAnswer", 0);
        q1.put("explanation", "HTML stands for Hyper Text Markup Language, the standard markup language for web pages.");
        questions.add(q1);

        // Add more web development specific questions...
        for (int i = 2; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "Web development question " + i + " about " + course.getTitle() + "?");
            q.put("options", Arrays.asList(
                "A) Web option A",
                "B) Web option B", 
                "C) Web option C",
                "D) Web option D"
            ));
            q.put("correctAnswer", i % 4);
            q.put("explanation", "This tests web development concepts in " + course.getTitle() + ".");
            questions.add(q);
        }

        return questions;
    }

    private List<Map<String, Object>> generateDataScienceQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();
        
        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "What is the main goal of data science?");
        q1.put("options", Arrays.asList(
            "A) To extract insights and knowledge from data",
            "B) To create beautiful visualizations",
            "C) To store large amounts of data",
            "D) To replace human decision making"
        ));
        q1.put("correctAnswer", 0);
        q1.put("explanation", "Data science aims to extract meaningful insights and knowledge from data to inform decision-making.");
        questions.add(q1);

        // Add more data science specific questions...
        for (int i = 2; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "Data science question " + i + " about " + course.getTitle() + "?");
            q.put("options", Arrays.asList(
                "A) Data option A",
                "B) Data option B",
                "C) Data option C", 
                "D) Data option D"
            ));
            q.put("correctAnswer", i % 4);
            q.put("explanation", "This tests data science concepts in " + course.getTitle() + ".");
            questions.add(q);
        }

        return questions;
    }

    private List<Map<String, Object>> generateMLQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();
        
        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "What is machine learning?");
        q1.put("options", Arrays.asList(
            "A) A subset of AI that enables computers to learn without explicit programming",
            "B) A type of computer hardware",
            "C) A programming language",
            "D) A database management system"
        ));
        q1.put("correctAnswer", 0);
        q1.put("explanation", "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.");
        questions.add(q1);

        // Add more ML specific questions...
        for (int i = 2; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "Machine learning question " + i + " about " + course.getTitle() + "?");
            q.put("options", Arrays.asList(
                "A) ML option A",
                "B) ML option B",
                "C) ML option C",
                "D) ML option D"
            ));
            q.put("correctAnswer", i % 4);
            q.put("explanation", "This tests machine learning concepts in " + course.getTitle() + ".");
            questions.add(q);
        }

        return questions;
    }

    private List<Map<String, Object>> generateDevOpsQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();
        
        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "What is the main goal of DevOps?");
        q1.put("options", Arrays.asList(
            "A) To bridge the gap between development and operations teams",
            "B) To replace developers with automated systems",
            "C) To eliminate the need for testing",
            "D) To reduce software functionality"
        ));
        q1.put("correctAnswer", 0);
        q1.put("explanation", "DevOps aims to bridge the gap between development and operations teams to improve collaboration and productivity.");
        questions.add(q1);

        // Add more DevOps specific questions...
        for (int i = 2; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "DevOps question " + i + " about " + course.getTitle() + "?");
            q.put("options", Arrays.asList(
                "A) DevOps option A",
                "B) DevOps option B",
                "C) DevOps option C",
                "D) DevOps option D"
            ));
            q.put("correctAnswer", i % 4);
            q.put("explanation", "This tests DevOps concepts in " + course.getTitle() + ".");
            questions.add(q);
        }

        return questions;
    }

    private List<Map<String, Object>> generateGeneralQuestions(Course course) {
        List<Map<String, Object>> questions = new ArrayList<>();
        
        for (int i = 1; i <= 10; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", i);
            q.put("question", "Question " + i + " about " + course.getTitle() + "?");
            q.put("options", Arrays.asList(
                "A) General option A",
                "B) General option B",
                "C) General option C",
                "D) General option D"
            ));
            q.put("correctAnswer", i % 4);
            q.put("explanation", "This tests general concepts from " + course.getTitle() + ".");
            questions.add(q);
        }

        return questions;
    }

    private Map<String, Object> generateFallbackQuiz(Course course) {
        System.out.println("🔄 Generating fallback quiz for course: " + course.getTitle());
        return createStructuredQuiz(course);
    }
}
