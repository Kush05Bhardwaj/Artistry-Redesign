# Artistry Backend - Start All Services
# This script starts all 5 microservices in separate PowerShell windows

Write-Host "Starting Artistry Backend Services..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Gateway Service (Port 8000)
Write-Host "`n[1/5] Starting Gateway Service (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\gateway'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

# Detect Service (Port 8001)
Write-Host "[2/5] Starting Detect Service (Port 8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\detect'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001"

Start-Sleep -Seconds 2

# Segment Service (Port 8002)
Write-Host "[3/5] Starting Segment Service (Port 8002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\segment'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8002"

Start-Sleep -Seconds 2

# Advise Service (Port 8003)
Write-Host "[4/5] Starting Advise Service (Port 8003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\advise'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8003"

Start-Sleep -Seconds 2

# Generate Service (Port 8004)
Write-Host "[5/5] Starting Generate Service (Port 8004)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\generate'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8004"

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "All services started!" -ForegroundColor Green
Write-Host "`nService URLs:" -ForegroundColor Yellow
Write-Host "  Gateway:  http://localhost:8000" -ForegroundColor White
Write-Host "  Detect:   http://localhost:8001" -ForegroundColor White
Write-Host "  Segment:  http://localhost:8002" -ForegroundColor White
Write-Host "  Advise:   http://localhost:8003" -ForegroundColor White
Write-Host "  Generate: http://localhost:8004" -ForegroundColor White
Write-Host "`nWaiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`nChecking service health..." -ForegroundColor Yellow
$ports = @(8000, 8001, 8002, 8003, 8004)
$services = @("Gateway", "Detect", "Segment", "Advise", "Generate")

for ($i = 0; $i -lt $ports.Length; $i++) {
    $port = $ports[$i]
    $service = $services[$i]
    try {
        $result = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($result) {
            Write-Host "  $service - " -NoNewline -ForegroundColor White
            Write-Host "ONLINE" -ForegroundColor Green
        } else {
            Write-Host "  $service - " -NoNewline -ForegroundColor White
            Write-Host "OFFLINE" -ForegroundColor Red
        }
    } catch {
        Write-Host "  $service - " -NoNewline -ForegroundColor White
        Write-Host "ERROR" -ForegroundColor Red
    }
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
