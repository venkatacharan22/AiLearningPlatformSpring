package com.learningplatform.service;

import com.learningplatform.model.Assignment;
import com.learningplatform.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CodeforcesService codeforcesService;

    public List<Assignment> findByCourseId(String courseId) {
        return assignmentRepository.findByCourseIdAndPublishedTrue(courseId);
    }

    public List<Assignment> findAllByCourseId(String courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }

    public List<Assignment> findByInstructorId(String instructorId) {
        return assignmentRepository.findByInstructorId(instructorId);
    }

    public Optional<Assignment> findById(Long id) {
        return assignmentRepository.findById(id);
    }

    public Assignment save(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    public void delete(Long id) {
        assignmentRepository.deleteById(id);
    }

    public Assignment createAssignment(Assignment assignment) {
        assignment.setCreatedAt(LocalDateTime.now());
        // Auto-publish AI-generated assignments for better student experience
        if (assignment.isAiGenerated()) {
            assignment.setPublished(true);
        }
        return assignmentRepository.save(assignment);
    }

    public Assignment publishAssignment(Long id) {
        Optional<Assignment> assignmentOpt = assignmentRepository.findById(id);
        if (assignmentOpt.isPresent()) {
            Assignment assignment = assignmentOpt.get();
            assignment.setPublished(true);
            return assignmentRepository.save(assignment);
        }
        throw new RuntimeException("Assignment not found");
    }

    public Assignment unpublishAssignment(Long id) {
        Optional<Assignment> assignmentOpt = assignmentRepository.findById(id);
        if (assignmentOpt.isPresent()) {
            Assignment assignment = assignmentOpt.get();
            assignment.setPublished(false);
            return assignmentRepository.save(assignment);
        }
        throw new RuntimeException("Assignment not found");
    }

    public Assignment generateCodingAssignment(String courseTitle, String topic, Assignment.Difficulty difficulty, String programmingLanguage) {
        try {
            // Use AI to generate a coding assignment
            Assignment assignment = geminiService.generateCodingAssignment(courseTitle, topic, difficulty, programmingLanguage);
            assignment.setAiGenerated(true);
            assignment.setSource(Assignment.AssignmentSource.AI_GENERATED);
            assignment.setType(Assignment.AssignmentType.CODING);
            assignment.setDifficulty(difficulty);
            assignment.setProgrammingLanguage(programmingLanguage);

            return assignment;
        } catch (Exception e) {
            // Fallback to predefined assignment
            Assignment fallback = createFallbackCodingAssignment(topic, difficulty, programmingLanguage);
            fallback.setSource(Assignment.AssignmentSource.AI_GENERATED);
            return fallback;
        }
    }

    private Assignment createFallbackCodingAssignment(String topic, Assignment.Difficulty difficulty, String programmingLanguage) {
        Assignment assignment = new Assignment();
        assignment.setType(Assignment.AssignmentType.CODING);
        assignment.setDifficulty(difficulty);
        assignment.setProgrammingLanguage(programmingLanguage);
        assignment.setAiGenerated(false);

        // Generate different problems based on difficulty and topic
        if (topic.toLowerCase().contains("array") || topic.toLowerCase().contains("data structure")) {
            setupArrayProblem(assignment, difficulty, programmingLanguage);
        } else if (topic.toLowerCase().contains("algorithm") || topic.toLowerCase().contains("sorting")) {
            setupAlgorithmProblem(assignment, difficulty, programmingLanguage);
        } else if (topic.toLowerCase().contains("string")) {
            setupStringProblem(assignment, difficulty, programmingLanguage);
        } else {
            setupGeneralProblem(assignment, difficulty, programmingLanguage);
        }

        return assignment;
    }

    private void setupArrayProblem(Assignment assignment, Assignment.Difficulty difficulty, String language) {
        if (difficulty == Assignment.Difficulty.EASY) {
            assignment.setTitle("Two Sum Problem");
            assignment.setDescription("Find two numbers in an array that add up to a target sum.");
            assignment.setProblemStatement(
                "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n" +
                "You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n" +
                "You can return the answer in any order."
            );
            assignment.setConstraints(
                "• 2 ≤ nums.length ≤ 10^4\n" +
                "• -10^9 ≤ nums[i] ≤ 10^9\n" +
                "• -10^9 ≤ target ≤ 10^9\n" +
                "• Only one valid answer exists."
            );

            // Add examples
            assignment.getExamples().add(new Assignment.Example(
                "nums = [2,7,11,15], target = 9",
                "[0,1]",
                "Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1]."
            ));
            assignment.getExamples().add(new Assignment.Example(
                "nums = [3,2,4], target = 6",
                "[1,2]",
                "Because nums[1] + nums[2] = 2 + 4 = 6, we return [1, 2]."
            ));

            // Add test cases
            assignment.getTestCases().add(new Assignment.TestCase("[2,7,11,15]\n9", "[0,1]", false));
            assignment.getTestCases().add(new Assignment.TestCase("[3,2,4]\n6", "[1,2]", false));
            assignment.getTestCases().add(new Assignment.TestCase("[3,3]\n6", "[0,1]", true));

            // Set starter code based on language
            if ("java".equals(language)) {
                assignment.setStarterCode(
                    "class Solution {\n" +
                    "    public int[] twoSum(int[] nums, int target) {\n" +
                    "        // Your code here\n" +
                    "        \n" +
                    "    }\n" +
                    "}"
                );
                assignment.setSolution(
                    "class Solution {\n" +
                    "    public int[] twoSum(int[] nums, int target) {\n" +
                    "        Map<Integer, Integer> map = new HashMap<>();\n" +
                    "        for (int i = 0; i < nums.length; i++) {\n" +
                    "            int complement = target - nums[i];\n" +
                    "            if (map.containsKey(complement)) {\n" +
                    "                return new int[] { map.get(complement), i };\n" +
                    "            }\n" +
                    "            map.put(nums[i], i);\n" +
                    "        }\n" +
                    "        return new int[0];\n" +
                    "    }\n" +
                    "}"
                );
            } else if ("python".equals(language)) {
                assignment.setStarterCode(
                    "def twoSum(nums, target):\n" +
                    "    \"\"\"\n" +
                    "    :type nums: List[int]\n" +
                    "    :type target: int\n" +
                    "    :rtype: List[int]\n" +
                    "    \"\"\"\n" +
                    "    # Your code here\n" +
                    "    pass"
                );
                assignment.setSolution(
                    "def twoSum(nums, target):\n" +
                    "    num_map = {}\n" +
                    "    for i, num in enumerate(nums):\n" +
                    "        complement = target - num\n" +
                    "        if complement in num_map:\n" +
                    "            return [num_map[complement], i]\n" +
                    "        num_map[num] = i\n" +
                    "    return []"
                );
            }
        }
        
        assignment.setTimeLimit(30);
        assignment.setPoints(100);
    }

    private void setupAlgorithmProblem(Assignment assignment, Assignment.Difficulty difficulty, String language) {
        // Implementation for algorithm problems
        assignment.setTitle("Sorting Algorithm Implementation");
        assignment.setDescription("Implement a sorting algorithm to sort an array of integers.");
        // Add more details...
    }

    private void setupStringProblem(Assignment assignment, Assignment.Difficulty difficulty, String language) {
        // Implementation for string problems
        assignment.setTitle("String Manipulation");
        assignment.setDescription("Solve string-related programming challenges.");
        // Add more details...
    }

    private void setupGeneralProblem(Assignment assignment, Assignment.Difficulty difficulty, String language) {
        // Implementation for general problems
        assignment.setTitle("Programming Challenge");
        assignment.setDescription("Solve a general programming problem.");
        // Add more details...
    }

    public List<Assignment> findCodingAssignments(String courseId) {
        return assignmentRepository.findByCourseIdAndType(courseId, Assignment.AssignmentType.CODING);
    }

    public long countAssignmentsByCourse(String courseId) {
        return assignmentRepository.countByCourseIdAndPublishedTrue(courseId);
    }

    /**
     * Generate assignment with Codeforces problems
     */
    public Assignment generateAssignmentWithCodeforcesProblems(String courseTitle, String topic,
                                                              Assignment.Difficulty difficulty,
                                                              String programmingLanguage,
                                                              int problemCount) {
        try {
            System.out.println("🔍 Generating assignment with Codeforces problems");
            System.out.println("📋 Topic: " + topic + ", Difficulty: " + difficulty + ", Count: " + problemCount);

            // Get problems from Codeforces
            List<Map<String, Object>> codeforcesProblems = codeforcesService.getProblemsByDifficulty(
                difficulty.toString(), topic, problemCount);

            if (codeforcesProblems.isEmpty()) {
                System.out.println("⚠️ No Codeforces problems found, falling back to AI generation");
                return generateCodingAssignment(courseTitle, topic, difficulty, programmingLanguage);
            }

            // Create assignment with Codeforces problems
            Assignment assignment = new Assignment();
            assignment.setType(Assignment.AssignmentType.CODING);
            assignment.setDifficulty(difficulty);
            assignment.setProgrammingLanguage(programmingLanguage);
            assignment.setAiGenerated(false);
            assignment.setSource(Assignment.AssignmentSource.CODEFORCES);
            assignment.setTitle("Coding Challenge: " + topic);
            assignment.setDescription("Solve programming problems from Codeforces related to " + topic);

            // Use the first problem as the main problem
            Map<String, Object> mainProblem = codeforcesProblems.get(0);
            setupAssignmentFromCodeforcesProblem(assignment, mainProblem, programmingLanguage);

            // Add additional problems as references
            StringBuilder additionalProblems = new StringBuilder();
            additionalProblems.append("\n\n## Additional Practice Problems:\n");
            for (int i = 1; i < codeforcesProblems.size(); i++) {
                Map<String, Object> problem = codeforcesProblems.get(i);
                additionalProblems.append(String.format("- **%s**: %s\n",
                    problem.get("name"), problem.get("url")));
            }

            assignment.setDescription(assignment.getDescription() + additionalProblems.toString());

            System.out.println("✅ Successfully created assignment with " + codeforcesProblems.size() + " Codeforces problems");
            return assignment;

        } catch (Exception e) {
            System.err.println("❌ Error generating assignment with Codeforces problems: " + e.getMessage());
            return generateCodingAssignment(courseTitle, topic, difficulty, programmingLanguage);
        }
    }

    /**
     * Get available Codeforces problems for assignment creation
     */
    public List<Map<String, Object>> getAvailableCodeforcesProblems(String difficulty, String topic, int limit) {
        try {
            return codeforcesService.getProblemsByDifficulty(difficulty, topic, limit);
        } catch (Exception e) {
            System.err.println("❌ Error fetching Codeforces problems: " + e.getMessage());
            return List.of();
        }
    }

    private void setupAssignmentFromCodeforcesProblem(Assignment assignment, Map<String, Object> problem, String language) {
        assignment.setTitle((String) problem.get("name"));
        assignment.setProblemStatement("This is a Codeforces problem. Please visit the link below for the complete problem statement:\n\n" +
                                     "**Problem Link**: " + problem.get("url") + "\n\n" +
                                     "**Problem Rating**: " + problem.get("rating") + "\n" +
                                     "**Tags**: " + problem.get("tags"));

        assignment.setConstraints("Please refer to the original problem on Codeforces for detailed constraints.");

        // Set basic starter code template
        if ("java".equals(language)) {
            assignment.setStarterCode(
                "import java.util.*;\n" +
                "import java.io.*;\n\n" +
                "public class Solution {\n" +
                "    public static void main(String[] args) {\n" +
                "        Scanner sc = new Scanner(System.in);\n" +
                "        // Your code here\n" +
                "        \n" +
                "    }\n" +
                "}"
            );
        } else if ("python".equals(language)) {
            assignment.setStarterCode(
                "# Read input\n" +
                "# Your code here\n" +
                "\n" +
                "# Print output\n"
            );
        } else if ("cpp".equals(language)) {
            assignment.setStarterCode(
                "#include <iostream>\n" +
                "#include <vector>\n" +
                "#include <algorithm>\n" +
                "using namespace std;\n\n" +
                "int main() {\n" +
                "    // Your code here\n" +
                "    \n" +
                "    return 0;\n" +
                "}"
            );
        }

        assignment.setTimeLimit(60); // 1 hour for Codeforces problems
        assignment.setPoints(150); // Higher points for external problems

        // Add example from problem if available
        assignment.getExamples().add(new Assignment.Example(
            "See problem link for examples",
            "See problem link for expected output",
            "Please refer to the Codeforces problem for detailed examples and explanations."
        ));
    }
}
