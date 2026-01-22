# Generate Service Launcher
Write-Host "Starting Generate Service (Port 8004)..." -ForegroundColor Cyan
Set-Location "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\generate"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8004 --reload
