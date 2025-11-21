# Artistry Backend - Start All Services Script
# This script starts all microservices with their respective virtual environments

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Artistry Backend Services" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Gateway"; Port=8000; Path="gateway"; Color="Green"},
    @{Name="Detect"; Port=8001; Path="detect"; Color="Yellow"},
    @{Name="Segment"; Port=8002; Path="segment"; Color="Blue"},
    @{Name="Advise"; Port=8003; Path="advise"; Color="Magenta"},
    @{Name="Generate"; Port=8004; Path="generate"; Color="Cyan"}
)

$rootPath = $PSScriptRoot

foreach ($service in $services) {
    $servicePath = Join-Path $rootPath $service.Path
    $venvPath = Join-Path $servicePath "venv\Scripts\python.exe"
    $mainPath = Join-Path $servicePath "app\main.py"
    
    if (Test-Path $venvPath) {
        Write-Host "Starting $($service.Name) Service on port $($service.Port)..." -ForegroundColor $service.Color
        
        # Start service in new PowerShell window
        Start-Process powershell -ArgumentList @"
-NoExit -Command `"
    `$host.ui.RawUI.WindowTitle = 'Artistry - $($service.Name) Service';
    cd '$servicePath';
    Write-Host '=====================================' -ForegroundColor $($service.Color);
    Write-Host '   $($service.Name) Service' -ForegroundColor $($service.Color);
    Write-Host '   Port: $($service.Port)' -ForegroundColor $($service.Color);
    Write-Host '=====================================' -ForegroundColor $($service.Color);
    Write-Host '';
    & '$venvPath' -m uvicorn app.main:app --host 0.0.0.0 --port $($service.Port) --reload
`"
"@
        Start-Sleep -Seconds 2
    } else {
        Write-Host "ERROR: Virtual environment not found for $($service.Name) at $venvPath" -ForegroundColor Red
        Write-Host "Please run: cd $servicePath; python -m venv venv; .\venv\Scripts\pip.exe install -r requirements.txt" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "All services started!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running on:" -ForegroundColor White
Write-Host "  Gateway:  http://localhost:8000" -ForegroundColor Green
Write-Host "  Detect:   http://localhost:8001" -ForegroundColor Yellow
Write-Host "  Segment:  http://localhost:8002" -ForegroundColor Blue
Write-Host "  Advise:   http://localhost:8003" -ForegroundColor Magenta
Write-Host "  Generate: http://localhost:8004" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (services will continue)" -ForegroundColor Gray
Write-Host "Close individual service windows to stop specific services" -ForegroundColor Gray
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 10
}
