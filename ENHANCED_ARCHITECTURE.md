# Artistry AI - Enhanced Architecture Implementation

## 🎨 Overview

Artistry AI is now a **complete, intelligent interior design platform** with budget-aware reasoning, item condition analysis, and integrated shopping recommendations. This implementation follows a sophisticated multi-layer architecture that goes beyond simple image generation.

## 🏗️ Architecture Layers

### 1️⃣ **Image Analysis Layer** ✅ COMPLETE
- **Detect** (YOLOv8n) - Object detection for furniture and interior elements
- **Segment** (MobileSAM) - Precise segmentation with edge refinement
- **Vision Analyzer** (LLaVA) - Visual analysis and condition assessment

### 2️⃣ **User Interaction Layer** ✅ COMPLETE
- **Budget Collector** - Low/Medium/High budget tiers
- **Design Preference Collector** - Free-text design style input
- **Item Replacement Selector** - User-controlled item selection with condition hints

### 3️⃣ **Design Intelligence Layer** ✅ COMPLETE
- **Base Design Planner** - AI-generated initial design concepts
- **Budget-Constrained Design Refiner** - Material selection based on budget
- **Item Upgrade Reasoner** - Smart decision-making for replacements

### 4️⃣ **Image Generation Layer** ✅ COMPLETE
- **SD Img2Img** - Global room redesign
- **ControlNet (Canny)** - Structure preservation
- **Per-Object Inpainting** - Precise item-by-item redesign

### 5️⃣ **Post-Generation Analysis** ✅ COMPLETE
- **Item Attribution** - Identify items in generated design
- **Style Classification** - Extract overall design style
- **Shopping Metadata Generator** - Material, color, style extraction

### 6️⃣ **Commerce Layer** ✅ COMPLETE
- **Product Matching** - Semantic search-based product recommendations
- **Affiliate Link Generation** - Shopping redirection with tracking
- **Budget-Aware Filtering** - Products matched to user budget

---

## 🚀 New API Endpoints

### **Advise Service** (Port 8003)

#### 1. Condition Detection
```bash
POST /condition/detect
```
**Input:**
```json
{
  "image_b64": "base64_string",
  "objects_detected": ["bed", "chair", "curtains"]
}
```
**Output:**
```json
{
  "condition_estimates": {
    "bed": "old",
    "chair": "acceptable",
    "curtains": "old"
  },
  "detailed_conditions": [...]
}
```

#### 2. Budget-Aware Design Refinement
```bash
POST /advise/refine-budget
```
**Input:**
```json
{
  "base_design": {...},
  "budget": "medium",
  "item_selection": ["bed", "curtains"]
}
```
**Output:**
```json
{
  "materials": {
    "bed": "engineered wood with quality upholstered headboard",
    "curtains": "poly-linen blend"
  },
  "detailed_specs": [...],
  "cost_estimate": "medium"
}
```

#### 3. Item Upgrade Reasoning
```bash
POST /advise/reason-upgrades
```
**Input:**
```json
{
  "item_conditions": {"bed": "old", "curtains": "outdated"},
  "user_selection": ["bed", "curtains"],
  "budget": "medium"
}
```
**Output:**
```json
{
  "replace": ["bed", "curtains"],
  "keep": ["wardrobe"],
  "reasoning": {...}
}
```

---

### **Generate Service** (Port 8004)

#### 1. Budget-Aware Generation
```bash
POST /generate/budget-aware
```
**Input:**
```json
{
  "image_b64": "base64_string",
  "base_prompt": "Modern minimalist design",
  "material_specs": {
    "bed": {"material": "engineered wood", "finish": "fabric upholstery"}
  },
  "replace_items": ["bed", "curtains"],
  "budget": "medium",
  "masks": {...}
}
```
**Output:**
```json
{
  "image_b64": "generated_image_base64",
  "prompt_used": "detailed_prompt",
  "materials_applied": {...}
}
```

#### 2. Post-Generation Analysis
```bash
POST /generate/analyze-output
```
**Input:**
```json
{
  "generated_image_b64": "base64_string",
  "replaced_items": ["bed", "curtains"]
}
```
**Output:**
```json
{
  "items": [
    {
      "item_type": "bed",
      "style": "modern",
      "material": "engineered wood",
      "color": "beige",
      "confidence": 0.85
    }
  ],
  "overall_style": "Modern Minimalist",
  "color_palette": ["beige", "white", "grey"]
}
```

---

### **Gateway Service** (Port 8000)

#### 1. Collect User Preferences
```bash
POST /api/collect-preferences
```
**Input:**
```json
{
  "budget_range": "medium",
  "design_tips": "modern minimal with wood tones",
  "item_replacement": ["bed", "curtains"]
}
```
**Output:**
```json
{
  "session_id": "uuid",
  "preferences_saved": true
}
```

#### 2. Enhanced Workflow (Complete Pipeline)
```bash
POST /workflow/enhanced
```
**Input:**
```json
{
  "image_b64": "base64_string",
  "session_id": "uuid",
  "base_prompt": "Modern interior design"
}
```
**Output:**
```json
{
  "generated_image": "base64_string",
  "objects_detected": [...],
  "condition_analysis": {...},
  "items_replaced": [...],
  "budget_applied": "medium",
  "materials_used": {...},
  "shopping_metadata": [...]
}
```

---

### **Commerce Service** (Port 8005)

#### 1. Product Matching
```bash
POST /commerce/match-products
```
**Input:**
```json
{
  "item_type": "bed",
  "style": "modern",
  "material": "engineered wood",
  "color": "beige",
  "budget": "medium"
}
```
**Output:**
```json
{
  "matches": [
    {
      "product_id": "bed_001",
      "name": "Modern Upholstered Platform Bed",
      "vendor": "Amazon",
      "price": "$399",
      "url": "https://...",
      "match_score": 0.87,
      "affiliate": true
    }
  ]
}
```

#### 2. Generate Affiliate Links
```bash
POST /commerce/generate-affiliate-links
```
**Input:**
```json
{
  "items": [{"product_id": "bed_001", "quantity": 1}],
  "session_id": "uuid"
}
```
**Output:**
```json
{
  "affiliate_links": [...],
  "estimated_total": "$399.00"
}
```

---

## 📦 Installation & Setup

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd artistry-backend
```

2. **Start all services with Docker Compose:**
```bash
docker-compose up --build
```

This will start:
- Gateway (8000)
- Detect (8001)
- Segment (8002)
- Advise (8003)
- Generate (8004)
- Commerce (8005)

3. **Or run services individually:**
```bash
# Detect
cd detect && uvicorn app.main:app --port 8001

# Segment
cd segment && uvicorn app.main:app --port 8002

# Advise
cd advise && uvicorn app.main:app --port 8003

# Generate
cd generate && uvicorn app.main:app --port 8004

# Commerce
cd commerce && uvicorn app.main:app --port 8005

# Gateway
cd gateway && uvicorn app.main:app --port 8000
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
VITE_API_BASE=http://localhost:8000
```

4. **Start development server:**
```bash
npm run dev
```

5. **Access the application:**
```
http://localhost:5173/enhanced-workflow
```

---

## 🎯 User Workflow

### Step 1: Upload Image
User uploads a photo of their room.

### Step 2: Set Preferences
- **Budget:** Low ($150-$500) / Medium ($500-$2,000) / High ($2,000+)
- **Design Style:** Free-text input (e.g., "Modern minimalist with warm wood tones")
- **Item Selection:** Checkboxes for detected items with condition hints

### Step 3: AI Processing
System executes complete pipeline:
1. Detect objects
2. Analyze conditions (old/acceptable/new)
3. Reason about replacements
4. Refine design with budget constraints
5. Generate realistic image
6. Extract shopping metadata

### Step 4: View Results
- **Before/After Comparison**
- **Material Details** - What materials were used
- **Shopping Recommendations** - Products matched to design
- **Shop This Look** - Direct purchase links

---

## 🧠 How It Works

### Budget-Aware Reasoning

The system doesn't just generate random designs. It reasons about materials:

**Low Budget ($150-$500):**
- Bed: Engineered wood with basic fabric ($199)
- Curtains: Polyester blend ($29)
- Walls: Basic emulsion paint

**Medium Budget ($500-$2,000):**
- Bed: Engineered wood with quality upholstered headboard ($399)
- Curtains: Poly-linen blend with grommet hardware ($89)
- Walls: Premium emulsion with matte finish

**High Budget ($2,000+):**
- Bed: Solid wood with premium velvet upholstery ($1,299)
- Curtains: Natural linen or silk blend with custom hardware ($349)
- Walls: Designer paint or specialty textured finishes

### Condition Detection

Uses LLaVA to analyze:
- **Visible wear and tear**
- **Style modernity** (is it outdated?)
- **Color fading or damage**

Outputs: `old`, `acceptable`, or `new`

### Product Matching

Uses **semantic embeddings** to match generated designs to real products:
1. Extract item metadata (style, material, color)
2. Compute semantic similarity with product catalog
3. Filter by budget tier
4. Return top 3 matches per item

---

## 📊 Technology Stack

### Backend
- **FastAPI** - Modern async API framework
- **LLaVA** - Vision-language model for design reasoning
- **YOLOv8n** - Lightweight object detection
- **MobileSAM** - Fast image segmentation
- **Stable Diffusion 1.5** - Image generation
- **ControlNet (Canny)** - Structure preservation
- **SentenceTransformers** - Semantic product matching

### Frontend
- **React 18** - UI framework
- **TailwindCSS** - Styling
- **Lucide Icons** - Icon library
- **shadcn/ui** - Component library

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **MongoDB** - Session & result storage
- **CORS-enabled** - Frontend-backend communication

---

## 🛍️ Commerce Integration (Future)

Currently uses **static product catalog**. Ready to integrate:

### Supported Vendors (Future)
- Amazon (Affiliate API)
- IKEA (Product API)
- Wayfair
- West Elm
- Pottery Barn
- Target
- Urban Ladder (India)
- Pepperfry (India)

### Affiliate Networks
- Amazon Associates
- Commission Junction
- ShareASale
- Rakuten Advertising

---

## 🔧 Configuration

### Environment Variables

**Gateway (.env):**
```env
MONGO_URI=mongodb://localhost:27017
DETECT_URL=http://localhost:8001
SEGMENT_URL=http://localhost:8002
ADVISE_URL=http://localhost:8003
GENERATE_URL=http://localhost:8004
COMMERCE_URL=http://localhost:8005
```

**Frontend (.env):**
```env
VITE_API_BASE=http://localhost:8000
```

---

## 📈 Performance Notes

### Model Loading Times
- **Detect (YOLOv8n):** ~2 seconds
- **Segment (MobileSAM):** ~3 seconds
- **Advise (LLaVA):** ~30 seconds (first load), ~5 seconds (subsequent)
- **Generate (SD 1.5):** ~20 seconds (first load), ~10 seconds (per image)
- **Commerce:** Instant (in-memory catalog)

### Inference Times (CPU)
- **Detection:** ~1-2 seconds
- **Segmentation:** ~3-5 seconds
- **Condition Analysis:** ~5-10 seconds
- **Image Generation:** ~60-120 seconds
- **Product Matching:** <1 second

### Inference Times (GPU - CUDA)
- **Detection:** ~0.5 seconds
- **Segmentation:** ~1 second
- **Condition Analysis:** ~2-3 seconds
- **Image Generation:** ~10-20 seconds
- **Product Matching:** <1 second

---

## 🎨 Example Use Cases

### Use Case 1: Budget Bedroom Refresh
**Input:**
- Budget: Low
- Style: "Cozy and minimal"
- Items: bed, curtains

**Output:**
- Engineered wood bed with basic fabric ($199)
- Polyester curtains ($29)
- Shopping links to Amazon Basics & IKEA

### Use Case 2: Luxury Living Room
**Input:**
- Budget: High
- Style: "Luxury hotel vibe"
- Items: sofa, curtains, lighting

**Output:**
- Premium velvet sofa ($2,499)
- Silk blend drapes with brass hardware ($549)
- Designer pendant lights ($399)
- Shopping links to West Elm & Pottery Barn

---

## 🚧 Future Enhancements

1. **Real-time 3D Preview** - Three.js room visualization
2. **AR Try-Before-You-Buy** - Mobile AR placement
3. **Multi-room Projects** - Complete home redesign
4. **Style Transfer** - Match celebrity/magazine room styles
5. **AI Interior Designer Chat** - Conversational design assistance
6. **Price Tracking** - Monitor product price changes
7. **User Accounts** - Save designs, shopping lists
8. **Social Sharing** - Share designs on social media

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

This is an advanced implementation. Contributions welcome for:
- Additional product catalog integrations
- Improved material classification
- Enhanced semantic matching algorithms
- UI/UX improvements

---

## 📞 Support

For issues or questions, please open a GitHub issue.

**Built with ❤️ using AI-powered interior design technology**
