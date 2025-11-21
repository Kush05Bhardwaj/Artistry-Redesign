# Test All Artistry Services
# This script tests the health endpoints of all backend services

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Artistry Services Health Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Gateway"; URL="http://localhost:8000"; Color="Green"},
    @{Name="Detect"; URL="http://localhost:8001"; Color="Yellow"},
    @{Name="Segment"; URL="http://localhost:8002"; Color="Blue"},
    @{Name="Advise"; URL="http://localhost:8003"; Color="Magenta"},
    @{Name="Generate"; URL="http://localhost:8004"; Color="Cyan"}
)

$allHealthy = $true

foreach ($service in $services) {
    try {
        Write-Host "Testing $($service.Name) Service... " -NoNewline -ForegroundColor White
        $response = Invoke-WebRequest -Uri $service.URL -Method GET -TimeoutSec 5 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ ONLINE" -ForegroundColor $service.Color
            $content = $response.Content | ConvertFrom-Json
            Write-Host "  → $($content.service)" -ForegroundColor Gray
        } else {
            Write-Host "✗ FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            $allHealthy = $false
        }
    }
    catch {
        Write-Host "✗ OFFLINE" -ForegroundColor Red
        Write-Host "  → Error: $($_.Exception.Message)" -ForegroundColor Gray
        $allHealthy = $false
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan

if ($allHealthy) {
    Write-Host "All services are running! ✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor White
    Write-Host "  1. Open http://localhost:5173 in your browser" -ForegroundColor Gray
    Write-Host "  2. Upload room images" -ForegroundColor Gray
    Write-Host "  3. Test each AI service" -ForegroundColor Gray
} else {
    Write-Host "Some services are not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start all services, run:" -ForegroundColor White
    Write-Host "  cd artistry-backend" -ForegroundColor Gray
    Write-Host "  .\start_services.ps1" -ForegroundColor Gray
}

Write-Host "=====================================" -ForegroundColor Cyan
