# System Architecture

Complete technical architecture documentation for Artistry.

## 📐 Overview

Artistry uses a **microservices architecture** where each AI model runs as an independent service. This design enables:

- **Independent Scaling** - Scale services based on demand
- **Fault Isolation** - One service failure doesn't affect others
- **Technology Flexibility** - Different frameworks per service
- **Easy Maintenance** - Update services independently

---

## 🏗️ High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                       │
│                   http://localhost:5173                           │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐            │
│  │  Home   │  │  Detect  │  │Segment │  │ Advise  │            │
│  └─────────┘  └──────────┘  └────────┘  └─────────┘            │
│  ┌─────────┐  ┌──────────────────────────────────┐              │
│  │Generate │  │    Full Workflow (Orchestration)  │              │
│  └─────────┘  └──────────────────────────────────┘              │
└──────────────────────┬───────────────────────────────────────────┘
                       │ REST API (HTTP/JSON)
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                   API Gateway (Port 8000)                         │
│           ┌──────────────────────────────────┐                   │
│           │  Request Routing & Orchestration │                   │
│           └──────────────────────────────────┘                   │
│                      │ MongoDB Atlas                             │
│                      ▼                                            │
│           [designs, users, history]                              │
└────────┬───────────┬───────────┬──────────┬───────────┬─────────┘
         │           │           │          │           │
    ┌────▼────┐ ┌───▼────┐ ┌────▼─────┐ ┌─▼────────┐ │
    │ Detect  │ │Segment │ │  Advise  │ │ Generate │ │
    │ Service │ │Service │ │  Service │ │  Service │ │
    │  :8001  │ │ :8002  │ │  :8003   │ │  :8004   │ │
    └─────────┘ └────────┘ └──────────┘ └──────────┘ │
         │           │           │            │        │
    ┌────▼────┐ ┌───▼────┐ ┌────▼─────┐ ┌───▼──────┐ │
    │ YOLOv8  │ │Mobile  │ │Vision-LLM│ │  Stable  │ │
    │ (6 MB)  │ │  SAM   │ │(500 MB)  │ │Diffusion │ │
    │         │ │(10 MB) │ │          │ │  (5 GB)  │ │
    └─────────┘ └────────┘ └──────────┘ └──────────┘ │
                                                       │
                              MongoDB Atlas ◄──────────┘
                         (Cloud Database - Shared)
```

---

## 🔧 Component Details

### Frontend Layer

**Technology**: React 18 + Vite 5  
**Port**: 5173  
**Responsibilities**:
- User interface and interactions
- Image upload handling
- Progress tracking and visualization
- Results display
- API calls to backend services

**Key Files**:
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx           # Landing page
│   │   ├── FullWorkflow.jsx   # Main workflow orchestration
│   │   ├── Detect.jsx         # Object detection page
│   │   ├── Segment.jsx        # Segmentation page
│   │   ├── Advise.jsx         # Design advice page
│   │   └── Generate.jsx       # Generation page
│   ├── services/
│   │   └── api.js             # Backend API integration
│   └── components/
│       ├── Navbar.jsx         # Navigation
│       └── Footer.jsx         # Footer
└── .env                       # API endpoints configuration
```

---

### Gateway Service

**Technology**: FastAPI + Motor + MongoDB  
**Port**: 8000  
**Responsibilities**:
- API request routing
- Workflow orchestration
- Data persistence (MongoDB)
- Cross-service communication
- Health monitoring

**Endpoints**:
```
GET  /                    # Health check
GET  /health              # Detailed health status
POST /designs/            # Save design (future)
GET  /designs/{id}        # Retrieve design (future)
```

**Database Schema**:
```javascript
// designs collection
{
  _id: ObjectId,
  user_id: String,
  image_url: String,
  detected_objects: Array,
  segmentation_data: Object,
  advice: Array,
  generated_image: String,
  created_at: DateTime,
  updated_at: DateTime
}
```

---

### Detect Service

**Technology**: FastAPI + Ultralytics (YOLOv8)  
**Port**: 8001  
**Model**: YOLOv8n (3.2M parameters, 6MB)  
**Responsibilities**:
- Real-time object detection
- Bounding box generation
- Object classification
- Confidence scoring

**Process Flow**:
```
Image Upload → Preprocessing → YOLOv8 Inference → 
Post-processing → Annotated Image + Object List
```

**Endpoints**:
```
GET  /                    # Health check
GET  /health              # Service status
POST /detect/             # Detect objects in image
```

**Input/Output**:
```json
// Input: multipart/form-data
{
  "file": <image_file>
}

// Output: JSON
{
  "objects": [
    {"class": "bed", "confidence": 0.92, "bbox": [x1, y1, x2, y2]},
    {"class": "lamp", "confidence": 0.87, "bbox": [x1, y1, x2, y2]}
  ],
  "annotated_image": "base64_encoded_string"
}
```

---

### Segment Service

**Technology**: FastAPI + PyTorch + MobileSAM  
**Port**: 8002  
**Model**: MobileSAM (10MB)  
**Responsibilities**:
- Image segmentation
- Mask generation
- Region isolation
- Color-coded visualization

**Process Flow**:
```
Image Upload → Point Sampling → MobileSAM → 
Mask Generation → Colored Segmentation Map
```

**Endpoints**:
```
GET  /                    # Health check
GET  /health              # Service status
POST /segment/            # Segment image
```

**Input/Output**:
```json
// Input
{
  "file": <image_file>,
  "num_samples": 10  // Optional, default: 10
}

// Output
{
  "segmented_image": "base64_encoded_string",
  "num_regions": 8,
  "masks": [...]
}
```

---

### Advise Service

**Technology**: FastAPI + Transformers + GPT-2  
**Port**: 8003  
**Model**: GPT-2 / LLaVA-inspired (500MB)  
**Responsibilities**:
- Image analysis
- Design recommendations
- Style suggestions
- Professional advice generation

**Process Flow**:
```
Image Upload → Feature Extraction → Context Building → 
LLM Generation → Design Advice
```

**Endpoints**:
```
GET  /                    # Health check
GET  /health              # Service status
POST /advise/             # Get design advice
```

**Input/Output**:
```json
// Input
{
  "file": <image_file>,
  "prompt": "Modern minimalist style"  // Optional
}

// Output
{
  "advice": [
    "Consider adding warm lighting...",
    "A neutral color palette would enhance...",
    "Minimalist furniture placement..."
  ],
  "style_suggestions": ["modern", "minimalist"],
  "confidence": 0.85
}
```

---

### Generate Service

**Technology**: FastAPI + Diffusers + Stable Diffusion  
**Port**: 8004  
**Model**: Stable Diffusion v1.5 + ControlNet (5GB)  
**Responsibilities**:
- AI image generation
- Style transfer
- Photorealistic redesign
- Prompt-based customization

**Process Flow**:
```
Image Upload + Prompt → Canny Edge Detection (ControlNet) → 
Stable Diffusion Inference → Image Generation → 
Post-processing → Generated Design
```

**Endpoints**:
```
GET  /                    # Health check
GET  /health              # Service status
POST /generate/           # Generate new design
```

**Input/Output**:
```json
// Input
{
  "file": <image_file>,
  "prompt": "Modern bedroom with warm tones",
  "num_inference_steps": 20,  // Optional
  "guidance_scale": 7.5        // Optional
}

// Output
{
  "generated_image": "base64_encoded_string",
  "seed": 42,
  "inference_time": 32.5
}
```

---

## 🔄 Data Flow

### Full Workflow Request Flow

```
1. User uploads image on Frontend (/workflow page)
                ↓
2. Frontend calls runFullWorkflow(image, prompt)
                ↓
3. Sequential API calls:
   
   Step 1: POST http://localhost:8001/detect/
   → Returns: {objects, annotated_image}
                ↓
   Step 2: POST http://localhost:8002/segment/
   → Returns: {segmented_image, masks}
                ↓
   Step 3: POST http://localhost:8003/advise/
   → Returns: {advice, style_suggestions}
                ↓
   Step 4: POST http://localhost:8004/generate/
   → Returns: {generated_image}
                ↓
4. (Optional) POST http://localhost:8000/designs/
   → Saves complete results to MongoDB
                ↓
5. Frontend displays unified results
```

---

## 💾 Data Storage

### MongoDB Atlas

**Collections**:

**1. designs**
```javascript
{
  _id: ObjectId("..."),
  user_id: "user123",
  original_image: "s3://bucket/image.jpg",
  detected_objects: [...],
  segmentation_result: {...},
  advice: [...],
  generated_image: "s3://bucket/generated.jpg",
  prompt: "Modern minimalist bedroom",
  created_at: ISODate("2025-11-22T10:30:00Z")
}
```

**2. users** (future)
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  name: "John Doe",
  created_at: ISODate("2025-11-22T10:00:00Z"),
  design_count: 5
}
```

---

## 🔒 Security Architecture

### Current Implementation

**CORS Configuration**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**File Upload Limits**:
- Max file size: 10MB (configurable)
- Allowed formats: JPEG, PNG, WebP
- Validation: File type and size checks

### Production Recommendations

- [ ] Add JWT authentication
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Enable HTTPS
- [ ] Use environment variables for secrets
- [ ] Add API key validation
- [ ] Implement request signing
- [ ] Add logging and monitoring

---

## 📊 Performance Characteristics

### Service Response Times (CPU)

| Service | Cold Start | Warm | Memory Usage |
|---------|-----------|------|--------------|
| Gateway | <100ms | <50ms | 50MB |
| Detect | 2-3s | 1-2s | 800MB |
| Segment | 4-6s | 2-3s | 1.2GB |
| Advise | 6-10s | 3-5s | 1.5GB |
| Generate | 40-60s | 30-40s | 4.5GB |

### With GPU (NVIDIA RTX 3060)

| Service | Response Time | Speedup |
|---------|--------------|---------|
| Detect | 0.5s | 4x |
| Segment | 1s | 3x |
| Advise | 2s | 2.5x |
| Generate | 8-10s | 4x |

---

## 🔌 Communication Patterns

### Synchronous REST API

All services communicate via REST API over HTTP:
- **Protocol**: HTTP/1.1
- **Format**: JSON
- **Method**: POST for processing, GET for health
- **Timeout**: 300s (for generation service)

### Future: Async Message Queue (Planned)

```
Frontend → Gateway → RabbitMQ/Redis Queue
                          ↓
          [Worker 1] [Worker 2] [Worker 3]
                          ↓
          Results → MongoDB → WebSocket → Frontend
```

---

## 📈 Scalability

### Horizontal Scaling

Each service can be scaled independently:

```yaml
# docker-compose.yml example
services:
  generate:
    image: artistry/generate
    deploy:
      replicas: 3  # Run 3 instances
    environment:
      - GPU_ID={0,1,2}
```

### Load Balancing

```
                    [Nginx Load Balancer]
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   [Generate-1]        [Generate-2]        [Generate-3]
    GPU 0               GPU 1               GPU 2
```

---

## 🛠️ Development Architecture

### Local Development

```
Developer Machine
├── Frontend (Vite Dev Server) :5173
│   └── Hot Module Reload
├── Gateway (Uvicorn --reload) :8000
├── Detect (Uvicorn --reload) :8001
├── Segment (Uvicorn --reload) :8002
├── Advise (Uvicorn --reload) :8003
└── Generate (Uvicorn --reload) :8004
```

### Production Deployment

```
Cloud Provider (AWS/GCP/Azure)
├── Frontend (S3 + CloudFront / Vercel)
├── Gateway (ECS Container / Cloud Run)
├── AI Services (GPU Instances / Kubernetes)
│   ├── Detect (CPU instance)
│   ├── Segment (CPU instance)
│   ├── Advise (GPU instance)
│   └── Generate (GPU instance)
└── MongoDB Atlas (Cloud Database)
```

---

## 📚 Related Documentation

- [Installation Guide](../guides/INSTALLATION.md)
- [API Reference](../api/)
- [Deployment Guide](../guides/DEPLOYMENT.md)
- [Performance Optimization](../troubleshooting/PERFORMANCE.md)

---

**[← Back to Documentation](../README.md)**
