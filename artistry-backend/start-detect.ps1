# Detect Service Launcher
Write-Host "Starting Detect Service (Port 8001)..." -ForegroundColor Cyan
Set-Location "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8001 --reload
