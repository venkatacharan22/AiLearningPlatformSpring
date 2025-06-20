# Test Instructor API
Write-Host "=== Testing Instructor API ===" -ForegroundColor Green

# Login
$loginData = @{
    username = "instructor"
    password = "instructor123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    $token = $loginResponse.token
    Write-Host "Login: SUCCESS" -ForegroundColor Green
    
    # Test instructor courses API
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $coursesResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/instructor/courses" -Method GET -Headers $headers
    Write-Host "Instructor Courses API: SUCCESS" -ForegroundColor Green
    Write-Host "Found $($coursesResponse.Count) courses" -ForegroundColor Cyan
    
    foreach ($course in $coursesResponse) {
        Write-Host "- Course: $($course.title) (ID: $($course.id))" -ForegroundColor White
    }
    
    # Test video search API
    $videoData = @{
        courseTitle = "Test Course"
        topics = @("Introduction", "Advanced Topics")
    } | ConvertTo-Json
    
    $videoResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/ai/find-youtube-videos" -Method POST -Headers $headers -Body $videoData
    Write-Host "Video Search API: SUCCESS" -ForegroundColor Green
    Write-Host "Found $($videoResponse.Count) videos" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
