package com.learningplatform.controller;

import com.learningplatform.model.Quiz;
import com.learningplatform.service.GeminiService;
import com.learningplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/iq-test")
@CrossOrigin(origins = "http://localhost:3000")
public class IQTestController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private UserService userService;

    @GetMapping("/generate")
    public ResponseEntity<?> generateIQTest() {
        try {
            Quiz iqTest = geminiService.generateIQTest();
            return ResponseEntity.ok(iqTest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate IQ test: " + e.getMessage()));
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitIQTest(@RequestBody IQTestSubmission submission, HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");

            // Use fallback test answers for consistent scoring
            // These correspond to the fallback IQ test questions
            Map<String, Integer> correctAnswers = Map.of(
                "iq-q1", 1, // Some roses might be red
                "iq-q2", 1, // 162 (pattern recognition)
                "iq-q3", 2, // 5 minutes (mathematical logic)
                "iq-q4", 1, // 12 cubes (spatial reasoning)
                "iq-q5", 0  // Eating (analogical reasoning)
            );

            // Calculate score based on correct answers
            int correct = 0;
            int totalQuestions = submission.getAnswers().size();

            // Compare submitted answers with correct answers
            for (Map.Entry<String, String> entry : submission.getAnswers().entrySet()) {
                String questionId = entry.getKey();
                String submittedAnswer = entry.getValue();

                if (submittedAnswer != null && correctAnswers.containsKey(questionId)) {
                    try {
                        int answerIndex = Integer.parseInt(submittedAnswer);
                        if (answerIndex == correctAnswers.get(questionId)) {
                            correct++;
                        }
                    } catch (NumberFormatException e) {
                        // Invalid answer format, skip
                    }
                }
            }

            // Calculate IQ score using a more realistic formula
            double percentage = totalQuestions > 0 ? (double) correct / totalQuestions : 0;

            // IQ scoring:
            // 0% correct = 70 IQ
            // 20% correct = 85 IQ
            // 40% correct = 100 IQ (average)
            // 60% correct = 115 IQ
            // 80% correct = 130 IQ
            // 100% correct = 145 IQ
            int iqScore = (int) (70 + (percentage * 75));

            // Add some randomness to make it more realistic (±5 points)
            int randomVariation = (int) (Math.random() * 11) - 5; // -5 to +5
            iqScore = Math.max(70, Math.min(160, iqScore + randomVariation));

            // Update user's IQ score
            if (userId != null) {
                try {
                    userService.updateEstimatedIQ(Long.parseLong(userId), iqScore);
                } catch (Exception e) {
                    System.err.println("Failed to update user IQ: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(Map.of(
                "score", iqScore,
                "correctAnswers", correct,
                "totalQuestions", totalQuestions,
                "percentage", Math.round(percentage * 100),
                "message", "IQ test completed successfully!"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to submit IQ test: " + e.getMessage()));
        }
    }

    public static class IQTestSubmission {
        private Map<String, String> answers;
        private int timeSpent;

        public Map<String, String> getAnswers() {
            return answers;
        }

        public void setAnswers(Map<String, String> answers) {
            this.answers = answers;
        }

        public int getTimeSpent() {
            return timeSpent;
        }

        public void setTimeSpent(int timeSpent) {
            this.timeSpent = timeSpent;
        }
    }
}
