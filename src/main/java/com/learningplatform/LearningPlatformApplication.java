package com.learningplatform;

import com.learningplatform.model.Assignment;
import com.learningplatform.model.Course;
import com.learningplatform.model.User;
import com.learningplatform.repository.AssignmentRepository;
import com.learningplatform.repository.CourseRepository;
import com.learningplatform.repository.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EntityScan(basePackages = "com.learningplatform.model",
           basePackageClasses = {Assignment.class, Course.class, User.class})
@EnableJpaRepositories(basePackages = "com.learningplatform.repository",
                      basePackageClasses = {AssignmentRepository.class, CourseRepository.class, UserRepository.class})
public class LearningPlatformApplication {

    public static void main(String[] args) {
        System.out.println("[STARTUP] Starting AI Learning Platform...");
        System.out.println("[STARTUP] Entities to scan: Assignment, Course, User");
        System.out.println("[STARTUP] Repositories to scan: AssignmentRepository, CourseRepository, UserRepository");
        SpringApplication.run(LearningPlatformApplication.class, args);
    }
}
