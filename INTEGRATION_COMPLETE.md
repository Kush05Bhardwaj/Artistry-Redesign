# Artistry V2 - Frontend-Backend Integration

## ✅ Complete Setup

### Backend Services (All Configured ✓)

| Service  | Port | Status | Technology           | Frontend Integration |
|----------|------|--------|----------------------|---------------------|
| Gateway  | 8000 | ✅     | FastAPI + MongoDB    | Full workflow       |
| Detect   | 8001 | ✅     | YOLOv8n + FastAPI    | `/detect` page      |
| Segment  | 8002 | ✅     | MobileSAM + FastAPI  | `/segment` page     |
| Advise   | 8003 | ✅     | GPT-2 + FastAPI      | `/advise` page      |
| Generate | 8004 | ✅     | Stable Diffusion     | `/generate` page    |

### Frontend Pages (All Connected ✓)

| Page         | Route         | Services Used                    | Description                           |
|--------------|---------------|----------------------------------|---------------------------------------|
| Home         | `/`           | None                             | Landing page with navigation          |
| AI Design    | `/ai-design`  | All services (full workflow)     | Complete room redesign workflow       |
| Detect       | `/detect`     | Detect (8001)                    | Object detection only                 |
| Segment      | `/segment`    | Segment (8002)                   | Image segmentation only               |
| Advise       | `/advise`     | Advise (8003)                    | Design recommendations only           |
| Generate     | `/generate`   | Generate (8004)                  | AI image generation only              |
| About        | `/about`      | None                             | About page                            |
| Login        | `/login`      | None                             | Authentication (UI only)              |

## 🔄 Service Workflow

### Individual Services (Direct Call)
```
Frontend Page → Service → Response
     ↓             ↓          ↓
   /detect    → Port 8001 → Objects detected
   /segment   → Port 8002 → Segmented image
   /advise    → Port 8003 → Design advice
   /generate  → Port 8004 → Generated image
```

### Full Workflow (AI Design Page)
```
Frontend (/ai-design)
       ↓
   Upload Image
       ↓
   runFullWorkflow()
       ↓
   ┌──────────────────────────────────┐
   │  1. Detect Objects (8001)        │ → Progress: 25%
   │  2. Segment Image (8002)         │ → Progress: 40%
   │  3. Get Advice (8003)            │ → Progress: 60%
   │  4. Generate Design (8004)       │ → Progress: 80%
   │  5. Save to DB (8000)            │ → Progress: 95%
   └──────────────────────────────────┘
       ↓
   Complete Results Displayed
```

## 🌐 API Endpoints

### Health Checks (All Services)
```bash
GET http://localhost:8000/  # Gateway
GET http://localhost:8001/  # Detect
GET http://localhost:8002/  # Segment
GET http://localhost:8003/  # Advise
GET http://localhost:8004/  # Generate
```

### Frontend Service Calls

**Detect Service:**
```javascript
import { detectObjects } from '../services/api'

const result = await detectObjects(imageFile)
// Returns: { objects, annotatedImage, confidence, boundingBoxes }
```

**Segment Service:**
```javascript
import { segmentImage } from '../services/api'

const result = await segmentImage(imageFile, numSamples)
// Returns: { segmentedImage, masks, numSegments }
```

**Advise Service:**
```javascript
import { getDesignAdvice } from '../services/api'

const result = await getDesignAdvice(imageFile, prompt)
// Returns: { advice, fullText, prompt }
```

**Generate Service:**
```javascript
import { generateDesign } from '../services/api'

const result = await generateDesign(imageFile, prompt, options)
// Returns: { generatedImage, prompt, cannyImage }
```

**Full Workflow:**
```javascript
import { runFullWorkflow } from '../services/api'

const results = await runFullWorkflow(
  imageFile, 
  prompt,
  (message, progress) => {
    // Progress callback
    console.log(`${message} - ${progress}%`)
  }
)
// Returns: { detection, segmentation, advice, generation }
```

## 🔧 Configuration

### Backend (.env in each service)
```env
# CORS origins
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Service URLs (for Gateway)
DETECT_URL=http://localhost:8001/detect/
SEGMENT_URL=http://localhost:8002/segment/
ADVISE_URL=http://localhost:8003/advise/
GENERATE_URL=http://localhost:8004/generate/
```

### Frontend (.env)
```env
VITE_API_GATEWAY=http://localhost:8000
VITE_DETECT_API=http://localhost:8001
VITE_SEGMENT_API=http://localhost:8002
VITE_ADVISE_API=http://localhost:8003
VITE_GENERATE_API=http://localhost:8004
```

## 🚀 Starting the Application

### 1. Start Backend Services
```powershell
cd artistry-backend
.\start_all_services.ps1
```

Wait for all services to show "ONLINE" status.

### 2. Start Frontend
```powershell
cd frontend
npm install  # First time only
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 3. Verify Integration
- Visit `http://localhost:5173`
- Navigate to `/ai-design`
- Upload an image
- Enter a design prompt
- Click "Generate Design"
- Watch progress as services execute in sequence

## 📊 Service Dependencies

### Virtual Environments (Isolated)
```
artistry-backend/
├── gateway/venv/     # FastAPI, Motor, HTTPx, Python-dotenv
├── detect/venv/      # Ultralytics, PyTorch, OpenCV, python-multipart
├── segment/venv/     # MobileSAM, PyTorch, timm, python-multipart
├── advise/venv/      # Transformers, Sentence-Transformers, protobuf
└── generate/venv/    # Diffusers, ControlNet-aux, Accelerate
```

### Model Sizes
- YOLOv8n: ~6 MB
- MobileSAM: ~40 MB
- GPT-2: ~500 MB (downloaded on first run)
- Stable Diffusion v1.5: ~4 GB (downloaded on first run)
- ControlNet Canny: ~1.5 GB (downloaded on first run)

## 🧪 Testing Integration

### 1. Individual Service Test
```powershell
cd artistry-backend
python test_services.py
```

### 2. Frontend Integration Test
1. Start all backend services
2. Start frontend: `npm run dev`
3. Navigate to each page:
   - `/detect` - Upload image, verify detection
   - `/segment` - Upload image, verify segmentation
   - `/advise` - Upload image, verify advice
   - `/generate` - Upload image, verify generation
   - `/ai-design` - Upload image, verify full workflow

## 🐛 Common Issues

### Services Not Connecting
**Issue**: Frontend shows "Connection refused"
**Solution**: 
1. Verify all services are running: `netstat -ano | findstr ":800"`
2. Check CORS settings in each service's `main.py`
3. Verify `.env` URLs match service ports

### Progress Stuck at Certain %
**Issue**: Workflow freezes at specific step
**Solution**:
1. Check service logs in terminal window
2. Verify service is responding: `curl http://localhost:800X/`
3. Check for errors in browser console

### Image Upload Fails
**Issue**: "python-multipart" error
**Solution**: Already installed in all services with file upload

### Generate Service Timeout
**Issue**: Generation takes too long or fails
**Solution**:
1. First generation loads models (2-3 min)
2. Increase timeout in frontend: `api.js`
3. Use smaller inference steps for faster results

## 📈 Performance Optimization

### Backend
- **GPU Detection**: Automatically uses CUDA if available
- **Model Caching**: Models load once at startup
- **Async Operations**: Gateway uses async for parallel calls

### Frontend
- **Progress Tracking**: Real-time feedback during workflow
- **Error Handling**: Graceful degradation on service failure
- **Image Optimization**: Resize before upload if needed

## 🔐 Security Notes

- CORS restricted to localhost for development
- File size limits can be added to prevent abuse
- Rate limiting recommended for production
- Authentication/authorization not yet implemented

## 📝 Next Steps

✅ Backend microservices running
✅ Frontend connected to all services
✅ Full workflow operational
✅ Individual service pages working

**Production Deployment:**
1. Add authentication layer
2. Configure production CORS
3. Set up reverse proxy (nginx)
4. Add rate limiting
5. Implement caching
6. Set up monitoring/logging
7. Docker containerization (optional)

## 📞 Support

For issues:
1. Check service logs in terminal windows
2. Verify `.env` configuration
3. Test services individually before full workflow
4. Check network/firewall settings
