# 🚀 Complete Startup Instructions

## All Services Must Be Running

This system requires **7 services** to run simultaneously:
- 5 Backend microservices (Detect, Segment, Advise, Generate, Commerce)
- 1 Gateway service
- 1 Frontend service

---

## Option 1: PowerShell Script (Windows - Recommended)

### Start All Backend Services

Create this file: `artistry-backend/start-all-services.ps1`

```powershell
# Start All Artistry Backend Services

Write-Host "Starting Artistry Backend Services..." -ForegroundColor Green

# Detect Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\detect'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --port 8001 --reload"

# Segment Service  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\segment'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --port 8002 --reload"

# Advise Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\advise'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --port 8003 --reload"

# Generate Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\generate'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --port 8004 --reload"

# Commerce Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\commerce'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --port 8005 --reload"

# Gateway Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\gateway'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --port 8000 --reload"

Write-Host "`n✅ All backend services started!" -ForegroundColor Green
Write-Host "Wait 10-30 seconds for services to initialize..." -ForegroundColor Yellow
Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "  Gateway:  http://localhost:8000" -ForegroundColor White
Write-Host "  Detect:   http://localhost:8001" -ForegroundColor White
Write-Host "  Segment:  http://localhost:8002" -ForegroundColor White
Write-Host "  Advise:   http://localhost:8003" -ForegroundColor White
Write-Host "  Generate: http://localhost:8004" -ForegroundColor White
Write-Host "  Commerce: http://localhost:8005" -ForegroundColor White
```

**Run it:**
```powershell
cd artistry-backend
.\start-all-services.ps1
```

---

## Option 2: Manual Start (Step by Step)

Open **6 separate PowerShell terminals** and run these commands:

### Terminal 1: Detect Service
```powershell
cd F:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8001 --reload
```

### Terminal 2: Segment Service
```powershell
cd F:\Projects\Artistry\Artistry-Redesign\artistry-backend\segment
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8002 --reload
```

### Terminal 3: Advise Service
```powershell
cd F:\Projects\Artistry\Artistry-Redesign\artistry-backend\advise
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8003 --reload
```

### Terminal 4: Generate Service
```powershell
cd F:\Projects\Artistry\Artistry-Redesign\artistry-backend\generate
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8004 --reload
```

### Terminal 5: Commerce Service
```powershell
cd F:\Projects\Artistry\Artistry-Redesign\artistry-backend\commerce
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8005 --reload
```

### Terminal 6: Gateway Service
```powershell
cd F:\Projects\Artistry\Artistry-Redesign\artistry-backend\gateway
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8000 --reload
```

---

## Start Frontend

Open a **7th terminal** and run:

```powershell
cd F:\Projects\Artistry\Artistry-Redesign\frontend
npm run dev
```

---

## Verify All Services Are Running

Open PowerShell and run:

```powershell
# Test all services
curl http://localhost:8000/health  # Gateway
curl http://localhost:8001/health  # Detect
curl http://localhost:8002/health  # Segment
curl http://localhost:8003/health  # Advise
curl http://localhost:8004/health  # Generate
curl http://localhost:8005/health  # Commerce
```

**All should return:** `{"status":"ok","service":"..."}`

---

## Access the Application

Once all services are running:

1. **Enhanced Workflow (New!):** http://localhost:5173/enhanced-workflow
2. **Full Workflow:** http://localhost:5173/workflow
3. **Home Page:** http://localhost:5173/

---

## Troubleshooting

### Frontend Import Errors (`@/lib/utils` not found)

**Solution:** Restart the Vite dev server

```powershell
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

### Port Already in Use

```powershell
# Find process using port
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Services Not Connecting

1. Ensure all backend services are running (check terminals)
2. Verify `.env` file in frontend folder exists
3. Check CORS settings in each service

---

## Quick Health Check Script

Create `test-services.ps1`:

```powershell
$services = @(
    @{Name="Gateway"; Port=8000},
    @{Name="Detect"; Port=8001},
    @{Name="Segment"; Port=8002},
    @{Name="Advise"; Port=8003},
    @{Name="Generate"; Port=8004},
    @{Name="Commerce"; Port=8005}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -UseBasicParsing
        Write-Host "✅ $($service.Name) (Port $($service.Port)): OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) (Port $($service.Port)): FAILED" -ForegroundColor Red
    }
}
```

**Run it:**
```powershell
.\test-services.ps1
```

---

## Service Startup Times

- **Detect:** ~2-3 seconds
- **Segment:** ~3-5 seconds
- **Advise:** ~30-60 seconds (downloads LLaVA model on first run)
- **Generate:** ~20-30 seconds (downloads SD models on first run)
- **Commerce:** ~1-2 seconds
- **Gateway:** ~1 second
- **Frontend:** ~3-5 seconds

**Total time to all services ready:** ~1-2 minutes (first time: 5-10 minutes for model downloads)

---

## Ready to Use!

Once all services show ✅ in health check:

Visit: **http://localhost:5173/enhanced-workflow**

Enjoy your AI-powered interior design platform! 🎨✨
