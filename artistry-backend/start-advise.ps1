# Advise Service Launcher
Write-Host "Starting Advise Service (Port 8003)..." -ForegroundColor Cyan
Set-Location "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\advise"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8003 --reload
