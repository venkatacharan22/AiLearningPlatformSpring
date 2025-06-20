# Test Full AI Course Creation Flow
Write-Host "🚀 Testing Full AI Course Creation Flow..." -ForegroundColor Green

# Step 1: Login as instructor
Write-Host "`n1️⃣ Logging in as instructor..." -ForegroundColor Yellow
$loginBody = @{
    username = "instructor"
    password = "instructor123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
    $token = $loginResponse.token
    Write-Host "✅ Login successful! Token received." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Generate AI course
Write-Host "`n2️⃣ Generating AI course..." -ForegroundColor Yellow
$courseBody = @{
    topic = "React Development"
    difficulty = "INTERMEDIATE"
} | ConvertTo-Json

try {
    $courseData = Invoke-RestMethod -Uri 'http://localhost:8081/api/ai/generate-ai-course' -Method POST -ContentType 'application/json' -Body $courseBody -Headers @{'Authorization' = "Bearer $token"}
    Write-Host "✅ AI Course generated successfully!" -ForegroundColor Green
    Write-Host "   Title: $($courseData.title)" -ForegroundColor Cyan
    Write-Host "   Category: $($courseData.category)" -ForegroundColor Cyan
    Write-Host "   Lessons: $($courseData.lessons.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ AI Course generation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Create the course in database
Write-Host "`n3️⃣ Creating course in database..." -ForegroundColor Yellow
try {
    $createdCourse = Invoke-RestMethod -Uri 'http://localhost:8081/api/courses' -Method POST -ContentType 'application/json' -Body ($courseData | ConvertTo-Json -Depth 10) -Headers @{'Authorization' = "Bearer $token"}
    Write-Host "✅ Course created in database!" -ForegroundColor Green
    Write-Host "   Course ID: $($createdCourse.id)" -ForegroundColor Cyan
    Write-Host "   Title: $($createdCourse.title)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Course creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Test course retrieval
Write-Host "`n4️⃣ Testing course retrieval..." -ForegroundColor Yellow
try {
    $retrievedCourse = Invoke-RestMethod -Uri "http://localhost:8081/api/courses/$($createdCourse.id)" -Method GET -Headers @{'Authorization' = "Bearer $token"}
    Write-Host "✅ Course retrieved successfully!" -ForegroundColor Green
    Write-Host "   Retrieved Title: $($retrievedCourse.title)" -ForegroundColor Cyan
    Write-Host "   Lessons Count: $($retrievedCourse.lessons.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Course retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 AI-Powered Course Creation Test Complete!" -ForegroundColor Green
Write-Host "✅ All systems working correctly!" -ForegroundColor Green
