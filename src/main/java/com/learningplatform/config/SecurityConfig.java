package com.learningplatform.config;

import com.learningplatform.security.JwtAuthenticationEntryPoint;
import com.learningplatform.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/setup/**").permitAll()
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/ai/**").permitAll() // AI endpoints - MUST BE FIRST
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/courses/public").permitAll()
                        .requestMatchers("/courses/search").permitAll()
                        .requestMatchers("/courses/category/**").permitAll()
                        .requestMatchers("/courses/difficulty/**").permitAll()
                        .requestMatchers("/courses/*/quiz").permitAll()
                        .requestMatchers(HttpMethod.GET, "/courses/*").permitAll()
                        .requestMatchers("/courses/*/enroll").hasAnyRole("ADMIN", "INSTRUCTOR", "STUDENT")
                        .requestMatchers("/courses/*/enrollment-status").hasAnyRole("ADMIN", "INSTRUCTOR", "STUDENT")
                        .requestMatchers("/course-details/**").permitAll()
                        .requestMatchers("/profile/**").hasAnyRole("ADMIN", "INSTRUCTOR", "STUDENT")
                        .requestMatchers("/iq-test/**").hasAnyRole("ADMIN", "INSTRUCTOR", "STUDENT")
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/instructor/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers("/student/**").hasAnyRole("ADMIN", "INSTRUCTOR", "STUDENT")
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions().disable()); // For H2 console

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
