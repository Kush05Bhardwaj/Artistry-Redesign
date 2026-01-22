# ============================================
# MVP Services - Manual Startup Guide
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚀 Artistry MVP - Service Startup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📋 Phase 1 MVP Services (6 Features):" -ForegroundColor Yellow
Write-Host "  ✅ AI room analysis" -ForegroundColor Green
Write-Host "  ✅ AI decor suggestions" -ForegroundColor Green
Write-Host "  ✅ Before-After visuals" -ForegroundColor Green
Write-Host "  ✅ Cost estimation (NEW)" -ForegroundColor Green
Write-Host "  ✅ DIY guidance (NEW)" -ForegroundColor Green
Write-Host "  ✅ Save and share designs (NEW)`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "STEP 1: Open 5 PowerShell Terminals" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "Terminal 1 - Gateway Service (Port 8000)" -ForegroundColor Cyan
Write-Host "cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\gateway" -ForegroundColor White
Write-Host ".\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "uvicorn app.main:app --port 8000 --reload`n" -ForegroundColor White

Write-Host "Terminal 2 - Detect Service (Port 8001)" -ForegroundColor Cyan
Write-Host "cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect" -ForegroundColor White
Write-Host ".\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "uvicorn app.main:app --port 8001 --reload`n" -ForegroundColor White

Write-Host "Terminal 3 - Segment Service (Port 8002)" -ForegroundColor Cyan
Write-Host "cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\segment" -ForegroundColor White
Write-Host ".\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "uvicorn app.main:app --port 8002 --reload`n" -ForegroundColor White

Write-Host "Terminal 4 - Advise Service (Port 8003)" -ForegroundColor Cyan
Write-Host "cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\advise" -ForegroundColor White
Write-Host ".\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "uvicorn app.main:app --port 8003 --reload`n" -ForegroundColor White

Write-Host "Terminal 5 - Generate Service (Port 8004)" -ForegroundColor Cyan
Write-Host "cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\generate" -ForegroundColor White
Write-Host ".\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "uvicorn app.main:app --port 8004 --reload`n" -ForegroundColor White

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "STEP 2: Quick Health Check" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "Run this in a 6th terminal after starting all services:`n" -ForegroundColor White

Write-Host '@("Gateway:8000", "Detect:8001", "Segment:8002", "Advise:8003", "Generate:8004") | ForEach-Object {' -ForegroundColor Gray
Write-Host '    $parts = $_ -split ":"' -ForegroundColor Gray
Write-Host '    $name = $parts[0]' -ForegroundColor Gray
Write-Host '    $port = $parts[1]' -ForegroundColor Gray
Write-Host '    try {' -ForegroundColor Gray
Write-Host '        Invoke-RestMethod "http://localhost:$port/health" | Out-Null' -ForegroundColor Gray
Write-Host '        Write-Host "✅ $name (Port $port) - RUNNING" -ForegroundColor Green' -ForegroundColor Gray
Write-Host '    } catch {' -ForegroundColor Gray
Write-Host '        Write-Host "❌ $name (Port $port) - NOT RUNNING" -ForegroundColor Red' -ForegroundColor Gray
Write-Host '    }' -ForegroundColor Gray
Write-Host '}`n' -ForegroundColor Gray

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "STEP 3: Test NEW MVP Features" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "Test Cost Estimation:" -ForegroundColor Cyan
Write-Host 'Invoke-RestMethod -Uri "http://localhost:8003/estimate/total-cost" -Method Post -Body (@{detected_objects=@("bed","curtains");budget="medium";room_size_sqft=150} | ConvertTo-Json) -ContentType "application/json"`n' -ForegroundColor Gray

Write-Host "Test DIY Instructions:" -ForegroundColor Cyan
Write-Host 'Invoke-RestMethod -Uri "http://localhost:8003/diy/instructions" -Method Post -Body (@{item="curtains";budget="medium"} | ConvertTo-Json) -ContentType "application/json"`n' -ForegroundColor Gray

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All Commands Ready!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
