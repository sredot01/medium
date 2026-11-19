# PowerShell script to test bookmarks API

Write-Host "`n📡 Testing Bookmarks API...`n" -ForegroundColor Cyan

# 1. Login
Write-Host "1. Logging in as John Doe..." -ForegroundColor Yellow
$loginBody = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.data.user.name)" -ForegroundColor White
    $token = $loginResponse.data.token
    Write-Host "Token: $($token.Substring(0, 50))...`n" -ForegroundColor Gray

    # 2. Get bookmarks
    Write-Host "2. Fetching bookmarks..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $bookmarksResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/posts/bookmarks" `
        -Method Get `
        -Headers $headers

    Write-Host "✅ Bookmarks API response:" -ForegroundColor Green
    Write-Host "Success: $($bookmarksResponse.success)" -ForegroundColor White
    Write-Host "Count: $($bookmarksResponse.count)" -ForegroundColor White
    Write-Host "Bookmarks: $($bookmarksResponse.data.Count)" -ForegroundColor White

    if ($bookmarksResponse.data.Count -gt 0) {
        Write-Host "`n📚 Bookmark details:" -ForegroundColor Cyan
        foreach ($bookmark in $bookmarksResponse.data) {
            Write-Host "  • $($bookmark.title)" -ForegroundColor White
            Write-Host "    Author: $($bookmark.author)" -ForegroundColor Gray
            Write-Host "    Slug: $($bookmark.slug)" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "`n❌ No bookmarks returned!" -ForegroundColor Red
    }

}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host ""

