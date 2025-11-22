# Installation Guide

Complete step-by-step installation guide for Artistry.

## 📋 Prerequisites

Before you begin, ensure you have:

### Required Software
- **Python** 3.10 or 3.11 (3.12 not fully tested)
- **Node.js** 16.x or higher (18.x recommended)
- **npm** 8.x or higher
- **Git** (latest version)

### System Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 20GB free space (for models and dependencies)
- **Internet**: Stable connection for model downloads

### Accounts Needed
- **MongoDB Atlas** account (free tier is sufficient)
  - Sign up at: https://www.mongodb.com/cloud/atlas

---

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/Kush05Bhardwaj/Artistry-Redesign.git
cd Artistry-Redesign
```

---

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd artistry-backend
```

#### 2.2 Create Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Verify activation:**
```bash
which python  # Should show venv path
python --version  # Should show Python 3.10+
```

#### 2.3 Install Dependencies

```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

**This will install:**
- FastAPI and Uvicorn
- PyTorch (CPU version)
- Ultralytics (YOLOv8)
- Diffusers (Stable Diffusion)
- Transformers
- Motor (MongoDB driver)
- And more...

**⏱️ Note**: This may take 10-15 minutes depending on your internet speed.

#### 2.4 Download AI Models

**YOLOv8 Model** (auto-downloads on first run, or manual):
```bash
cd detect/app
# Windows
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt -o yolov8n.pt
# macOS/Linux
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
cd ../..
```

**MobileSAM Model** (manual download required):
```bash
# Download from: https://github.com/ChaoningZhang/MobileSAM/releases
# Place mobile_sam.pt in: artistry-backend/segment/app/
```

**Stable Diffusion** (auto-downloads on first run):
- Model: stabilityai/stable-diffusion-2-1
- Size: ~5GB
- Will download automatically when generate service first runs

#### 2.5 Configure MongoDB

1. **Create MongoDB Atlas Cluster** (if you haven't):
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free tier cluster
   - Create database user
   - Whitelist IP: `0.0.0.0/0` (or your specific IP)

2. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/`

3. **Configure Each Service**:

**Option A: Environment Variable (Recommended)**

Create `.env` file in each service directory:

```bash
# artistry-backend/gateway/.env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/artistry

# Repeat for other services if they use MongoDB
```

**Option B: Direct in Code**

Edit `main.py` in each service:
```python
# gateway/app/main.py
MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/artistry"
```

---

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory

```bash
cd ../frontend  # From artistry-backend
# Or from root: cd frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

**This will install:**
- React 18
- Vite 5
- React Router DOM
- Tailwind CSS
- Lucide React (icons)
- And more...

**⏱️ Note**: Takes 2-5 minutes.

#### 3.3 Configure Environment

Create `.env` file in `frontend/` directory:

```env
VITE_GATEWAY_URL=http://localhost:8000
VITE_DETECT_URL=http://localhost:8001
VITE_SEGMENT_URL=http://localhost:8002
VITE_ADVISE_URL=http://localhost:8003
VITE_GENERATE_URL=http://localhost:8004
```

**Important**: All variable names must start with `VITE_` to be accessible in the app.

---

## ✅ Verify Installation

### Check Backend

```bash
cd artistry-backend

# Check Python version
python --version  # Should be 3.10+

# Check packages installed
pip list | grep fastapi
pip list | grep torch
pip list | grep ultralytics

# Check models exist
ls detect/app/yolov8n.pt
ls segment/app/mobile_sam.pt
```

### Check Frontend

```bash
cd frontend

# Check Node version
node --version  # Should be 16+

# Check npm version
npm --version  # Should be 8+

# Verify .env exists
cat .env  # or: type .env (Windows)
```

---

## 🎯 Running the Application

### Start Backend Services

**Option 1: Automated (Windows)**
```powershell
cd artistry-backend
.\start_all_services.ps1
```

**Option 2: Manual (All Platforms)**

Open **5 separate terminals**, activate venv in each, and run:

**Terminal 1 - Gateway:**
```bash
cd artistry-backend/gateway
source ../venv/bin/activate  # or .\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Detect:**
```bash
cd artistry-backend/detect
source ../venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

**Terminal 3 - Segment:**
```bash
cd artistry-backend/segment
source ../venv/bin/activate
uvicorn app.main:app --reload --port 8002
```

**Terminal 4 - Advise:**
```bash
cd artistry-backend/advise
source ../venv/bin/activate
uvicorn app.main:app --reload --port 8003
```

**Terminal 5 - Generate:**
```bash
cd artistry-backend/generate
source ../venv/bin/activate
uvicorn app.main:app --reload --port 8004
```

### Start Frontend

**New terminal:**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Gateway**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🧪 Test the Installation

### Health Check Script

```powershell
# Windows
cd artistry-backend
.\test_services.ps1
```

### Manual Health Checks

```bash
curl http://localhost:8000/health  # Gateway
curl http://localhost:8001/health  # Detect
curl http://localhost:8002/health  # Segment
curl http://localhost:8003/health  # Advise
curl http://localhost:8004/health  # Generate
```

### Test Full Workflow

1. Open http://localhost:5173/workflow
2. Upload a test image
3. Click "Start Complete Workflow"
4. Verify all 4 steps complete successfully

---

## 🐛 Common Installation Issues

See [Troubleshooting Guide](../troubleshooting/COMMON_ISSUES.md) for detailed solutions.

**Quick Fixes:**

| Issue | Solution |
|-------|----------|
| `python` not found | Use `python3` on macOS/Linux |
| `pip` not found | Use `python -m pip` |
| Port in use | Kill process or change port |
| Module not found | Activate venv and reinstall |
| CORS error | Check backend CORS settings |

---

## 📦 Optional: Docker Installation

Coming soon - Docker Compose setup for easy deployment.

---

## ✨ Next Steps

- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
- [Full Workflow Guide](./FULL_WORKFLOW.md)
- [API Documentation](../api/)
- [Troubleshooting](../troubleshooting/COMMON_ISSUES.md)

---

**[← Back to Documentation](../README.md)**
