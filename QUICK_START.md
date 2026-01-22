# ⚡ ARTISTRY MVP - QUICK REFERENCE CARD

## 🚀 START ALL SERVICES (Copy-Paste Ready)

### Terminal 1 - Gateway (Port 8000):
```powershell
cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\gateway; f:\Projects\Artistry\Artistry-Redesign\artistry-backend\gateway\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload
```

### Terminal 2 - Detect (Port 8001):
```powershell
cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect; f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect\venv\Scripts\python.exe -m uvicorn app.main:app --port 8001 --reload
```

### Terminal 3 - Segment (Port 8002):
```powershell
cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\segment; f:\Projects\Artistry\Artistry-Redesign\artistry-backend\segment\venv\Scripts\python.exe -m uvicorn app.main:app --port 8002 --reload
```

### Terminal 4 - Advise (Port 8003):
```powershell
cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\advise; f:\Projects\Artistry\Artistry-Redesign\artistry-backend\advise\venv\Scripts\python.exe -m uvicorn app.main:app --port 8003 --reload
```

### Terminal 5 - Generate (Port 8004):
```powershell
cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\generate; f:\Projects\Artistry\Artistry-Redesign\artistry-backend\generate\venv\Scripts\python.exe -m uvicorn app.main:app --port 8004 --reload
```

---

## ✅ HEALTH CHECK (Terminal 6):
```powershell
@("8000","8001","8002","8003","8004") | ForEach-Object { try { Invoke-RestMethod "http://localhost:$_/health" | Out-Null; Write-Host "✅ Port $_" -ForegroundColor Green } catch { Write-Host "❌ Port $_" -ForegroundColor Red } }
```

---

## 🧪 TEST NEW FEATURES:

### Cost Estimation:
```powershell
Invoke-RestMethod -Uri "http://localhost:8003/estimate/total-cost" -Method Post -Body (@{detected_objects=@("bed","curtains");budget="medium";room_size_sqft=150} | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json
```

### DIY Instructions:
```powershell
Invoke-RestMethod -Uri "http://localhost:8003/diy/instructions" -Method Post -Body (@{item="curtains";budget="medium"} | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json
```

---

## 📋 MVP PHASE 1 CHECKLIST:

- [ ] Start all 5 services
- [ ] Health check passes for all
- [ ] Test cost estimation
- [ ] Test DIY instructions
- [ ] (Optional) Setup MongoDB for auth/save features
- [ ] (Next) Integrate with frontend

---

## 📄 DOCUMENTATION:

1. **COMPLETE_CODE_REVIEW.md** - Full summary
2. **MVP_TESTING_GUIDE.md** - Detailed testing
3. **MVP_IMPLEMENTATION.md** - API docs
4. **MVP_SUMMARY.md** - Executive summary

---

## ✅ FIXES APPLIED:

1. ✅ Import paths fixed (app.pricing_data, app.diy_instructions)
2. ✅ Python syntax fixed (null → None)
3. ✅ All imports moved to top of files

---

## 💪 READY TO TEST!
