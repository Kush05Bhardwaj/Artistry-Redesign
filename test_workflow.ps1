# Test Workflow Script - Start Backend Services and Frontend Dev Server
# This script starts all services needed to test the full workflow

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "    Artistry AI - Full Workflow Test" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Check if services are already running
$servicesRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend services are already running!" -ForegroundColor Green
        $servicesRunning = $true
    }
} catch {
    Write-Host "✗ Backend services not running" -ForegroundColor Yellow
}

# Start backend services if not running
if (-not $servicesRunning) {
    Write-Host "`n[1/2] Starting Backend Services..." -ForegroundColor Cyan
    Write-Host "This will start all 5 microservices (Gateway, Detect, Segment, Advise, Generate)" -ForegroundColor Gray
    
    $backendDir = Join-Path $PSScriptRoot "artistry-backend"
    $startScript = Join-Path $backendDir "start_services.ps1"
    
    if (Test-Path $startScript) {
        Write-Host "Launching services in new window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$startScript`""
        
        # Wait for services to start
        Write-Host "Waiting for services to initialize (20 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 20
        
        # Check if gateway is responding
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ Gateway service is up!" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠ Gateway service may still be starting..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ Could not find start_services.ps1 script" -ForegroundColor Red
        Write-Host "Please start backend services manually from artistry-backend folder" -ForegroundColor Yellow
    }
}

# Check if frontend is already running
$frontendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Frontend is already running!" -ForegroundColor Green
        $frontendRunning = $true
    }
} catch {
    Write-Host "✗ Frontend not running" -ForegroundColor Yellow
}

# Start frontend dev server if not running
if (-not $frontendRunning) {
    Write-Host "`n[2/2] Starting Frontend Dev Server..." -ForegroundColor Cyan
    
    $frontendDir = Join-Path $PSScriptRoot "frontend"
    
    if (Test-Path $frontendDir) {
        Write-Host "Launching Vite dev server in new window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"
        
        Write-Host "Waiting for dev server to start (10 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Write-Host "✗ Could not find frontend folder" -ForegroundColor Red
    }
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "    Setup Complete!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  • Gateway:  http://localhost:8000" -ForegroundColor White
Write-Host "  • Detect:   http://localhost:8001" -ForegroundColor White
Write-Host "  • Segment:  http://localhost:8002" -ForegroundColor White
Write-Host "  • Advise:   http://localhost:8003" -ForegroundColor White
Write-Host "  • Generate: http://localhost:8004" -ForegroundColor White
Write-Host "  • Frontend: http://localhost:5173" -ForegroundColor White

Write-Host "`nTo test the Full Workflow:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host "  2. Click 'Full Workflow' in the navigation" -ForegroundColor Yellow
Write-Host "  3. Upload an image and click 'Start Complete Workflow'" -ForegroundColor Yellow
Write-Host "  4. Watch as the image flows through all services automatically!" -ForegroundColor Yellow

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
