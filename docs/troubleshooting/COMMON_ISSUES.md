# Common Issues & Solutions

Complete troubleshooting guide for Artistry.

## 🔍 Quick Diagnosis

```powershell
# Windows - Check all services
cd artistry-backend
.\test_services.ps1

# Manual health check
curl http://localhost:8000/health  # Gateway
curl http://localhost:8001/health  # Detect
curl http://localhost:8002/health  # Segment
curl http://localhost:8003/health  # Advise
curl http://localhost:8004/health  # Generate
```

---

## 🔴 Backend Issues

### Issue: Port Already in Use

**Symptoms**: `OSError: [Errno 98] Address already in use` or `Port 8001 is already in use`

**Solutions**:

**Windows (PowerShell)**:
```powershell
# Find process using port
netstat -ano | findstr :8001

# Kill specific process
taskkill /PID <PID> /F

# Kill all Python processes (caution!)
Get-Process python | Stop-Process -Force
```

**macOS/Linux**:
```bash
# Find and kill process
lsof -ti:8001 | xargs kill -9

# Or use fuser
fuser -k 8001/tcp

# Or use netstat
netstat -nlp | grep :8001
kill -9 <PID>
```

---

### Issue: Module Not Found Error

**Symptoms**: `ModuleNotFoundError: No module named 'fastapi'` or similar

**Solutions**:

```bash
# 1. Verify virtual environment is activated
which python  # Should show venv path

# 2. Activate if not activated
# Windows
.\venv\Scripts\activate
# macOS/Linux  
source venv/bin/activate

# 3. Upgrade pip
python -m pip install --upgrade pip

# 4. Reinstall dependencies
pip install -r requirements.txt

# 5. For specific issues
pip install --force-reinstall fastapi
```

---

### Issue: AI Model Not Found

**Symptoms**: `FileNotFoundError: yolov8n.pt not found`

**Solutions**:

**YOLOv8 Model**:
```bash
cd artistry-backend/detect/app
# Windows
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt -o yolov8n.pt
# Or
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
```

**MobileSAM Model**:
```bash
cd artistry-backend/segment/app
# Download from: https://github.com/ChaoningZhang/MobileSAM/releases
# Place mobile_sam.pt in this directory
```

---

### Issue: MongoDB Connection Failed

**Symptoms**: `ServerSelectionTimeoutError` or `Connection refused`

**Common Causes & Fixes**:

❌ **IP Not Whitelisted**
- Go to MongoDB Atlas → Network Access
- Add your IP or `0.0.0.0/0` (allow all)

❌ **Wrong Credentials**
```python
# Check connection string format
MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
```

❌ **Network/Firewall Issues**
- Check corporate firewall
- Try different network
- Test connection:
```python
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient("your-uri")
try:
    client.admin.command('ping')
    print("✅ Connected!")
except Exception as e:
    print(f"❌ Failed: {e}")
```

---

### Issue: PyTorch/CUDA Problems

**Symptoms**: `RuntimeError: CUDA out of memory` or import errors

**Solutions**:

```bash
# Check PyTorch version
python -c "import torch; print(torch.__version__)"

# Check CUDA availability
python -c "import torch; print(torch.cuda.is_available())"

# Reinstall PyTorch (CPU version)
pip uninstall torch torchvision torchaudio
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# For GPU (CUDA 11.8)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

---

## 🔴 Frontend Issues

### Issue: CORS Error

**Symptoms**: `Access to fetch blocked by CORS policy`

**Solution**:

Check each backend service's `main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Then restart** all services.

---

### Issue: Environment Variables Not Loading

**Symptoms**: `undefined` values for `import.meta.env.VITE_*`

**Solutions**:

1. Check `.env` file exists: `frontend/.env`
2. Verify all variables start with `VITE_`:
```env
VITE_GATEWAY_URL=http://localhost:8000
VITE_DETECT_URL=http://localhost:8001
# etc...
```
3. **Restart dev server** after .env changes
4. Check in browser console:
```javascript
console.log(import.meta.env.VITE_GATEWAY_URL)
```

---

### Issue: npm Install Failures

**Symptoms**: `EACCES` or `EPERM` errors

**Solutions**:

```bash
# Clear cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# Update npm
npm install -g npm@latest

# Use legacy peer deps (if conflicts)
npm install --legacy-peer-deps
```

---

### Issue: Images Not Displaying

**Symptoms**: Broken images or `Failed to load resource`

**Solutions**:

```javascript
// Check image data format
console.log(typeof imageData);
console.log(imageData?.substring(0, 50));

// Ensure proper base64 prefix
const imageSrc = imageData.startsWith('data:') 
  ? imageData 
  : `data:image/jpeg;base64,${imageData}`;
```

---

## ⚡ Performance Issues

### Issue: Slow Generation (>60s)

**Causes**: CPU-only inference, large images, high inference steps

**Solutions**:

1. **Reduce inference steps** (in `generate/app/main.py`):
```python
DEFAULT_STEPS = 15  # Instead of 20-30
```

2. **Resize images before upload** (in frontend):
```javascript
const maxSize = 1024;  // Max width/height
```

3. **Enable GPU** (if available):
```python
device = "cuda" if torch.cuda.is_available() else "cpu"
```

---

### Issue: High Memory Usage

**Symptoms**: System slowdown, OOM errors

**Solutions**:

```python
# In each service's main.py
import torch

# For GPU
torch.cuda.empty_cache()

# Limit batch size
batch_size = 1

# Use float16 precision
model.half()
```

---

### Issue: Service Crashes Under Load

**Solutions**:

```python
# Add rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/detect")
@limiter.limit("5/minute")
async def detect(file: UploadFile):
    pass
```

---

## 🐳 Docker Issues

### Issue: Container Won't Start

**Solutions**:

```bash
# Check logs
docker-compose logs -f gateway

# Rebuild without cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check container status
docker ps -a
```

---

### Issue: Docker Network Problems

**Solutions**:

```bash
# Recreate network
docker network prune
docker-compose up --force-recreate

# Check network
docker network inspect artistry-network
```

---

## 🔍 Debugging Tips

### Enable Verbose Logging

**Backend (main.py)**:
```python
import logging
import sys

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('service.log')
    ]
)
```

**Frontend (api.js)**:
```javascript
const DEBUG = true;

const log = (...args) => {
  if (DEBUG) console.log('[API]', ...args);
};

export const detectObjects = async (file) => {
  log('Detecting:', file.name);
  // ...
};
```

---

## 🆘 Still Stuck?

1. **Check logs** carefully for error details
2. **Search issues**: [GitHub Issues](https://github.com/Kush05Bhardwaj/Artistry-Redesign/issues)
3. **Ask for help**: [Discussions](https://github.com/Kush05Bhardwaj/Artistry-Redesign/discussions)
4. **Email support**: kush2012bhardwaj@gmail.com

**When reporting issues, include**:
- OS and version
- Python version (`python --version`)
- Node version (`node --version`)
- Complete error message
- Steps to reproduce
- Relevant logs (last 50 lines)

---

**[← Back to Documentation](../README.md)**
