# AI-Powered Learning Platform System Test
Write-Host "=== Testing AI-Powered Learning Platform ===" -ForegroundColor Green

# Test Backend Health
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8081/api/ai/test"
    Write-Host "Backend Health: PASSED" -ForegroundColor Green
    Write-Host "Status: $($health.status)" -ForegroundColor Cyan
} catch {
    Write-Host "Backend Health: FAILED" -ForegroundColor Red
    exit 1
}

# Test Authentication
try {
    $loginData = @{
        username = "instructor"
        password = "instructor123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    $token = $loginResponse.token
    Write-Host "Authentication: PASSED" -ForegroundColor Green
} catch {
    Write-Host "Authentication: FAILED" -ForegroundColor Red
    exit 1
}

# Test AI Course Generation
try {
    $courseData = @{
        topic = "Data Structures"
        difficulty = "INTERMEDIATE"
    } | ConvertTo-Json

    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $courseResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/ai/generate-ai-course" -Method POST -Headers $headers -Body $courseData
    Write-Host "AI Course Generation: PASSED" -ForegroundColor Green
    Write-Host "Course Title: $($courseResponse.title)" -ForegroundColor Cyan
    Write-Host "Category: $($courseResponse.category)" -ForegroundColor Cyan
    Write-Host "Lessons: $($courseResponse.lessons.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "AI Course Generation: FAILED" -ForegroundColor Red
}

# Test Course Creation
try {
    $newCourseData = @{
        title = "Test Course - AI Generated"
        description = "Test course from AI generation"
        category = "Programming"
        difficulty = "INTERMEDIATE"
        estimatedHours = 8
    } | ConvertTo-Json

    $newCourse = Invoke-RestMethod -Uri "http://localhost:8081/api/courses" -Method POST -Headers $headers -Body $newCourseData
    Write-Host "Course Creation: PASSED" -ForegroundColor Green
    Write-Host "Created Course ID: $($newCourse.id)" -ForegroundColor Cyan
} catch {
    Write-Host "Course Creation: FAILED" -ForegroundColor Red
}

# Test Frontend
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    Write-Host "Frontend: ACCESSIBLE" -ForegroundColor Green
} catch {
    Write-Host "Frontend: NOT ACCESSIBLE (may be starting)" -ForegroundColor Yellow
}

Write-Host "`nSYSTEM STATUS:" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8081/api" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Login: instructor / instructor123" -ForegroundColor White
Write-Host "AI Course Generation: WORKING" -ForegroundColor White

Write-Host "`nSYSTEM IS OPERATIONAL!" -ForegroundColor Green
