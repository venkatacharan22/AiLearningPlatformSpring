# Test Course Creation
Write-Host "=== Testing Course Creation ===" -ForegroundColor Green

$loginData = @{
    username = "instructor"
    password = "instructor123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    $token = $loginResponse.token
    Write-Host "Login: SUCCESS" -ForegroundColor Green
    
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Count courses before
    $coursesBefore = Invoke-RestMethod -Uri "http://localhost:8081/api/instructor/courses" -Method GET -Headers $headers
    Write-Host "Courses before: $($coursesBefore.Count)" -ForegroundColor Cyan
    
    # Create course
    $courseData = @{
        title = "Test Course - Manual"
        description = "A test course"
        category = "Programming"
        difficulty = "BEGINNER"
        estimatedHours = 5
        outline = "Basic outline"
        summary = "Course summary"
        lessons = @(
            @{
                title = "Lesson 1"
                content = "Content 1"
                durationMinutes = 30
                order = 1
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $createdCourse = Invoke-RestMethod -Uri "http://localhost:8081/api/courses" -Method POST -Headers $headers -Body $courseData
    Write-Host "Course Created: ID $($createdCourse.id)" -ForegroundColor Green
    
    # Count courses after
    $coursesAfter = Invoke-RestMethod -Uri "http://localhost:8081/api/instructor/courses" -Method GET -Headers $headers
    Write-Host "Courses after: $($coursesAfter.Count)" -ForegroundColor Cyan
    
    if ($coursesAfter.Count -gt $coursesBefore.Count) {
        Write-Host "SUCCESS: Course saved and visible in dashboard!" -ForegroundColor Green
    } else {
        Write-Host "ISSUE: Course not appearing in dashboard" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
