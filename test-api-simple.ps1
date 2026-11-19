# Simple API test
Write-Host "Testing Bookmarks API..." -ForegroundColor Cyan

# Login
$body = '{"email":"john@example.com","password":"password123"}'
$loginUrl = "http://localhost:5000/api/auth/login"

Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginResp = Invoke-WebRequest -Uri $loginUrl -Method Post -Body $body -ContentType "application/json" | ConvertFrom-Json

$token = $loginResp.data.token
Write-Host "   Token received: $($token.Substring(0,30))..." -ForegroundColor Green

# Get bookmarks
Write-Host "`n2. Getting bookmarks..." -ForegroundColor Yellow
$bookmarksUrl = "http://localhost:5000/api/posts/bookmarks"
$headers = @{ "Authorization" = "Bearer $token" }

$bookmarksResp = Invoke-WebRequest -Uri $bookmarksUrl -Method Get -Headers $headers | ConvertFrom-Json

Write-Host "   Success: $($bookmarksResp.success)" -ForegroundColor White
Write-Host "   Count: $($bookmarksResp.count)" -ForegroundColor White
Write-Host "   Data items: $($bookmarksResp.data.Count)" -ForegroundColor White

if ($bookmarksResp.data.Count -gt 0) {
    Write-Host "`nBookmarks found:" -ForegroundColor Green
    $bookmarksResp.data | ForEach-Object {
        Write-Host "   - $($_.title)" -ForegroundColor White
    }
}
else {
    Write-Host "`nNO BOOKMARKS RETURNED!" -ForegroundColor Red
}

