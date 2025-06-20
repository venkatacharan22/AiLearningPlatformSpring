package com.learningplatform.security;

import com.learningplatform.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain chain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Debug logging
        System.out.println("🔍 JWT Filter - Request Path: " + requestPath);
        System.out.println("🔍 JWT Filter - Is Public: " + isPublicEndpoint(requestPath));

        // Skip JWT processing for public endpoints
        if (isPublicEndpoint(requestPath)) {
            System.out.println("✅ JWT Filter - Skipping authentication for public endpoint: " + requestPath);
            chain.doFilter(request, response);
            return;
        }

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // JWT Token is in the form "Bearer token". Remove Bearer word and get only the Token
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwtToken);
            } catch (IllegalArgumentException e) {
                logger.error("Unable to get JWT Token");
            } catch (Exception e) {
                logger.error("JWT Token has expired");
            }
        } else {
            logger.warn("JWT Token does not begin with Bearer String");
        }

        // Once we get the token validate it.
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Validate token
            if (jwtUtil.validateToken(jwtToken, username)) {

                String role = jwtUtil.extractRole(jwtToken);
                String userId = jwtUtil.extractUserId(jwtToken);

                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set user ID in the authentication details for easy access
                request.setAttribute("userId", userId);
                request.setAttribute("userRole", role);

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String requestPath) {
        // The request path already includes the context path, so we check directly
        return requestPath.startsWith("/api/auth/") ||
               requestPath.startsWith("/api/ai/") ||
               requestPath.startsWith("/api/setup/") ||
               requestPath.startsWith("/api/public/") ||
               requestPath.startsWith("/api/uploads/") ||
               requestPath.startsWith("/api/h2-console/") ||
               requestPath.equals("/api/courses/public") ||
               requestPath.startsWith("/api/courses/search") ||
               requestPath.startsWith("/api/courses/category/") ||
               requestPath.startsWith("/api/courses/difficulty/") ||
               requestPath.matches("/api/courses/\\d+/quiz") ||
               requestPath.matches("/api/courses/\\d+") ||
               requestPath.startsWith("/api/course-details/");
    }
}
