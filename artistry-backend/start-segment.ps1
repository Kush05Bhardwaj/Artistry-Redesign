# Segment Service Launcher
Write-Host "Starting Segment Service (Port 8002)..." -ForegroundColor Cyan
Set-Location "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\segment"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8002 --reload
