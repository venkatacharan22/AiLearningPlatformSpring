package com.learningplatform.config;

import com.learningplatform.model.Assignment;
import com.learningplatform.model.User;
import com.learningplatform.model.Course;
import com.learningplatform.service.AssignmentService;
import com.learningplatform.service.UserService;
import com.learningplatform.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private AssignmentService assignmentService;

    @Override
    public void run(String... args) throws Exception {
        initializeDemoUsers();
        // Removed dummy courses - only instructor-created courses will be shown
        initializeDemoAssignments();
    }

    private void initializeDemoUsers() {
        try {
            // Check if admin user already exists
            if (userService.findByUsername("admin").isEmpty()) {
                // Create Admin User
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@learningplatform.com");
                admin.setPassword("admin123");
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setRole(User.Role.ADMIN);
                admin.setActive(true);
                userService.createUser(admin);
                System.out.println("✅ Created demo admin user: admin/admin123");
            } else {
                System.out.println("ℹ️ Admin user already exists");
            }

            // Check if instructor user already exists
            if (userService.findByUsername("instructor").isEmpty()) {
                // Create Instructor User
                User instructor = new User();
                instructor.setUsername("instructor");
                instructor.setEmail("instructor@learningplatform.com");
                instructor.setPassword("instructor123");
                instructor.setFirstName("John");
                instructor.setLastName("Doe");
                instructor.setRole(User.Role.INSTRUCTOR);
                instructor.setBio("Experienced software developer and educator with 10+ years in the industry.");
                instructor.setExpertise("Java, Spring Boot, React, Machine Learning");
                instructor.setActive(true);
                userService.createUser(instructor);
                System.out.println("✅ Created demo instructor user: instructor/instructor123");
            } else {
                System.out.println("ℹ️ Instructor user already exists");
            }

            // Create additional instructors
            if (userService.findByUsername("sarah_wilson").isEmpty()) {
                User instructor2 = new User();
                instructor2.setUsername("sarah_wilson");
                instructor2.setEmail("sarah.wilson@learningplatform.com");
                instructor2.setPassword("instructor123");
                instructor2.setFirstName("Sarah");
                instructor2.setLastName("Wilson");
                instructor2.setRole(User.Role.INSTRUCTOR);
                instructor2.setBio("AI researcher and data science expert with PhD in Machine Learning.");
                instructor2.setExpertise("Python, Machine Learning, Data Science, AI");
                instructor2.setActive(true);
                userService.createUser(instructor2);
                System.out.println("✅ Created demo instructor: sarah_wilson/instructor123");
            } else {
                System.out.println("ℹ️ Sarah Wilson instructor already exists");
            }

            if (userService.findByUsername("mike_chen").isEmpty()) {
                User instructor3 = new User();
                instructor3.setUsername("mike_chen");
                instructor3.setEmail("mike.chen@learningplatform.com");
                instructor3.setPassword("instructor123");
                instructor3.setFirstName("Mike");
                instructor3.setLastName("Chen");
                instructor3.setRole(User.Role.INSTRUCTOR);
                instructor3.setBio("Full-stack developer and DevOps specialist with expertise in cloud technologies.");
                instructor3.setExpertise("JavaScript, Node.js, AWS, Docker, Kubernetes");
                instructor3.setActive(true);
                userService.createUser(instructor3);
                System.out.println("✅ Created demo instructor: mike_chen/instructor123");
            } else {
                System.out.println("ℹ️ Mike Chen instructor already exists");
            }

            // Check if student user already exists
            if (userService.findByUsername("student").isEmpty()) {
                // Create Student User
                User student = new User();
                student.setUsername("student");
                student.setEmail("student@learningplatform.com");
                student.setPassword("student123");
                student.setFirstName("Jane");
                student.setLastName("Smith");
                student.setRole(User.Role.STUDENT);
                student.setActive(true);
                student.setEstimatedIQ(110);
                userService.createUser(student);
                System.out.println("✅ Created demo student user: student/student123");
            } else {
                System.out.println("ℹ️ Student user already exists");
            }

            // Create additional students
            createAdditionalStudents();

            System.out.println("🎓 Demo users initialization completed!");

        } catch (Exception e) {
            System.err.println("❌ Error initializing demo users: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void createAdditionalStudents() {
        String[] studentData = {
            "alex_johnson,alex.johnson@email.com,Alex,Johnson,125",
            "emma_davis,emma.davis@email.com,Emma,Davis,118",
            "ryan_martinez,ryan.martinez@email.com,Ryan,Martinez,112",
            "sophia_brown,sophia.brown@email.com,Sophia,Brown,130",
            "lucas_garcia,lucas.garcia@email.com,Lucas,Garcia,108"
        };

        for (String data : studentData) {
            String[] parts = data.split(",");
            if (userService.findByUsername(parts[0]).isEmpty()) {
                User student = new User();
                student.setUsername(parts[0]);
                student.setEmail(parts[1]);
                student.setPassword("student123");
                student.setFirstName(parts[2]);
                student.setLastName(parts[3]);
                student.setRole(User.Role.STUDENT);
                student.setActive(true);
                student.setEstimatedIQ(Integer.parseInt(parts[4]));
                userService.createUser(student);
                System.out.println("✅ Created demo student: " + parts[0]);
            }
        }
    }

    // Removed dummy courses initialization - only instructor-created courses will be shown
    /*
    private void initializeDemoCourses() {
        try {
            // Get instructor IDs
            User instructor1 = userService.findByUsername("instructor").orElse(null);
            User instructor2 = userService.findByUsername("sarah_wilson").orElse(null);
            User instructor3 = userService.findByUsername("mike_chen").orElse(null);

            if (instructor1 != null) {
                createJavaCourse(instructor1.getId().toString());
                createReactCourse(instructor1.getId().toString());
            }

            if (instructor2 != null) {
                createPythonCourse(instructor2.getId().toString());
                createMLCourse(instructor2.getId().toString());
            }

            if (instructor3 != null) {
                createNodeJSCourse(instructor3.getId().toString());
                createDockerCourse(instructor3.getId().toString());
            }

            System.out.println("📚 Demo courses initialization completed!");

        } catch (Exception e) {
            System.err.println("❌ Error initializing demo courses: " + e.getMessage());
            e.printStackTrace();
        }
    }
    */

    /*
    private void createJavaCourse(String instructorId) {
        Course course = new Course();
        course.setTitle("Complete Java Programming Masterclass");
        course.setDescription("Learn Java programming from basics to advanced concepts. This comprehensive course covers object-oriented programming, data structures, algorithms, and modern Java features.");
        course.setCategory("Programming");
        course.setDifficulty("BEGINNER");
        course.setEstimatedHours(40);
        course.setCreatedAt(LocalDateTime.now());
        course.setPublished(true);
        course.setTotalEnrollments(156);
        course.setAverageRating(4.7);

        // Add lessons
        Course.Lesson lesson1 = new Course.Lesson();
        lesson1.setId("java-lesson-1");
        lesson1.setTitle("Introduction to Java");
        lesson1.setContent("Welcome to Java programming! In this lesson, we'll cover the basics of Java, its history, and why it's one of the most popular programming languages.");
        lesson1.setOrder(1);
        lesson1.setDurationMinutes(45);

        Course.Lesson lesson2 = new Course.Lesson();
        lesson2.setId("java-lesson-2");
        lesson2.setTitle("Variables and Data Types");
        lesson2.setContent("Learn about different data types in Java including primitives and objects. Understand how to declare and use variables effectively.");
        lesson2.setOrder(2);
        lesson2.setDurationMinutes(60);

        course.setLessons(Arrays.asList(lesson1, lesson2));

        // Add reviews
        Course.Review review1 = new Course.Review();
        review1.setStudentId("2");
        review1.setStudentName("Jane Smith");
        review1.setRating(5);
        review1.setComment("Excellent course! Very well structured and easy to follow.");
        review1.setCreatedAt(LocalDateTime.now().minusDays(5));

        course.setReviews(Arrays.asList(review1));

        try {
            courseService.createCourse(course, instructorId);
            System.out.println("✅ Created Java course");
        } catch (Exception e) {
            System.err.println("❌ Error creating Java course: " + e.getMessage());
        }
    }

    private void createReactCourse(String instructorId) {
        Course course = new Course();
        course.setTitle("Modern React Development");
        course.setDescription("Master React.js and build modern web applications. Learn hooks, context, state management, and best practices for React development.");
        course.setCategory("Web Development");
        course.setDifficulty("INTERMEDIATE");
        course.setEstimatedHours(35);
        course.setCreatedAt(LocalDateTime.now().minusDays(10));
        course.setPublished(true);
        course.setTotalEnrollments(89);
        course.setAverageRating(4.5);

        Course.Lesson lesson1 = new Course.Lesson();
        lesson1.setId("react-lesson-1");
        lesson1.setTitle("React Fundamentals");
        lesson1.setContent("Introduction to React, JSX, and component-based architecture.");
        lesson1.setOrder(1);
        lesson1.setDurationMinutes(50);

        course.setLessons(Arrays.asList(lesson1));

        try {
            courseService.createCourse(course, instructorId);
            System.out.println("✅ Created React course");
        } catch (Exception e) {
            System.err.println("❌ Error creating React course: " + e.getMessage());
        }
    }

    private void createPythonCourse(String instructorId) {
        Course course = new Course();
        course.setTitle("Python for Data Science");
        course.setDescription("Learn Python programming with a focus on data science applications. Covers NumPy, Pandas, Matplotlib, and machine learning basics.");
        course.setCategory("Data Science");
        course.setDifficulty("INTERMEDIATE");
        course.setEstimatedHours(45);
        course.setCreatedAt(LocalDateTime.now().minusDays(15));
        course.setPublished(true);
        course.setTotalEnrollments(203);
        course.setAverageRating(4.8);

        try {
            courseService.createCourse(course, instructorId);
            System.out.println("✅ Created Python course");
        } catch (Exception e) {
            System.err.println("❌ Error creating Python course: " + e.getMessage());
        }
    }

    private void createMLCourse(String instructorId) {
        Course course = new Course();
        course.setTitle("Machine Learning Fundamentals");
        course.setDescription("Comprehensive introduction to machine learning algorithms, supervised and unsupervised learning, and practical applications.");
        course.setCategory("Artificial Intelligence");
        course.setDifficulty("ADVANCED");
        course.setEstimatedHours(60);
        course.setCreatedAt(LocalDateTime.now().minusDays(20));
        course.setPublished(true);
        course.setTotalEnrollments(127);
        course.setAverageRating(4.9);

        try {
            courseService.createCourse(course, instructorId);
            System.out.println("✅ Created ML course");
        } catch (Exception e) {
            System.err.println("❌ Error creating ML course: " + e.getMessage());
        }
    }

    private void createNodeJSCourse(String instructorId) {
        Course course = new Course();
        course.setTitle("Node.js Backend Development");
        course.setDescription("Build scalable backend applications with Node.js, Express, and MongoDB. Learn REST APIs, authentication, and deployment.");
        course.setCategory("Backend Development");
        course.setDifficulty("INTERMEDIATE");
        course.setEstimatedHours(38);
        course.setCreatedAt(LocalDateTime.now().minusDays(8));
        course.setPublished(true);
        course.setTotalEnrollments(94);
        course.setAverageRating(4.6);

        try {
            courseService.createCourse(course, instructorId);
            System.out.println("✅ Created Node.js course");
        } catch (Exception e) {
            System.err.println("❌ Error creating Node.js course: " + e.getMessage());
        }
    }

    private void createDockerCourse(String instructorId) {
        Course course = new Course();
        course.setTitle("Docker and Containerization");
        course.setDescription("Master Docker containerization technology. Learn to build, deploy, and manage containerized applications in production environments.");
        course.setCategory("DevOps");
        course.setDifficulty("INTERMEDIATE");
        course.setEstimatedHours(25);
        course.setCreatedAt(LocalDateTime.now().minusDays(12));
        course.setPublished(true);
        course.setTotalEnrollments(76);
        course.setAverageRating(4.4);

        try {
            courseService.createCourse(course, instructorId);
            System.out.println("✅ Created Docker course");
        } catch (Exception e) {
            System.err.println("❌ Error creating Docker course: " + e.getMessage());
        }
    }
    */

    private void initializeDemoAssignments() {
        try {
            // Force Assignment entity to be loaded by creating a simple assignment
            System.out.println("[INIT] Initializing assignment tables...");

            // Force JPA to create assignment tables by referencing the entity
            Assignment testAssignment = new Assignment();
            testAssignment.setTitle("Test Assignment");
            testAssignment.setDescription("Test assignment to force table creation");
            testAssignment.setCourseId("1");
            testAssignment.setInstructorId("2");
            testAssignment.setType(Assignment.AssignmentType.CODING);
            testAssignment.setDifficulty(Assignment.Difficulty.EASY);
            testAssignment.setProblemStatement("Test problem");
            testAssignment.setPublished(false);

            // Try to save to force table creation
            try {
                assignmentService.save(testAssignment);
                System.out.println("[SUCCESS] Assignment tables created successfully!");
                assignmentService.delete(testAssignment.getId()); // Clean up test assignment
            } catch (Exception e) {
                System.out.println("[WARNING] Assignment tables may not exist yet: " + e.getMessage());
            }

            // Disabled demo assignments since dummy courses are removed
            // createJavaAssignments();
            // createPythonAssignments();
            // createReactAssignments();

            System.out.println("[COMPLETE] Demo assignments initialization completed!");
        } catch (Exception e) {
            System.err.println("❌ Error initializing demo assignments: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void createJavaAssignments() {
        try {
            // Two Sum Problem - Easy
            Assignment twoSum = new Assignment();
            twoSum.setTitle("Two Sum Problem");
            twoSum.setDescription("Find two numbers in an array that add up to a target sum.");
            twoSum.setCourseId("1"); // Java course
            twoSum.setInstructorId("2"); // instructor user
            twoSum.setType(Assignment.AssignmentType.CODING);
            twoSum.setDifficulty(Assignment.Difficulty.EASY);
            twoSum.setProgrammingLanguage("java");
            twoSum.setTimeLimit(30);
            twoSum.setPoints(100);
            twoSum.setPublished(true);

            twoSum.setProblemStatement(
                "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n" +
                "You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n" +
                "You can return the answer in any order."
            );

            twoSum.setConstraints(
                "• 2 ≤ nums.length ≤ 10^4\n" +
                "• -10^9 ≤ nums[i] ≤ 10^9\n" +
                "• -10^9 ≤ target ≤ 10^9\n" +
                "• Only one valid answer exists."
            );

            twoSum.setStarterCode(
                "class Solution {\n" +
                "    public int[] twoSum(int[] nums, int target) {\n" +
                "        // Your code here\n" +
                "        \n" +
                "    }\n" +
                "}"
            );

            // Add examples
            twoSum.getExamples().add(new Assignment.Example(
                "nums = [2,7,11,15], target = 9",
                "[0,1]",
                "Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1]."
            ));

            // Add test cases
            twoSum.getTestCases().add(new Assignment.TestCase("[2,7,11,15]\n9", "[0,1]", false));
            twoSum.getTestCases().add(new Assignment.TestCase("[3,2,4]\n6", "[1,2]", false));
            twoSum.getTestCases().add(new Assignment.TestCase("[3,3]\n6", "[0,1]", true));

            assignmentService.save(twoSum);
            System.out.println("✅ Created Two Sum assignment");

            // Palindrome Check - Medium
            Assignment palindrome = new Assignment();
            palindrome.setTitle("Valid Palindrome");
            palindrome.setDescription("Check if a string is a valid palindrome.");
            palindrome.setCourseId("1"); // Java course
            palindrome.setInstructorId("2"); // instructor user
            palindrome.setType(Assignment.AssignmentType.CODING);
            palindrome.setDifficulty(Assignment.Difficulty.MEDIUM);
            palindrome.setProgrammingLanguage("java");
            palindrome.setTimeLimit(45);
            palindrome.setPoints(150);
            palindrome.setPublished(true);

            palindrome.setProblemStatement(
                "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\n" +
                "Given a string s, return true if it is a palindrome, or false otherwise."
            );

            palindrome.setStarterCode(
                "class Solution {\n" +
                "    public boolean isPalindrome(String s) {\n" +
                "        // Your code here\n" +
                "        \n" +
                "    }\n" +
                "}"
            );

            palindrome.getExamples().add(new Assignment.Example(
                "s = \"A man, a plan, a canal: Panama\"",
                "true",
                "\"amanaplanacanalpanama\" is a palindrome."
            ));

            palindrome.getTestCases().add(new Assignment.TestCase("\"A man, a plan, a canal: Panama\"", "true", false));
            palindrome.getTestCases().add(new Assignment.TestCase("\"race a car\"", "false", false));

            assignmentService.save(palindrome);
            System.out.println("✅ Created Palindrome assignment");

        } catch (Exception e) {
            System.err.println("❌ Error creating Java assignments: " + e.getMessage());
        }
    }

    private void createPythonAssignments() {
        try {
            // FizzBuzz - Easy
            Assignment fizzBuzz = new Assignment();
            fizzBuzz.setTitle("FizzBuzz Challenge");
            fizzBuzz.setDescription("Classic FizzBuzz problem implementation.");
            fizzBuzz.setCourseId("3"); // Python course
            fizzBuzz.setInstructorId("3"); // sarah_wilson
            fizzBuzz.setType(Assignment.AssignmentType.CODING);
            fizzBuzz.setDifficulty(Assignment.Difficulty.EASY);
            fizzBuzz.setProgrammingLanguage("python");
            fizzBuzz.setTimeLimit(20);
            fizzBuzz.setPoints(75);
            fizzBuzz.setPublished(true);

            fizzBuzz.setProblemStatement(
                "Given an integer n, return a string array answer (1-indexed) where:\n\n" +
                "• answer[i] == \"FizzBuzz\" if i is divisible by 3 and 5.\n" +
                "• answer[i] == \"Fizz\" if i is divisible by 3.\n" +
                "• answer[i] == \"Buzz\" if i is divisible by 5.\n" +
                "• answer[i] == i (as a string) if none of the above conditions are true."
            );

            fizzBuzz.setStarterCode(
                "def fizzBuzz(n):\n" +
                "    \"\"\"\n" +
                "    :type n: int\n" +
                "    :rtype: List[str]\n" +
                "    \"\"\"\n" +
                "    # Your code here\n" +
                "    pass"
            );

            fizzBuzz.getExamples().add(new Assignment.Example(
                "n = 3",
                "[\"1\",\"2\",\"Fizz\"]",
                "For numbers 1, 2, 3: 1 and 2 are returned as strings, 3 is divisible by 3 so \"Fizz\"."
            ));

            fizzBuzz.getTestCases().add(new Assignment.TestCase("3", "[\"1\",\"2\",\"Fizz\"]", false));
            fizzBuzz.getTestCases().add(new Assignment.TestCase("5", "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]", false));

            assignmentService.save(fizzBuzz);
            System.out.println("✅ Created FizzBuzz assignment");

        } catch (Exception e) {
            System.err.println("❌ Error creating Python assignments: " + e.getMessage());
        }
    }

    private void createReactAssignments() {
        try {
            // Component Design - Medium
            Assignment component = new Assignment();
            component.setTitle("React Component Design");
            component.setDescription("Create a reusable React component with props and state.");
            component.setCourseId("2"); // React course
            component.setInstructorId("2"); // instructor user
            component.setType(Assignment.AssignmentType.CODING);
            component.setDifficulty(Assignment.Difficulty.MEDIUM);
            component.setProgrammingLanguage("javascript");
            component.setTimeLimit(60);
            component.setPoints(200);
            component.setPublished(true);

            component.setProblemStatement(
                "Create a React component called 'Counter' that:\n\n" +
                "1. Displays a count starting from 0\n" +
                "2. Has increment and decrement buttons\n" +
                "3. Accepts an optional 'step' prop (default: 1)\n" +
                "4. Prevents count from going below 0"
            );

            component.setStarterCode(
                "import React, { useState } from 'react';\n\n" +
                "function Counter({ step = 1 }) {\n" +
                "  // Your code here\n" +
                "  \n" +
                "}\n\n" +
                "export default Counter;"
            );

            component.getExamples().add(new Assignment.Example(
                "<Counter step={2} />",
                "A counter that increments/decrements by 2",
                "Component should render with buttons and display current count."
            ));

            assignmentService.save(component);
            System.out.println("✅ Created React Component assignment");

        } catch (Exception e) {
            System.err.println("❌ Error creating React assignments: " + e.getMessage());
        }
    }
}
