# Start All Artistry Backend Services

Write-Host "Starting Artistry Backend Services..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start each service in a new PowerShell window
Write-Host "Starting Detect Service (Port 8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\detect'; if (Test-Path '.\venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; uvicorn app.main:app --port 8001 --reload"

Start-Sleep -Seconds 2

Write-Host "Starting Segment Service (Port 8002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\segment'; if (Test-Path '.\venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; uvicorn app.main:app --port 8002 --reload"

Start-Sleep -Seconds 2

Write-Host "Starting Advise Service (Port 8003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\advise'; if (Test-Path '.\venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; uvicorn app.main:app --port 8003 --reload"

Start-Sleep -Seconds 2

Write-Host "Starting Generate Service (Port 8004)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\generate'; if (Test-Path '.\venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; uvicorn app.main:app --port 8004 --reload"

Start-Sleep -Seconds 2

Write-Host "Starting Commerce Service (Port 8005)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\commerce'; if (Test-Path '.\venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; uvicorn app.main:app --port 8005 --reload"

Start-Sleep -Seconds 2

Write-Host "Starting Gateway Service (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\gateway'; if (Test-Path '.\venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; uvicorn app.main:app --port 8000 --reload"

Write-Host ""
Write-Host "✅ All backend services started!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Please wait 10-30 seconds for all services to initialize..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  Gateway:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Detect:   http://localhost:8001/docs" -ForegroundColor White
Write-Host "  Segment:  http://localhost:8002/docs" -ForegroundColor White
Write-Host "  Advise:   http://localhost:8003/docs" -ForegroundColor White
Write-Host "  Generate: http://localhost:8004/docs" -ForegroundColor White
Write-Host "  Commerce: http://localhost:8005/docs" -ForegroundColor White
Write-Host ""
Write-Host "Next step: Start the frontend" -ForegroundColor Magenta
Write-Host "  cd ../frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
