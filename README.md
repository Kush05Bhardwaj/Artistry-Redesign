# Artistry 🎨

> **AI-Powered Interior Design Platform**

Transform room photos into professional designs using state-of-the-art AI. Upload once, get object detection, segmentation, design advice, and photorealistic redesigns—all automatically.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10-yellow.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.4-red.svg)](https://pytorch.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

![Artistry Demo](https://via.placeholder.com/800x400.png?text=Artistry+Full+Workflow+Demo)

## ✨ Features

- 🔍 **Object Detection** - Identify furniture and room elements with YOLOv8
- ✂️ **Image Segmentation** - Isolate design components with MobileSAM  
- 💡 **AI Design Advice** - Get professional recommendations
- 🎨 **Design Generation** - Create photorealistic redesigns with Stable Diffusion
- ⚡ **Full Workflow** - Process through all services automatically (30-60s)

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 16+
- MongoDB Atlas account (free tier)
- 15GB disk space, 8GB RAM

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Kush05Bhardwaj/Artistry-Redesign.git
cd Artistry-Redesign

# 2. Backend Setup
cd artistry-backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# 3. Frontend Setup
cd ../frontend
npm install

# 4. Configure Environment
# Create frontend/.env
VITE_GATEWAY_URL=http://localhost:8000
VITE_DETECT_URL=http://localhost:8001
VITE_SEGMENT_URL=http://localhost:8002
VITE_ADVISE_URL=http://localhost:8003
VITE_GENERATE_URL=http://localhost:8004
```

### Running the Application

**Option 1: Automated (Windows)**
```powershell
# Terminal 1 - Start all backend services
cd artistry-backend
.\start_all_services.ps1

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

**Option 2: Manual**
```bash
# Start each service in separate terminals
cd artistry-backend/gateway && uvicorn app.main:app --port 8000
cd artistry-backend/detect && uvicorn app.main:app --port 8001
cd artistry-backend/segment && uvicorn app.main:app --port 8002
cd artistry-backend/advise && uvicorn app.main:app --port 8003
cd artistry-backend/generate && uvicorn app.main:app --port 8004

# Start frontend
cd frontend && npm run dev
```

**Access**: http://localhost:5173

## 📖 Usage

### Full Workflow (Recommended)

1. Navigate to http://localhost:5173/workflow
2. Upload a room photo
3. Click "Start Complete Workflow"
4. Wait ~30-60 seconds
5. View all results: detection, segmentation, advice, and generated design

### Individual Services

Access services separately via navigation menu:
- `/detect` - Object detection only
- `/segment` - Image segmentation only
- `/advise` - Design advice only
- `/generate` - Design generation only

## 🏗️ Architecture

```
Frontend (React + Vite)
       ↓
Gateway Service (Port 8000)
       ↓
┌──────┴──────┬──────────┬───────────┐
Detect  Segment  Advise  Generate
:8001    :8002   :8003     :8004
```

**5 Microservices:**
- Gateway (orchestration + MongoDB)
- Detect (YOLOv8)
- Segment (MobileSAM)
- Advise (Vision-LLM)
- Generate (Stable Diffusion)

## 📚 Documentation

For detailed guides, API reference, and troubleshooting:

📘 **[Complete Documentation →](./docs/README.md)**

**Quick Links:**
- [Installation Guide](./docs/guides/INSTALLATION.md)
- [Architecture Details](./docs/architecture/SYSTEM_ARCHITECTURE.md)
- [API Reference](./docs/api/)
- [Troubleshooting](./docs/troubleshooting/COMMON_ISSUES.md)
- [Contributing Guide](./docs/guides/CONTRIBUTING.md)

## 🧪 Testing

```bash
# Check all services
cd artistry-backend
.\test_services.ps1

# Test individual service
curl http://localhost:8000/health
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | `taskkill /PID <PID> /F` (Windows) or `kill -9 <PID>` (Unix) |
| Module not found | Activate venv: `.\venv\Scripts\activate` |
| CORS error | Check `allow_origins` in service `main.py` |
| MongoDB connection | Whitelist IP in MongoDB Atlas |

**Full troubleshooting guide**: [docs/troubleshooting/](./docs/troubleshooting/COMMON_ISSUES.md)

## 📊 Performance

| Workflow | CPU | GPU (RTX 3060+) |
|----------|-----|-----------------|
| Full Workflow | 40-60s | 12-15s |
| Detection | 2-3s | 0.5s |
| Segmentation | 3-5s | 1s |
| Advice | 5-8s | 2s |
| Generation | 30-40s | 8s |

## 🗺️ Roadmap

### Current (v2.0)
✅ Full workflow automation  
✅ 5 microservices  
✅ MongoDB integration  
✅ Real-time progress tracking

### Upcoming (v2.1 - Q1 2026)
- User authentication
- Design history & saving
- Before/after comparison
- Room templates & style presets

[Full Roadmap →](./docs/ROADMAP.md)

## 🤝 Contributing

Contributions welcome! See our [Contributing Guide](./docs/guides/CONTRIBUTING.md).

```bash
1. Fork the repository
2. Create feature branch: git checkout -b feature/amazing
3. Commit changes: git commit -m 'Add feature'
4. Push: git push origin feature/amazing
5. Open Pull Request
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file.

**Third-party models**: Review individual licenses for YOLOv8, Stable Diffusion, SAM.

## 👥 Team

**Kushagra Bhardwaj** - [@Kush05Bhardwaj](https://github.com/Kush05Bhardwaj)
**Sahdev Sharma** - [@SAHDEVSHARMA](https://github.com/SAHDEVSHARMA)

## 📞 Support

- 🐛 [Issues](https://github.com/Kush05Bhardwaj/Artistry-Redesign/issues)
- 💬 [Discussions](https://github.com/Kush05Bhardwaj/Artistry-Redesign/discussions)
- 📧 kush2012bhardwaj@gmail.com
- 📧 sankusharma09@gmail.com

## 🙏 Acknowledgments

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- [Meta AI - Segment Anything](https://segment-anything.com/)
- [Stability AI - Stable Diffusion](https://stability.ai/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)

---

**[View Full Documentation](./docs/README.md)** | **[Backend Details](./artistry-backend/Readme.md)** | **[API Docs](http://localhost:8000/docs)**
