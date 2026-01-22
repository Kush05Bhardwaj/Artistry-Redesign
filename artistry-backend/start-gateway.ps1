# Gateway Service Launcher
Write-Host "Starting Gateway Service (Port 8000)..." -ForegroundColor Cyan
Set-Location "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\gateway"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8000 --reload
