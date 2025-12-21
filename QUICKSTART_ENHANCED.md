# 🚀 Quick Start Guide - Enhanced Artistry AI

## Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional)
- 8GB+ RAM (16GB recommended)
- CUDA GPU (optional, for faster inference)

---

## Option 1: Docker Setup (Recommended)

### 1. Start Backend Services

```bash
cd artistry-backend
docker-compose up --build
```

This starts all 6 services:
- ✅ Gateway (http://localhost:8000)
- ✅ Detect (http://localhost:8001)
- ✅ Segment (http://localhost:8002)
- ✅ Advise (http://localhost:8003)
- ✅ Generate (http://localhost:8004)
- ✅ Commerce (http://localhost:8005)

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Access: **http://localhost:5173/enhanced-workflow**

---

## Option 2: Manual Setup

### Backend Services

Each service runs independently:

#### 1. Detect Service (Port 8001)
```bash
cd artistry-backend/detect
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

#### 2. Segment Service (Port 8002)
```bash
cd artistry-backend/segment
pip install -r requirements.txt
uvicorn app.main:app --port 8002 --reload
```

#### 3. Advise Service (Port 8003)
```bash
cd artistry-backend/advise
pip install -r requirements.txt
uvicorn app.main:app --port 8003 --reload
```

**Note:** First run will download LLaVA model (~13GB). This may take time.

#### 4. Generate Service (Port 8004)
```bash
cd artistry-backend/generate
pip install -r requirements.txt
uvicorn app.main:app --port 8004 --reload
```

**Note:** First run will download Stable Diffusion models (~5GB).

#### 5. Commerce Service (Port 8005)
```bash
cd artistry-backend/commerce
pip install -r requirements.txt
uvicorn app.main:app --port 8005 --reload
```

#### 6. Gateway Service (Port 8000)
```bash
cd artistry-backend/gateway
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Testing the System

### Test Individual Services

#### 1. Test Detection
```bash
curl -X POST http://localhost:8001/detect/ \
  -H "Content-Type: application/json" \
  -d '{"image_b64": "YOUR_BASE64_IMAGE"}'
```

#### 2. Test Commerce
```bash
curl http://localhost:8005/commerce/products/bed
```

#### 3. Test Health
```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
curl http://localhost:8005/health
```

### Test Complete Workflow

1. Visit: **http://localhost:5173/enhanced-workflow**
2. Upload a room image
3. Select budget (Low/Medium/High)
4. Enter design preferences
5. Select items to replace
6. Click "Generate Design"
7. View results + shopping recommendations

---

## Environment Variables

### Backend (.env in artistry-backend/)

```env
# MongoDB (optional)
MONGO_URI=mongodb://localhost:27017

# Service URLs (for Docker)
DETECT_URL=http://detect:8001
SEGMENT_URL=http://segment:8002
ADVISE_URL=http://advise:8003
GENERATE_URL=http://generate:8004
COMMERCE_URL=http://commerce:8005

# Service URLs (for local development)
# DETECT_URL=http://localhost:8001
# SEGMENT_URL=http://localhost:8002
# ADVISE_URL=http://localhost:8003
# GENERATE_URL=http://localhost:8004
# COMMERCE_URL=http://localhost:8005
```

### Frontend (.env in frontend/)

```env
VITE_API_BASE=http://localhost:8000
```

---

## Troubleshooting

### Issue: Services won't start

**Solution:**
```bash
# Check if ports are in use
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# Kill conflicting processes or change ports
```

### Issue: Model download fails

**Solution:**
```bash
# Check internet connection
# Ensure sufficient disk space (20GB+ free)
# Try manual download:
cd artistry-backend/advise/app
# Download LLaVA model manually from HuggingFace
```

### Issue: Out of memory

**Solution:**
- Use Docker with memory limits
- Reduce batch sizes in generation
- Close other applications
- Use CPU-only mode (slower but less memory)

### Issue: Frontend can't connect to backend

**Solution:**
```bash
# Check CORS settings in backend services
# Verify VITE_API_BASE in .env
# Check if gateway is running on port 8000
```

---

## Performance Tips

### For CPU-only Systems

1. **Reduce inference steps:**
   - Detection: Use YOLOv8n (nano) - already set
   - Generation: Reduce to 20 steps (default: 30)

2. **Use smaller models:**
   - Already using optimized variants (YOLOv8n, MobileSAM)

3. **Enable attention slicing:**
   - Already enabled in Generate service

### For GPU Systems

1. **Enable CUDA:**
   - Models automatically detect and use GPU
   - Verify: `torch.cuda.is_available()` returns `True`

2. **Use FP16:**
   - Already enabled for GPU inference

3. **Increase batch sizes** (if multi-image processing)

---

## What's Next?

### Try Different Workflows

1. **Budget Comparison:**
   - Same room, different budgets
   - See material quality differences

2. **Style Exploration:**
   - "Modern minimalist"
   - "Cozy bohemian"
   - "Luxury hotel"
   - "Scandinavian bright"

3. **Partial Redesign:**
   - Replace only specific items
   - Keep furniture, change colors

4. **Shopping Integration:**
   - Browse matched products
   - Compare vendors
   - Track prices

### Next Features to Build

1. Save/Load designs
2. User accounts
3. Design history
4. Social sharing
5. Real product API integration
6. AR preview (mobile)

---

## API Documentation

Full API documentation available at:
- **Gateway:** http://localhost:8000/docs
- **Detect:** http://localhost:8001/docs
- **Segment:** http://localhost:8002/docs
- **Advise:** http://localhost:8003/docs
- **Generate:** http://localhost:8004/docs
- **Commerce:** http://localhost:8005/docs

---

## Support

**Issues?** Open a GitHub issue with:
- Error logs
- System specs (CPU/GPU, RAM)
- Steps to reproduce

**Questions?** Check `ENHANCED_ARCHITECTURE.md` for detailed documentation.

---

**Happy Designing! 🎨✨**
