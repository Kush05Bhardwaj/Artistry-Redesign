# Artistry V2 - AI-Powered Interior Design Backend

A microservices-based backend for AI-driven interior design recommendations, featuring object detection, image segmentation, design advice, and AI image generation.

## 🏗️ Architecture

This backend consists of **5 microservices** that work together to provide comprehensive AI-powered interior design capabilities:

```
┌─────────────────────────────────────────────────────────────┐
│                  Gateway Service (Port 8000)                 │
│              API Router & Request Orchestration              │
└────────────┬────────────┬────────────┬──────────┬───────────┘
             │            │            │          │
    ┌────────▼───┐ ┌─────▼─────┐ ┌───▼────┐ ┌──▼────────┐
    │  Detect    │ │  Segment  │ │ Advise │ │ Generate  │
    │ (YOLOv8)   │ │(MobileSAM)│ │(GPT-2) │ │(Stable    │
    │ Port 8001  │ │Port 8002  │ │Port    │ │Diffusion) │
    │            │ │           │ │8003    │ │Port 8004  │
    └────────────┘ └───────────┘ └────────┘ └───────────┘
```

## 📦 Services

### 1. **Gateway Service** (Port 8000)
- **Purpose**: API gateway and request orchestration
- **Technology**: FastAPI, Motor (MongoDB async)
- **Endpoints**: 
  - `GET /` - Health check
  - `POST /rooms` - Start full workflow
  - `GET /rooms/{job_id}` - Check job status

### 2. **Detect Service** (Port 8001)
- **Purpose**: Object detection in room images
- **Model**: YOLOv8n (Ultralytics)
- **Endpoints**:
  - `GET /` - Health check
  - `POST /detect/` - Detect objects in uploaded image

### 3. **Segment Service** (Port 8002)
- **Purpose**: Image segmentation for precise object isolation
- **Model**: MobileSAM (Segment Anything Model)
- **Endpoints**:
  - `GET /` - Health check
  - `POST /segment/` - Segment image regions

### 4. **Advise Service** (Port 8003)
- **Purpose**: Design advice and recommendations
- **Model**: GPT-2 (fallback), Sentence Transformers for embeddings
- **Endpoints**:
  - `GET /` - Health check
  - `POST /advise/` - Get design recommendations

### 5. **Generate Service** (Port 8004)
- **Purpose**: AI-powered room redesign generation
- **Model**: Stable Diffusion v1.5 + ControlNet (Canny)
- **Endpoints**:
  - `GET /` - Health check
  - `POST /generate/` - Generate new design

- **Purpose**: API gateway and request orchestration- generate: use `diffusers` + ControlNet with `stable-fast` or ONNX/Trton for optimized inference on GPU.

- **Tech Stack**: FastAPI, Motor (async MongoDB)

- **Features**:
  - Routes requests to appropriate AI services
  - Manages workflow coordination
  - MongoDB Atlas integration for data persistence

### 2. **Detect Service** (Port 8001)
- **Purpose**: Object detection in interior images
- **Model**: YOLOv8n (nano) - 3.2M parameters
- **Tech Stack**: Ultralytics, FastAPI
- **Features**:
  - Real-time object detection
  - Identifies furniture and room elements
  - Bounding box generation

### 3. **Segment Service** (Port 8002)
- **Purpose**: Precise image segmentation
- **Model**: MobileSAM (lightweight SAM)
- **Tech Stack**: MobileSAM, FastAPI
- **Features**:
  - Fine-grained object segmentation
  - Mask generation for detected objects
  - Optimized for mobile/CPU deployment

### 4. **Advise Service** (Port 8003)
- **Purpose**: AI-powered design recommendations
- **Model**: LLaVA-7B (Vision-Language Model)
- **Tech Stack**: Transformers, Sentence-Transformers, FastAPI
- **Features**:
  - Context-aware design advice
  - Natural language recommendations
  - Knowledge base retrieval

### 5. **Generate Service** (Port 8004)
- **Purpose**: AI image generation with control
- **Model**: Stable Diffusion v1.5 + ControlNet (Canny)
- **Tech Stack**: Diffusers, FastAPI
- **Features**:
  - Text-to-image generation
  - Canny edge-guided generation
  - Customizable inference parameters

## 🚀 Quick Start

### Prerequisites

- **Python**: 3.10+
- **RAM**: 16GB minimum (32GB recommended)
- **Storage**: ~25GB for AI models
- **MongoDB Atlas**: Free tier account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artistry-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   .\venv\Scripts\Activate.ps1
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   
   # Install MobileSAM separately
   pip install git+https://github.com/ChaoningZhang/MobileSAM.git
   ```

4. **Configure environment**
   
   Create/edit `.env` file:
   ```env
   # MongoDB Atlas (recommended)
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appname>
   MONGO_DB=artistry
   
   # Or Local MongoDB
   # MONGO_URI=mongodb://root:example@localhost:27017
   
   # Service URLs (for Docker deployment)
   DETECT_URL=http://localhost:8001/detect
   SEGMENT_URL=http://localhost:8002/segment
   ADVISE_URL=http://localhost:8003/advise
   GENERATE_URL=http://localhost:8004/render
   ```

### Running Services

#### Option 1: Manual Start (Recommended for Development)

Start each service in a separate terminal:

```bash
# Activate venv in each terminal
.\venv\Scripts\Activate.ps1

# Terminal 1: Gateway
cd gateway/app
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Detect
cd detect/app
python -m uvicorn main:app --host 0.0.0.0 --port 8001

# Terminal 3: Segment
cd segment/app
python -m uvicorn main:app --host 0.0.0.0 --port 8002

# Terminal 4: Advise
cd advise/app
python -m uvicorn main:app --host 0.0.0.0 --port 8003

# Terminal 5: Generate
cd generate/app
python -m uvicorn main:app --host 0.0.0.0 --port 8004
```

#### Option 2: Docker Compose

```bash
docker-compose up --build
```

**Note**: Docker deployment may encounter network issues on some systems. Manual start is more reliable.

### Automated Start (Windows)

Use the provided PowerShell script to start all services:

```powershell
.\Start-AllServices.ps1
```

This opens 5 PowerShell windows, one for each service.

## 📡 API Endpoints

### Gateway (http://localhost:8000)
- `POST /create-room` - Create a design project
- Interactive docs: http://localhost:8000/docs

### Detect (http://localhost:8001)
- `POST /detect` - Detect objects in images
- Interactive docs: http://localhost:8001/docs

### Segment (http://localhost:8002)
- `POST /segment` - Generate segmentation masks
- Interactive docs: http://localhost:8002/docs

### Advise (http://localhost:8003)
- `POST /advise` - Get AI design recommendations
- Interactive docs: http://localhost:8003/docs

### Generate (http://localhost:8004)
- `POST /render` - Generate AI images
- Interactive docs: http://localhost:8004/docs

## ⚙️ Configuration

### CPU vs GPU

**Current Setup: CPU-Optimized**

The services are configured for CPU-only deployment:
- ✅ PyTorch 2.4.0 (CPU version)
- ✅ Float32 precision (CPU-compatible)
- ✅ No CUDA dependencies
- ✅ Quantization disabled (CPU)

**For GPU deployment**:
1. Install CUDA-enabled PyTorch: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118`
2. Update service code to use `torch.float16` and enable quantization
3. Ensure CUDA 11.8+ is installed

### Model Loading Times

First-time startup downloads models from Hugging Face:

| Service | Model Size | Download Time | Startup Time |
|---------|-----------|---------------|--------------|
| Detect | ~6MB | <1 min | ~5 sec |
| Segment | ~40MB | 1-2 min | ~10 sec |
| Advise | ~13GB | 5-15 min | 2-5 min |
| Generate | ~4GB | 3-8 min | 30-60 sec |
| Gateway | N/A | N/A | ~1 sec |

**Subsequent startups**: Models are cached, services start in 10-60 seconds.

## 🔧 Development

### Project Structure

```
artistry-backend/
├── gateway/
│   ├── app/
│   │   └── main.py          # Gateway service
│   └── Dockerfile
├── detect/
│   ├── app/
│   │   ├── main.py          # YOLOv8 detection
│   │   └── yolov8n.pt       # Model weights (auto-downloaded)
│   └── Dockerfile
├── segment/
│   ├── app/
│   │   ├── main.py          # MobileSAM segmentation
│   │   ├── mobile_sam.pt    # Model weights
│   │   └── MobileSAM/       # MobileSAM package (git clone)
│   └── Dockerfile
├── advise/
│   ├── app/
│   │   └── main.py          # LLaVA advice service
│   └── Dockerfile
├── generate/
│   ├── app/
│   │   └── main.py          # Stable Diffusion generation
│   └── Dockerfile
├── docker-compose.yml        # Multi-service orchestration
├── requirements.txt          # Python dependencies
├── .env                      # Environment configuration
└── README.md                 # This file
```

### Adding New Services

1. Create service directory: `mkdir new-service/app`
2. Add FastAPI app: `new-service/app/main.py`
3. Create Dockerfile: `new-service/Dockerfile`
4. Add to docker-compose.yml
5. Update Gateway routing

## 🐛 Troubleshooting

### Services Won't Start

**Check dependencies**:
```bash
pip list | grep -E "motor|sentence-transformers|mobile-sam|torch|diffusers"
```

**Install missing packages**:
```bash
pip install motor sentence-transformers
pip install git+https://github.com/ChaoningZhang/MobileSAM.git
```

### MongoDB Connection Errors

1. Verify MongoDB Atlas cluster is running
2. Check IP whitelist (allow 0.0.0.0/0 for testing)
3. Verify connection string in `.env`
4. Test connection: `mongosh "your-connection-string"`

### Out of Memory

**Reduce memory usage**:
- Close unnecessary services
- Use smaller models (already using nano/mobile variants)
- Increase system swap space
- Run services one at a time

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :8000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (Linux/Mac)
kill -9 <process_id>
```

## 📊 Performance

### CPU Performance (Approximate)

| Service | Inference Time | Memory Usage |
|---------|---------------|--------------|
| Detect | ~100ms/image | ~500MB |
| Segment | ~500ms/image | ~1GB |
| Advise | ~10-30s/query | ~13GB |
| Generate | ~60-300s/image | ~4-6GB |

**Note**: GPU deployment is 10-50x faster for Generate and Advise services.

## 🔒 Security

### Production Checklist

- [ ] Change default MongoDB credentials
- [ ] Use environment variables for secrets (never commit `.env`)
- [ ] Enable MongoDB authentication
- [ ] Restrict MongoDB IP whitelist
- [ ] Add rate limiting to Gateway
- [ ] Enable HTTPS/TLS
- [ ] Add API authentication (JWT/OAuth)
- [ ] Implement input validation
- [ ] Add CORS configuration
- [ ] Monitor and log requests

## 📝 Dependencies

### Core Frameworks
- **FastAPI**: Web framework for APIs
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

### AI/ML Libraries
- **PyTorch** (2.4.0+cpu): Deep learning framework
- **Transformers**: Hugging Face models
- **Diffusers**: Stable Diffusion pipelines
- **Ultralytics**: YOLOv8 implementation
- **Sentence-Transformers**: Text embeddings

### Database
- **PyMongo**: MongoDB driver
- **Motor**: Async MongoDB driver

### Computer Vision
- **OpenCV**: Image processing
- **Pillow**: Image manipulation
- **NumPy**: Numerical operations

### Utilities
- **python-dotenv**: Environment management
- **httpx**: HTTP client (for service communication)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

[Add your license here]

## 👥 Authors

[Add authors/contributors]

## 🙏 Acknowledgments

- **YOLOv8**: [Ultralytics](https://github.com/ultralytics/ultralytics)
- **MobileSAM**: [ChaoningZhang](https://github.com/ChaoningZhang/MobileSAM)
- **LLaVA**: [haotian-liu](https://github.com/haotian-liu/LLaVA)
- **Stable Diffusion**: [Stability AI](https://stability.ai/)
- **ControlNet**: [lllyasviel](https://github.com/lllyasviel/ControlNet)

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: [your-contact-info]

---

**Built with ❤️ for AI-powered interior design**
