# Artistry AI - Start All Services Script (PowerShell)
# Run this script to start all backend services and frontend

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Artistry AI - Starting All Services" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$Port,
        [string]$Path
    )
    
    Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Yellow
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "cd '$Path'; if (Test-Path 'venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; uvicorn app.main:app --port $Port --reload"
    
    Start-Sleep -Seconds 2
}

$BackendPath = "$PSScriptRoot\artistry-backend"

# Start Backend Services
Write-Host ""
Write-Host "Starting Backend Services..." -ForegroundColor Green
Write-Host ""

Start-Service -ServiceName "Detect Service" -Port "8001" -Path "$BackendPath\detect"
Start-Service -ServiceName "Segment Service" -Port "8002" -Path "$BackendPath\segment"
Start-Service -ServiceName "Advise Service" -Port "8003" -Path "$BackendPath\advise"
Start-Service -ServiceName "Generate Service" -Port "8004" -Path "$BackendPath\generate"
Start-Service -ServiceName "Commerce Service" -Port "8005" -Path "$BackendPath\commerce"
Start-Service -ServiceName "Gateway Service" -Port "8000" -Path "$BackendPath\gateway"

Write-Host ""
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend
Write-Host ""
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  All Services Started!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Services:" -ForegroundColor Yellow
Write-Host "  Gateway:  http://localhost:8000" -ForegroundColor White
Write-Host "  Detect:   http://localhost:8001" -ForegroundColor White
Write-Host "  Segment:  http://localhost:8002" -ForegroundColor White
Write-Host "  Advise:   http://localhost:8003" -ForegroundColor White
Write-Host "  Generate: http://localhost:8004" -ForegroundColor White
Write-Host "  Commerce: http://localhost:8005" -ForegroundColor White
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Yellow
Write-Host "  App:      http://localhost:5173" -ForegroundColor White
Write-Host "  Enhanced: http://localhost:5173/enhanced-workflow" -ForegroundColor White
Write-Host ""
Write-Host "API Documentation:" -ForegroundColor Yellow
Write-Host "  Gateway:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Commerce: http://localhost:8005/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
