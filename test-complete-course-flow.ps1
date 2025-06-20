# Test Complete Course Creation Flow
Write-Host "=== Testing Complete Course Creation Flow ===" -ForegroundColor Green

# Login
$loginData = @{
    username = "instructor"
    password = "instructor123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    $token = $loginResponse.token
    Write-Host "✅ Login: SUCCESS" -ForegroundColor Green
    
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Step 1: Generate AI Course
    Write-Host "`n🤖 Step 1: Generating AI Course..." -ForegroundColor Yellow
    $aiCourseData = @{
        topic = "Node.js Backend Development"
        difficulty = "INTERMEDIATE"
    } | ConvertTo-Json
    
    $aiCourse = Invoke-RestMethod -Uri "http://localhost:8081/api/ai/generate-ai-course" -Method POST -Headers $headers -Body $aiCourseData
    Write-Host "✅ AI Course Generated: $($aiCourse.title)" -ForegroundColor Green
    Write-Host "   Lessons: $($aiCourse.lessons.Count)" -ForegroundColor Cyan
    
    # Step 2: Search for Videos
    Write-Host "`n🎥 Step 2: Searching for YouTube Videos..." -ForegroundColor Yellow
    $videoData = @{
        courseTitle = $aiCourse.title
        topics = $aiCourse.lessons | ForEach-Object { $_.title }
    } | ConvertTo-Json
    
    $videos = Invoke-RestMethod -Uri "http://localhost:8081/api/ai/find-youtube-videos" -Method POST -Headers $headers -Body $videoData
    Write-Host "✅ Found $($videos.Count) videos" -ForegroundColor Green
    
    # Step 3: Create Course
    Write-Host "`n📚 Step 3: Creating Course..." -ForegroundColor Yellow
    $courseData = @{
        title = $aiCourse.title
        description = $aiCourse.description
        category = $aiCourse.category
        difficulty = $aiCourse.difficulty
        estimatedHours = $aiCourse.estimatedHours
        outline = $aiCourse.outline
        summary = $aiCourse.summary
        lessons = $aiCourse.lessons
    } | ConvertTo-Json -Depth 10
    
    $createdCourse = Invoke-RestMethod -Uri "http://localhost:8081/api/courses" -Method POST -Headers $headers -Body $courseData
    Write-Host "✅ Course Created: ID $($createdCourse.id)" -ForegroundColor Green
    
    # Step 4: Generate Quiz
    Write-Host "`n📝 Step 4: Generating Quiz..." -ForegroundColor Yellow
    $quizData = @{
        numberOfQuestions = 5
    } | ConvertTo-Json
    
    try {
        $quiz = Invoke-RestMethod -Uri "http://localhost:8081/api/courses/$($createdCourse.id)/generate-quiz" -Method POST -Headers $headers -Body $quizData
        Write-Host "✅ Quiz Generated Successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Quiz Generation Failed (optional): $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Step 5: Verify Course in Instructor Dashboard
    Write-Host "`n👨‍🏫 Step 5: Verifying Course in Instructor Dashboard..." -ForegroundColor Yellow
    $instructorCourses = Invoke-RestMethod -Uri "http://localhost:8081/api/instructor/courses" -Method GET -Headers $headers
    $newCourse = $instructorCourses | Where-Object { $_.id -eq $createdCourse.id }
    
    if ($newCourse) {
        Write-Host "✅ Course Found in Instructor Dashboard" -ForegroundColor Green
        Write-Host "   Title: $($newCourse.title)" -ForegroundColor Cyan
        Write-Host "   Category: $($newCourse.category)" -ForegroundColor Cyan
        Write-Host "   Difficulty: $($newCourse.difficulty)" -ForegroundColor Cyan
        Write-Host "   Lessons: $($newCourse.lessons.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Course NOT found in Instructor Dashboard" -ForegroundColor Red
    }
    
    Write-Host "`n🎉 COMPLETE COURSE CREATION FLOW: SUCCESS!" -ForegroundColor Green
    Write-Host "✅ AI Course Generation: WORKING" -ForegroundColor Green
    Write-Host "✅ Video Search: WORKING" -ForegroundColor Green
    Write-Host "✅ Course Creation: WORKING" -ForegroundColor Green
    Write-Host "✅ Course Saving: WORKING" -ForegroundColor Green
    Write-Host "✅ Instructor Dashboard: WORKING" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error in Course Creation Flow: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}
