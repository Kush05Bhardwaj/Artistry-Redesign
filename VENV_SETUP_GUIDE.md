# Artistry - Virtual Environment Setup Guide

## Overview
Each backend service now has its own isolated Python virtual environment with all required dependencies installed.

## Virtual Environment Structure

```
artistry-backend/
├── advise/
│   └── venv/          # Virtual environment for Advise service
├── detect/
│   └── venv/          # Virtual environment for Detect service
├── gateway/
│   └── venv/          # Virtual environment for Gateway service
├── generate/
│   └── venv/          # Virtual environment for Generate service
└── segment/
    └── venv/          # Virtual environment for Segment service
```

## Starting All Services

### Option 1: Using PowerShell Script (Recommended)
```powershell
cd artistry-backend
.\start_services.ps1
```

This will open 5 separate terminal windows, one for each service.

### Option 2: Manual Start (Individual Services)

#### Gateway Service (Port 8000)
```powershell
cd artistry-backend\gateway
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Detect Service (Port 8001)
```powershell
cd artistry-backend\detect
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### Segment Service (Port 8002)
```powershell
cd artistry-backend\segment
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

#### Advise Service (Port 8003)
```powershell
cd artistry-backend\advise
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

#### Generate Service (Port 8004)
```powershell
cd artistry-backend\generate
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```

## Frontend Setup

### Install Dependencies
```powershell
cd frontend
npm install
```

### Start Development Server
```powershell
npm run dev
```

The frontend will start on `http://localhost:5173`

## Service Connections

Each frontend page is connected to its corresponding backend service:

- **Detect Page** → `http://localhost:8001` (YOLOv8 Object Detection)
- **Segment Page** → `http://localhost:8002` (MobileSAM Segmentation)
- **Advise Page** → `http://localhost:8003` (LLaVA Design Advice)
- **Generate Page** → `http://localhost:8004` (Stable Diffusion Generation)
- **Gateway** → `http://localhost:8000` (API Gateway & Workflow Orchestration)

## API Endpoints

### Gateway Service (8000)
- `GET /` - Health check
- `POST /api/designs` - Save design to database
- `POST /api/full-workflow` - Run complete workflow

### Detect Service (8001)
- `GET /` - Health check
- `POST /detect` - Detect objects (Base64)
- `POST /detect/` - Detect objects (File upload)

### Segment Service (8002)
- `GET /` - Health check
- `POST /segment` - Segment image (Base64)
- `POST /segment/` - Segment image (File upload)

### Advise Service (8003)
- `GET /` - Health check
- `POST /advise` - Get design advice (Base64)
- `POST /advise/` - Get design advice (File upload)

### Generate Service (8004)
- `GET /` - Health check
- `POST /generate` - Generate design (Base64)
- `POST /generate/` - Generate design (File upload)

## Environment Configuration

### Frontend (.env)
```env
VITE_API_GATEWAY=http://localhost:8000
VITE_DETECT_API=http://localhost:8001
VITE_SEGMENT_API=http://localhost:8002
VITE_ADVISE_API=http://localhost:8003
VITE_GENERATE_API=http://localhost:8004
```

### Gateway (.env)
```env
# MongoDB (Optional)
# MONGO_URI=mongodb://localhost:27017
# MONGO_DB=artistry

# Microservice URLs
DETECT_URL=http://localhost:8001/detect/
SEGMENT_URL=http://localhost:8002/segment/
ADVISE_URL=http://localhost:8003/advise/
GENERATE_URL=http://localhost:8004/generate/
```

## Testing Services

### Health Check All Services
```powershell
# Gateway
Invoke-WebRequest http://localhost:8000

# Detect
Invoke-WebRequest http://localhost:8001

# Segment
Invoke-WebRequest http://localhost:8002

# Advise
Invoke-WebRequest http://localhost:8003

# Generate
Invoke-WebRequest http://localhost:8004
```

Or use the frontend's built-in health check feature once the frontend is running.

## Troubleshooting

### Virtual Environment Not Found
If you get an error about venv not being found, recreate it:
```powershell
cd artistry-backend\<service-name>
python -m venv venv
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\pip.exe install -r requirements.txt
```

### Port Already in Use
If a port is already in use, find and kill the process:
```powershell
# Find process using port 8000 (example)
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F
```

### CORS Errors
Make sure the frontend is running on `http://localhost:5173`. The backend services are configured to allow CORS from this origin.

### Missing Dependencies
If you encounter import errors, reinstall dependencies:
```powershell
cd artistry-backend\<service-name>
.\venv\Scripts\pip.exe install -r requirements.txt
```

## Notes

- **Mobile-SAM**: The segment service may require additional setup for mobile-sam. If you encounter issues, you may need to install it from GitHub or use an alternative segmentation model.
  
- **GPU Acceleration**: Services will automatically use CUDA if available. Check the console output when services start to see which device is being used.

- **MongoDB**: The gateway service can work without MongoDB. It's only needed if you want to persist design workflows.

- **Hot Reload**: All services are started with `--reload` flag, so changes to Python files will automatically restart the service.

## Quick Start Commands

```powershell
# 1. Start all backend services
cd artistry-backend
.\start_services.ps1

# 2. In a new terminal, start frontend
cd frontend
npm run dev

# 3. Open browser to http://localhost:5173
```

Enjoy building with Artistry! 🎨
