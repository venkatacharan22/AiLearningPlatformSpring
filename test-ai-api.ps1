# Test AI Course Generation API
$body = @{
    topic = "JavaScript Fundamentals"
    difficulty = "INTERMEDIATE"
} | ConvertTo-Json

Write-Host "Testing AI Course Generation API..."
Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8081/api/ai/generate-ai-course' -Method POST -ContentType 'application/json' -Body $body
    Write-Host "✅ Success! Course generated:"
    Write-Host "Title: $($response.title)"
    Write-Host "Category: $($response.category)"
    Write-Host "Difficulty: $($response.difficulty)"
    Write-Host "Estimated Hours: $($response.estimatedHours)"
    Write-Host "Number of Lessons: $($response.lessons.Count)"
    
    # Show first lesson
    if ($response.lessons -and $response.lessons.Count -gt 0) {
        Write-Host "First Lesson: $($response.lessons[0].title)"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
