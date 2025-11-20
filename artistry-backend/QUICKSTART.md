# Artistry Backend - Quick Start Guide

## 🚀 Starting All Services

### Automated Start (Recommended)
```powershell
cd artistry-backend
.\start_all_services.ps1
```

This will:
1. Start all 5 services in separate PowerShell windows
2. Wait for services to initialize
3. Perform health checks
4. Display service status

### Manual Start

Start each service in a separate terminal:

```powershell
# Gateway (Terminal 1)
cd gateway
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Detect (Terminal 2)
cd detect
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001

# Segment (Terminal 3)
cd segment
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8002

# Advise (Terminal 4)
cd advise
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8003

# Generate (Terminal 5)
cd generate
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8004
```

## ✅ Verify Services

```powershell
python check_services.py
```

Expected output:
```
✓ Gateway    - RUNNING on http://localhost:8000
✓ Detect     - RUNNING on http://localhost:8001
✓ Segment    - RUNNING on http://localhost:8002
✓ Advise     - RUNNING on http://localhost:8003
✓ Generate   - RUNNING on http://localhost:8004
```

## 📊 Service Details

| Service  | Port | Model               | Purpose                    |
|----------|------|---------------------|----------------------------|
| Gateway  | 8000 | -                   | API Router & Orchestration |
| Detect   | 8001 | YOLOv8n             | Object Detection           |
| Segment  | 8002 | MobileSAM           | Image Segmentation         |
| Advise   | 8003 | GPT-2               | Design Recommendations     |
| Generate | 8004 | Stable Diffusion    | AI Image Generation        |

## 🧪 Testing

Run integration tests:
```powershell
python test_services.py
```

## 📝 API Endpoints

### Health Checks
- `GET http://localhost:8000/` - Gateway status
- `GET http://localhost:8001/` - Detect status
- `GET http://localhost:8002/` - Segment status  
- `GET http://localhost:8003/` - Advise status
- `GET http://localhost:8004/` - Generate status

### Service Usage
- `POST http://localhost:8001/detect/` - Upload image for detection
- `POST http://localhost:8002/segment/` - Upload image for segmentation
- `POST http://localhost:8003/advise/` - Upload image for advice
- `POST http://localhost:8004/generate/` - Upload image for generation
- `POST http://localhost:8000/rooms` - Full workflow via gateway

## 🛠️ Architecture

```
Frontend (Port 5173)
        ↓
Gateway Service (8000)
        ↓
    ┌───┴───┬────────┬────────┐
    ↓       ↓        ↓        ↓
 Detect  Segment  Advise  Generate
 (8001)  (8002)   (8003)   (8004)
```

## 🔧 Configuration

Each service has isolated dependencies in `<service>/venv/`.

Frontend connects via `.env`:
```env
VITE_API_GATEWAY=http://localhost:8000
VITE_DETECT_API=http://localhost:8001
VITE_SEGMENT_API=http://localhost:8002
VITE_ADVISE_API=http://localhost:8003
VITE_GENERATE_API=http://localhost:8004
```

## 📦 Dependencies

All dependencies are pre-installed in each service's virtual environment:
- `gateway/venv/` - FastAPI, Motor, HTTPx
- `detect/venv/` - Ultralytics, PyTorch, OpenCV
- `segment/venv/` - MobileSAM, PyTorch, timm
- `advise/venv/` - Transformers, Sentence-Transformers
- `generate/venv/` - Diffusers, ControlNet, PyTorch

## 🐛 Troubleshooting

**Ports already in use:**
```powershell
# Find process using port
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess

# Kill process
Stop-Process -Id <PID>
```

**Service won't start:**
1. Check Python version: `python --version` (requires 3.10+)
2. Verify venv exists: `Test-Path <service>/venv`
3. Check logs in service terminal window

**Generate service slow:**
- First generation takes 2-3 minutes (model loading)
- CPU mode: 3-5 minutes per image
- GPU mode: 10-30 seconds per image

## 📊 Performance

- **Detect**: ~100-200ms (GPU) / ~1-2s (CPU)
- **Segment**: ~200-500ms (GPU) / ~2-3s (CPU)
- **Advise**: ~500ms-1s
- **Generate**: ~10-30s (GPU) / ~2-5min (CPU)

## 🔐 Security

CORS is configured for local development:
- Frontend: `http://localhost:5173`
- All services accept requests from frontend

For production deployment, update CORS settings in each `app/main.py`.
