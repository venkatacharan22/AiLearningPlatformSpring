# Test all demo users
$users = @(
    @{ username = "admin"; password = "admin123" },
    @{ username = "instructor"; password = "instructor123" },
    @{ username = "student"; password = "student123" }
)

foreach ($user in $users) {
    $body = $user | ConvertTo-Json

    Write-Host "Testing login for: $($user.username)"

    try {
        $response = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
        Write-Host "✅ Login successful for $($user.username)!"
        Write-Host "Role: $($response.role), Token: $($response.token.Substring(0,20))..."
        Write-Host ""
    } catch {
        Write-Host "❌ Login failed for $($user.username): $($_.Exception.Message)"
        Write-Host ""
    }
}
