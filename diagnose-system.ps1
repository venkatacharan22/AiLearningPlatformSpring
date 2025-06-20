# Comprehensive System Diagnosis
Write-Host "=== COMPREHENSIVE SYSTEM DIAGNOSIS ===" -ForegroundColor Green

# Test 1: Check if backend is running
Write-Host "`n1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8081/api/ai/test" -TimeoutSec 5
    Write-Host "✅ Backend: RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: NOT RUNNING" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Authentication
Write-Host "`n2. Testing Authentication..." -ForegroundColor Yellow
$loginData = @{
    username = "instructor"
    password = "instructor123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    $token = $loginResponse.token
    Write-Host "✅ Authentication: SUCCESS" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Authentication: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 3: AI Course Generation
Write-Host "`n3. Testing AI Course Generation..." -ForegroundColor Yellow
$aiCourseData = @{
    topic = "JavaScript Fundamentals"
    difficulty = "BEGINNER"
} | ConvertTo-Json

try {
    $aiCourse = Invoke-RestMethod -Uri "http://localhost:8081/api/ai/generate-ai-course" -Method POST -Headers $headers -Body $aiCourseData
    Write-Host "✅ AI Course Generation: SUCCESS" -ForegroundColor Green
    Write-Host "   Course Title: $($aiCourse.title)" -ForegroundColor Cyan
    Write-Host "   Lessons Count: $($aiCourse.lessons.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ AI Course Generation: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: YouTube Video Search
Write-Host "`n4. Testing YouTube Video Search..." -ForegroundColor Yellow
$videoData = @{
    courseTitle = "JavaScript Fundamentals"
    topics = @("Variables", "Functions", "Objects")
} | ConvertTo-Json

try {
    $videos = Invoke-RestMethod -Uri "http://localhost:8081/api/ai/find-youtube-videos" -Method POST -Headers $headers -Body $videoData
    Write-Host "✅ YouTube Video Search: SUCCESS" -ForegroundColor Green
    Write-Host "   Videos Found: $($videos.Count)" -ForegroundColor Cyan
    foreach ($video in $videos[0..2]) {
        Write-Host "   - $($video.title)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ YouTube Video Search: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Course Creation
Write-Host "`n5. Testing Course Creation..." -ForegroundColor Yellow
$courseData = @{
    title = "Test Course - Diagnosis"
    description = "A test course for system diagnosis"
    category = "Programming"
    difficulty = "BEGINNER"
    estimatedHours = 3
    outline = "Basic course outline"
    summary = "Course summary"
    lessons = @(
        @{
            title = "Introduction"
            content = "Course introduction"
            durationMinutes = 30
            order = 1
        },
        @{
            title = "Getting Started"
            content = "Getting started with basics"
            durationMinutes = 45
            order = 2
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $createdCourse = Invoke-RestMethod -Uri "http://localhost:8081/api/courses" -Method POST -Headers $headers -Body $courseData
    Write-Host "✅ Course Creation: SUCCESS" -ForegroundColor Green
    Write-Host "   Course ID: $($createdCourse.id)" -ForegroundColor Cyan
    Write-Host "   Course Title: $($createdCourse.title)" -ForegroundColor Cyan
    $testCourseId = $createdCourse.id
} catch {
    Write-Host "❌ Course Creation: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

# Test 6: Instructor Courses API
Write-Host "`n6. Testing Instructor Courses API..." -ForegroundColor Yellow
try {
    $instructorCourses = Invoke-RestMethod -Uri "http://localhost:8081/api/instructor/courses" -Method GET -Headers $headers
    Write-Host "✅ Instructor Courses API: SUCCESS" -ForegroundColor Green
    Write-Host "   Total Courses: $($instructorCourses.Count)" -ForegroundColor Cyan
    
    if ($testCourseId) {
        $foundCourse = $instructorCourses | Where-Object { $_.id -eq $testCourseId }
        if ($foundCourse) {
            Write-Host "✅ New Course Found in Dashboard: SUCCESS" -ForegroundColor Green
        } else {
            Write-Host "❌ New Course NOT Found in Dashboard: ISSUE DETECTED" -ForegroundColor Red
        }
    }
    
    Write-Host "   Course List:" -ForegroundColor Cyan
    foreach ($course in $instructorCourses[0..4]) {
        Write-Host "   - $($course.title) (ID: $($course.id))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Instructor Courses API: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== DIAGNOSIS COMPLETE ===" -ForegroundColor Green
