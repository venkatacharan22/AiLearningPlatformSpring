package com.learningplatform.config;

import com.learningplatform.model.Assignment;
import com.learningplatform.model.Course;
import com.learningplatform.model.User;
import com.learningplatform.repository.AssignmentRepository;
import com.learningplatform.repository.CourseRepository;
import com.learningplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.metamodel.EntityType;
import java.util.Set;

/**
 * JPA Configuration to ensure all entities and repositories are properly scanned
 */
@Configuration
@EnableTransactionManagement
public class JpaConfig {

    @Autowired(required = false)
    private EntityManagerFactory entityManagerFactory;

    @PostConstruct
    public void init() {
        System.out.println("[JPA] Configuration initialized");
        System.out.println("[JPA] Entity classes to be scanned:");
        System.out.println("   - " + Assignment.class.getName());
        System.out.println("   - " + Course.class.getName());
        System.out.println("   - " + User.class.getName());
        System.out.println("[JPA] Repository scanning enabled for: com.learningplatform.repository");

        // Force class loading to ensure entities are available
        try {
            Class.forName("com.learningplatform.model.Assignment");
            Class.forName("com.learningplatform.repository.AssignmentRepository");
            System.out.println("[SUCCESS] Assignment entity and repository classes loaded successfully");

            // Check if Assignment entity is registered with JPA
            if (entityManagerFactory != null) {
                Set<EntityType<?>> entities = entityManagerFactory.getMetamodel().getEntities();
                boolean assignmentFound = false;
                System.out.println("[JPA] Registered JPA entities:");
                for (EntityType<?> entity : entities) {
                    System.out.println("   - " + entity.getJavaType().getName());
                    if (entity.getJavaType().equals(Assignment.class)) {
                        assignmentFound = true;
                    }
                }

                if (assignmentFound) {
                    System.out.println("[SUCCESS] Assignment entity is properly registered with JPA");
                } else {
                    System.err.println("[ERROR] Assignment entity is NOT registered with JPA");
                }
            }

        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR] Failed to load Assignment classes: " + e.getMessage());
        }
    }
}
