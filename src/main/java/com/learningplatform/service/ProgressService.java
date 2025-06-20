package com.learningplatform.service;

import com.learningplatform.model.Progress;
import com.learningplatform.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository progressRepository;

    public Progress getOrCreateProgress(String studentId, String courseId) {
        Optional<Progress> existingProgress = progressRepository.findByStudentIdAndCourseId(studentId, courseId);
        
        if (existingProgress.isPresent()) {
            return existingProgress.get();
        }
        
        Progress newProgress = new Progress(studentId, courseId);
        return progressRepository.save(newProgress);
    }

    public Progress updateLessonProgress(String studentId, String courseId, String lessonId, 
                                       boolean completed, int timeSpent) {
        Progress progress = getOrCreateProgress(studentId, courseId);
        
        Progress.LessonProgress lessonProgress = progress.getLessonProgress()
            .getOrDefault(lessonId, new Progress.LessonProgress(lessonId));
        
        lessonProgress.setCompleted(completed);
        lessonProgress.setTimeSpentMinutes(lessonProgress.getTimeSpentMinutes() + timeSpent);
        
        if (completed && lessonProgress.getCompletedAt() == null) {
            lessonProgress.setCompletedAt(LocalDateTime.now());
        }
        
        progress.getLessonProgress().put(lessonId, lessonProgress);
        progress.setLastAccessedAt(LocalDateTime.now());
        progress.setTotalTimeSpentMinutes(progress.getTotalTimeSpentMinutes() + timeSpent);
        
        // Update completion percentage
        updateCompletionPercentage(progress);
        
        return progressRepository.save(progress);
    }

    public Progress updateVideoProgress(String studentId, String courseId, String lessonId, 
                                      int watchedPercentage) {
        Progress progress = getOrCreateProgress(studentId, courseId);
        
        Progress.LessonProgress lessonProgress = progress.getLessonProgress()
            .getOrDefault(lessonId, new Progress.LessonProgress(lessonId));
        
        lessonProgress.setWatchedPercentage(Math.max(lessonProgress.getWatchedPercentage(), watchedPercentage));
        
        // Consider lesson completed if watched >= 90%
        if (watchedPercentage >= 90 && !lessonProgress.isCompleted()) {
            lessonProgress.setCompleted(true);
            lessonProgress.setCompletedAt(LocalDateTime.now());
        }
        
        progress.getLessonProgress().put(lessonId, lessonProgress);
        progress.setLastAccessedAt(LocalDateTime.now());
        
        // Update completion percentage
        updateCompletionPercentage(progress);
        
        return progressRepository.save(progress);
    }

    public Progress recordQuizAttempt(String studentId, String courseId, String quizId, 
                                    Map<String, String> answers, int score, int totalQuestions, 
                                    boolean passed, int timeSpent) {
        Progress progress = getOrCreateProgress(studentId, courseId);
        
        Progress.QuizAttempt attempt = new Progress.QuizAttempt();
        attempt.setQuizId(quizId);
        attempt.setScore(score);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setCorrectAnswers((score * totalQuestions) / 100);
        attempt.setPassed(passed);
        attempt.setTimeSpentMinutes(timeSpent);
        attempt.setAnswers(answers);
        
        progress.getQuizAttempts().add(attempt);
        progress.setTotalQuizAttempts(progress.getTotalQuizAttempts() + 1);
        progress.setLastAccessedAt(LocalDateTime.now());
        
        // Update average quiz score
        updateAverageQuizScore(progress);
        
        // Update completion percentage
        updateCompletionPercentage(progress);
        
        return progressRepository.save(progress);
    }

    public Optional<Progress> getProgress(String studentId, String courseId) {
        return progressRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    public List<Progress> getStudentProgress(String studentId) {
        return progressRepository.findByStudentId(studentId);
    }

    public List<Progress> getCourseProgress(String courseId) {
        return progressRepository.findByCourseId(courseId);
    }

    public List<Progress> getCompletedCourses(String studentId) {
        return progressRepository.findCompletedCoursesByStudent(studentId);
    }

    private void updateCompletionPercentage(Progress progress) {
        // Simple calculation based on completed lessons
        Map<String, Progress.LessonProgress> lessonProgress = progress.getLessonProgress();
        if (lessonProgress.isEmpty()) {
            progress.setCompletionPercentage(0);
            return;
        }
        
        long completedLessons = lessonProgress.values().stream()
            .mapToLong(lp -> lp.isCompleted() ? 1 : 0)
            .sum();
        
        int percentage = (int) ((completedLessons * 100) / lessonProgress.size());
        progress.setCompletionPercentage(percentage);
        
        // Mark course as completed if 100%
        if (percentage == 100 && !progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }
    }

    private void updateAverageQuizScore(Progress progress) {
        List<Progress.QuizAttempt> attempts = progress.getQuizAttempts();
        if (attempts.isEmpty()) {
            progress.setAverageQuizScore(0.0);
            return;
        }
        
        double average = attempts.stream()
            .mapToInt(Progress.QuizAttempt::getScore)
            .average()
            .orElse(0.0);
        
        progress.setAverageQuizScore(average);
    }

    public void enrollStudent(String studentId, String courseId) {
        Optional<Progress> existingProgress = progressRepository.findByStudentIdAndCourseId(studentId, courseId);
        
        if (existingProgress.isEmpty()) {
            Progress progress = new Progress(studentId, courseId);
            progressRepository.save(progress);
        }
    }

    public boolean isStudentEnrolled(String studentId, String courseId) {
        return progressRepository.findByStudentIdAndCourseId(studentId, courseId).isPresent();
    }

    public Double getAverageCompletionRate(String courseId) {
        return progressRepository.getAverageCompletionByCourse(courseId);
    }

    public long getEnrollmentCount(String courseId) {
        return progressRepository.countEnrollmentsByCourse(courseId);
    }
}
