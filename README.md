# Artistry-V2 🎨

An AI-powered interior design platform that transforms room photos into professional design visualizations. Upload a photo of your space, and let our AI models analyze, segment, advise, and generate stunning redesigns.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10-yellow.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.4-red.svg)](https://pytorch.org/)

## 🌟 Overview

Artistry-V2 is a comprehensive interior design solution combining multiple state-of-the-art AI models:

- **YOLOv8** for real-time object detection
- **MobileSAM** for precise image segmentation
- **LLaVA** for intelligent design advice
- **Stable Diffusion** for photorealistic design generation

The platform uses a **microservices architecture** with a React frontend and FastAPI backend services, enabling modular, scalable AI-powered design workflows.

## ✨ Key Features

### 🔍 Object Detection
Identify furniture, decor, and architectural elements in room photos with YOLOv8's state-of-the-art object detection.

### ✂️ Image Segmentation
Isolate and analyze different design elements using MobileSAM's efficient segmentation algorithm.

### 💡 AI Design Advice
Receive professional interior design recommendations powered by LLaVA vision-language model.

### 🎨 Design Generation
Generate photorealistic room redesigns with Stable Diffusion, customizable with text prompts.

### 🔄 Full Workflow (NEW!)
Upload once, process through all AI services automatically. Real-time progress tracking with unified results display.

## 🏗️ Architecture

```
Artistry-V2/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/              # Individual feature pages
│   │   ├── services/api.js     # Backend API integration
│   │   └── components/         # Reusable UI components
│   └── .env                    # Frontend environment config
│
└── artistry-backend/           # Python FastAPI microservices
    ├── gateway/                # API Gateway (Port 8000)
    ├── detect/                 # YOLOv8 Detection Service (Port 8001)
    ├── segment/                # MobileSAM Segmentation (Port 8002)
    ├── advise/                 # LLaVA Advice Service (Port 8003)
    ├── generate/               # Stable Diffusion Generation (Port 8004)
    └── requirements.txt        # Python dependencies
```

### Microservices Overview

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| **Gateway** | 8000 | FastAPI | API orchestration and routing |
| **Detect** | 8001 | YOLOv8 + FastAPI | Object detection in images |
| **Segment** | 8002 | MobileSAM + FastAPI | Image segmentation |
| **Advise** | 8003 | LLaVA + FastAPI | Design recommendations |
| **Generate** | 8004 | Stable Diffusion + FastAPI | Image generation |

## 🚀 Quick Start

> **⚡ NEW: Full Workflow Feature**  
> Upload once, process through all AI services automatically!  
> See [QUICKSTART_WORKFLOW.md](./QUICKSTART_WORKFLOW.md) for the fastest way to get started.

### Prerequisites

- **Python** 3.10 or higher
- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **MongoDB Atlas** account (for data persistence)
- **10GB+ disk space** (for AI models)
- **8GB+ RAM** recommended

### 1. Clone Repository

```bash
git clone https://github.com/Kush05Bhardwaj/Artistry-Redesign.git
cd Artistry-V2
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
cd artistry-backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** PyTorch installation may take several minutes. The system uses CPU-optimized PyTorch 2.4.0.

#### Download AI Models

The models will be automatically downloaded on first run, but you can manually place them:

- **YOLOv8:** `detect/app/yolov8n.pt`
- **MobileSAM:** `segment/app/mobile_sam.pt`

#### Configure MongoDB

Each service needs MongoDB connection. Update in each `main.py`:

```python
# Example: detect/app/main.py
MONGO_URI = "your-mongodb-atlas-connection-string"
```

Or set environment variable:
```bash
export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/"
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Configure Environment

Create `frontend/.env`:

```env
VITE_GATEWAY_URL=http://localhost:8000
VITE_DETECT_URL=http://localhost:8001
VITE_SEGMENT_URL=http://localhost:8002
VITE_ADVISE_URL=http://localhost:8003
VITE_GENERATE_URL=http://localhost:8004
```

### 4. Running the Application

#### Start Backend Services

Open **5 terminal windows** and run:

```bash
# Activate venv in each terminal first
cd artistry-backend
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
```

**Terminal 1 - Gateway:**
```bash
cd gateway
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Detect:**
```bash
cd detect
uvicorn app.main:app --reload --port 8001
```

**Terminal 3 - Segment:**
```bash
cd segment
uvicorn app.main:app --reload --port 8002
```

**Terminal 4 - Advise:**
```bash
cd advise
uvicorn app.main:app --reload --port 8003
```

**Terminal 5 - Generate:**
```bash
cd generate
uvicorn app.main:app --reload --port 8004
```

#### Start Frontend

In a **new terminal**:

```bash
cd frontend
npm run dev
```

Access the application at **http://localhost:5173**

## 📖 Usage Guide

### 1. Object Detection

1. Navigate to **Detect** page
2. Upload a room photo (JPEG/PNG, max 10MB)
3. Click **Detect Objects**
4. View annotated image with bounding boxes
5. See list of detected objects with confidence scores

### 2. Image Segmentation

1. Navigate to **Segment** page
2. Upload a room photo
3. Adjust number of samples (default: 10)
4. Click **Segment Image**
5. View segmented regions in different colors

### 3. Design Advice

1. Navigate to **Advise** page
2. Upload a room photo
3. Click **Get Design Advice**
4. Receive AI-generated recommendations:
   - Color scheme suggestions
   - Furniture placement tips
   - Lighting recommendations
   - Style improvements

### 4. Design Generation

1. Navigate to **Generate** page
2. Upload a room photo
3. Enter a design prompt (e.g., "modern minimalist bedroom with warm tones")
4. Click **Generate Design**
5. Wait 30-60 seconds for AI generation
6. View your new design

**Generation Parameters:**
- Inference Steps: 20 (adjustable)
- Guidance Scale: 7.5 (adjustable)
- Output: 512x512 pixels

### 5. Full Workflow (NEW! ⚡)

**The fastest way to process your room through all AI services:**

1. Navigate to **Full Workflow** page (`/workflow`)
2. Upload a room photo **once**
3. Click **Start Complete Workflow**
4. Watch automatic processing:
   - 🔍 Detecting objects (Step 1/4)
   - ✂️ Segmenting image (Step 2/4)
   - 💡 Getting design advice (Step 3/4)
   - 🎨 Generating redesign (Step 4/4)
5. View all results in unified display:
   - Annotated image with detected objects
   - Segmented regions visualization
   - Professional design recommendations
   - AI-generated redesign

**Total Time:** ~30-60 seconds  
**Benefits:** Single upload, automatic processing, unified results

For detailed instructions, see [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)

## 🔧 Configuration

### Backend Configuration

Each service's `main.py` contains configurable parameters:

**Detect Service (`detect/app/main.py`):**
```python
MODEL_PATH = "app/yolov8n.pt"  # YOLOv8 model path
CONFIDENCE_THRESHOLD = 0.25     # Detection confidence
```

**Segment Service (`segment/app/main.py`):**
```python
MODEL_PATH = "app/mobile_sam.pt"  # MobileSAM model
DEFAULT_SAMPLES = 10              # Segmentation points
```

**Generate Service (`generate/app/main.py`):**
```python
MODEL_ID = "stabilityai/stable-diffusion-2-1"
DEFAULT_STEPS = 20                # Inference steps
DEFAULT_GUIDANCE = 7.5            # Guidance scale
```

### Frontend Configuration

**API Endpoints** (`frontend/.env`):
```env
VITE_GATEWAY_URL=http://localhost:8000
VITE_DETECT_URL=http://localhost:8001
VITE_SEGMENT_URL=http://localhost:8002
VITE_ADVISE_URL=http://localhost:8003
VITE_GENERATE_URL=http://localhost:8004
```

**Styling** (`frontend/tailwind.config.js`):
```javascript
theme: {
  extend: {
    colors: {
      primary: '#78350f',    // Amber-900
      secondary: '#fbbf24',  // Amber-400
    },
  },
}
```

## 🛠️ Development

### Adding a New Backend Service

1. Create new service directory:
```bash
mkdir artistry-backend/newservice
mkdir artistry-backend/newservice/app
```

2. Create `main.py`:
```python
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process/")
async def process(file: UploadFile):
    # Your logic here
    return {"result": "success"}
```

3. Add to `requirements.txt` if needed

4. Update frontend `api.js` with new function

5. Run on new port: `uvicorn app.main:app --reload --port 8006`

### Adding a New Frontend Page

1. Create page component:
```javascript
// src/pages/NewPage.jsx
export default function NewPage() {
  return (
    <main className="min-h-screen bg-white">
      <h1>New Feature</h1>
    </main>
  );
}
```

2. Add route in `App.jsx`:
```javascript
import NewPage from "./pages/NewPage";

<Route path="/new-page" element={<NewPage />} />
```

3. Add to navigation in `Navbar.jsx`

### Testing

#### Backend Testing

```bash
# Test individual service
cd artistry-backend/detect
uvicorn app.main:app --reload --port 8001

# Visit http://localhost:8001/docs for Swagger UI
```

#### Frontend Testing

```bash
cd frontend
npm run dev

# Test individual pages
# Check browser console for API errors
```

## 📦 Dependencies

### Backend (Python)

```
fastapi==0.115.5          # Web framework
uvicorn==0.32.1           # ASGI server
python-multipart==0.0.17  # File upload support
torch==2.4.0+cpu          # PyTorch (CPU)
torchvision==0.19.0+cpu   # Computer vision
ultralytics==8.3.30       # YOLOv8
numpy==1.26.4             # Numerical computing
opencv-python==4.10.0.84  # Image processing
Pillow==11.0.0            # Image handling
motor==3.6.0              # MongoDB async driver
```

### Frontend (JavaScript)

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "vite": "^5.4.10",
  "tailwindcss": "^3.4.14",
  "lucide-react": "^0.454.0"
}
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Service Won't Start

**Error:** `Port already in use`
```bash
# Find and kill process
# Windows:
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8001 | xargs kill -9
```

**Error:** `ModuleNotFoundError`
```bash
# Ensure venv is activated and dependencies installed
pip install -r requirements.txt
```

**Error:** `Model file not found`
```bash
# Download models manually
# YOLOv8: https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
# Place in detect/app/yolov8n.pt
```

#### Frontend Issues

**Error:** `CORS Error`
- Check backend CORS settings in each `main.py`
- Verify `allow_origins` includes `http://localhost:5173`
- Restart backend services after changes

**Error:** `API Connection Failed`
```javascript
// Check service health
import { checkServicesHealth } from './services/api';
const health = await checkServicesHealth();
console.log(health);
```

**Error:** `Module not found`
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Performance Issues

**Slow Image Generation:**
- Generation takes 30-60 seconds (normal for Stable Diffusion)
- Reduce `numInferenceSteps` to 10-15 for faster results
- Use smaller images (resize to max 1024px)

**High Memory Usage:**
- Backend services load large AI models
- Recommended: 8GB+ RAM
- Close unused services if needed

**MongoDB Connection Failed:**
- Check connection string format
- Verify network access in MongoDB Atlas
- Whitelist your IP address

### Debug Mode

Enable detailed logging:

**Backend:**
```python
# In main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```javascript
// In api.js
console.log('API Request:', url, data);
console.log('API Response:', response);
```

## 📊 API Documentation

Each backend service provides interactive API documentation at `/docs`:

- Gateway: http://localhost:8000/docs
- Detect: http://localhost:8001/docs
- Segment: http://localhost:8002/docs
- Advise: http://localhost:8003/docs
- Generate: http://localhost:8004/docs

## 🔒 Security Considerations

- **CORS:** Currently allows localhost only. Update for production.
- **File Upload:** Validate file types and sizes
- **MongoDB:** Use environment variables for credentials
- **API Keys:** Store sensitive keys in `.env` files (not in git)

**Production checklist:**
- [ ] Update CORS origins
- [ ] Add authentication
- [ ] Implement rate limiting
- [ ] Enable HTTPS
- [ ] Validate all inputs
- [ ] Add file size limits
- [ ] Use environment variables for secrets

## 🚀 Deployment

### Backend Deployment

**Option 1: Docker (Recommended)**
```dockerfile
# Dockerfile example
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Option 2: Cloud Platforms**
- **Heroku:** `git push heroku master`
- **AWS:** Use Elastic Beanstalk or ECS
- **Google Cloud:** Use Cloud Run or App Engine
- **Railway:** Connect GitHub repo

### Frontend Deployment

```bash
# Build for production
cd frontend
npm run build

# Deploy dist/ folder to:
# - Netlify: Drag and drop
# - Vercel: vercel --prod
# - GitHub Pages: Push to gh-pages
```

## 📈 Performance Optimization

### Backend
- Use GPU acceleration for faster inference
- Implement caching for frequent requests
- Use CDN for model files
- Enable response compression

### Frontend
- Lazy load images
- Code splitting with React.lazy
- Compress images before upload
- Use production build

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for JavaScript
- Write descriptive commit messages
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Kush Bhardwaj** - Project Lead & Developer

## 🙏 Acknowledgments

- **Ultralytics** - YOLOv8 object detection
- **Meta AI** - Segment Anything Model
- **Stability AI** - Stable Diffusion
- **FastAPI** - Modern web framework
- **React** - Frontend library

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/Kush05Bhardwaj/Artistry-Redesign/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Kush05Bhardwaj/Artistry-Redesign/discussions)
- **Email:** kush2012bhardwaj@gmail.com

## 🗺️ Roadmap

### Version 2.1 (Upcoming)
- [ ] User authentication and profiles
- [ ] Save and share designs
- [ ] Multiple room type support
- [ ] Style transfer options
- [ ] Before/after comparison slider

### Version 2.2 (Future)
- [ ] Mobile app (React Native)
- [ ] 3D room visualization
- [ ] AR preview feature
- [ ] Furniture recommendation marketplace
- [ ] Social sharing features

### Version 3.0 (Vision)
- [ ] Real-time collaboration
- [ ] Professional designer network
- [ ] VR room walkthrough
- [ ] AI chatbot assistant
- [ ] Custom model training

## 📚 Additional Resources

### Documentation
- **[QUICKSTART_WORKFLOW.md](./QUICKSTART_WORKFLOW.md)** - Quick start guide for Full Workflow feature
- **[WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)** - Comprehensive workflow documentation
- **[WORKFLOW_COMPLETE.md](./WORKFLOW_COMPLETE.md)** - Implementation completion summary
- **[VENV_SETUP_GUIDE.md](./VENV_SETUP_GUIDE.md)** - Virtual environment setup guide
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Frontend-backend integration
- [Frontend README](./frontend/README.md)
- [Backend README](./artistry-backend/README.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [API Documentation](http://localhost:8000/docs)

---

**Built with ❤️ by the Artistry team**

*Transform your space with AI-powered design intelligence.*
