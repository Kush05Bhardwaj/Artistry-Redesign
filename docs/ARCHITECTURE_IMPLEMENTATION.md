# Artistry Architecture Implementation

**Date**: December 20, 2025  
**Status**: ✅ Core Architecture Complete

## Overview

The Artistry system has been restructured into a **5-service architecture** with clear separation of concerns:

```
Gateway → Detect → Segment → Advise → Generate
   ↓         ↓        ↓         ↓        ↓
 Cache   Interior  Edge    Vision    Per-Object
         Filter   Refine  Analyzer  Inpainting
```

---

## 1️⃣ Gateway Service (Port 8000)

### Purpose
**Orchestration + State Management** - Brain & memory of the system

### Current Status
- ⚠️ **Pending Implementation**: Design versioning & caching
- Routing and coordination: ✅ Working

### Required Features (Not Yet Implemented)
```python
{
  "design_id": "room123",
  "version": 3,
  "base_image": "...",
  "design_state": {...},
  "generated_image": "...",
  "timestamp": "2025-12-20"
}
```

**Why This Matters:**
- User refines design multiple times
- Need rollback ("go back to version 2")
- Prevent re-running expensive models

---

## 2️⃣ Detect Service (Port 8001)

### Purpose
**Understand WHAT objects exist** using YOLOv8n

### ✅ Implementation Complete

**File**: `artistry-backend/detect/app/main.py`

**Key Features:**
1. **Interior-Only Class Filter**
   ```python
   INTERIOR_CLASSES = {
       "bed", "chair", "couch", "dining table", "tv", 
       "potted plant", "vase", "clock", "book"
   }
   ```

2. **Class Mapping** (friendly names)
   ```python
   CLASS_MAPPING = {
       "couch": "sofa",
       "dining table": "table",
       "potted plant": "plant"
   }
   ```

**Output Example:**
```json
{
  "objects_detected": [
    { "label": "bed", "confidence": 0.94 },
    { "label": "chair", "confidence": 0.71 }
  ]
}
```

**Why Restrict Classes?**
- Reduces noise (no cars, laptops, office desks)
- Improves LLM grounding
- Prevents hallucinations

---

## 3️⃣ Segment Service (Port 8002)

### Purpose
**Understand WHERE things are** at pixel level using MobileSAM

### ✅ Implementation Complete

**File**: `artistry-backend/segment/app/main.py`

**Key Features:**

1. **Edge Refinement with Canny**
   ```python
   def generate_canny_edges(image, low_threshold=50, high_threshold=150):
       """Generate Canny edge map for mask refinement"""
       gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
       edges = cv2.Canny(gray, low_threshold, high_threshold)
       return edges
   
   def refine_mask_with_edges(mask, edge_map):
       """Sharpen SAM mask boundaries using edge map"""
       # Prevents fuzzy edges and bleeding
       # Curtains don't bleed into windows
       # Bed edges stay sharp
   ```

2. **Why Edge Refinement?**
   - MobileSAM gives fuzzy edges
   - Thin objects struggle (curtains, rails)
   - Edge refinement = cleaner boundaries

**Output:**
```json
{
  "segments": {
    "walls": "mask.png",
    "bed": "mask.png",
    "curtains": "mask.png"
  },
  "edge_refinement": true
}
```

---

## 4️⃣ Advise Service (Port 8003)

### Purpose
**TWO LLM ROLES** - Vision Analyzer + Design Reasoner

### ✅ Implementation Complete

**File**: `artistry-backend/advise/app/main.py`

---

### 4A. Vision Analyzer (Strict JSON)

**Endpoint**: `POST /vision/analyze`

**Rules:**
- ✅ NO opinions
- ✅ NO design advice
- ✅ NO free text
- ✅ ONLY objective facts

**Input:**
- Image (optional)
- Detection data from Detect service

**Output:**
```json
{
  "room_type": "bedroom",
  "room_size": "medium",
  "lighting": "natural",
  "constraints": [
    "keep original layout",
    "keep camera angle",
    "keep window positions",
    "preserve room geometry"
  ]
}
```

**Why This Matters:**
- Prevents hallucination
- Grounds all later reasoning
- Makes system deterministic

---

### 4B. Design Reasoner (Text-Only)

**Endpoint**: `POST /proposal/refine`

**Rules:**
- ✅ NEVER sees the image
- ✅ Only sees structured context
- ✅ Refines design based on user intent

**Input:**
```json
{
  "base_design": {...},
  "vision_analysis": {...},
  "user_feedback": "Make it more cozy and darker"
}
```

**Output (Design State):**
```json
{
  "style": "Modern cozy minimalist",
  "walls": "Warm taupe matte",
  "bed": "Dark upholstered headboard",
  "curtains": "Thick linen charcoal",
  "lighting": "Low-intensity warm ambient",
  "mood": "Cozy, hotel-like"
}
```

**This output becomes:**
- THE single source of truth for image generation
- Bridge between user intent and visual rendering

---

## 5️⃣ Generate Service (Port 8004)

### Purpose
**Convert design intent → photorealistic image**

### ✅ Implementation Complete

**File**: `artistry-backend/generate/app/main.py`

---

### 5A. Img2Img with ControlNet

**Existing Features:**
- Stable Diffusion v1.5
- ControlNet Canny (edge preservation)
- Two-pass generation
- Mode presets (subtle/balanced/bold)

---

### 5B. Per-Object Inpainting (NEW ✨)

**Endpoint**: `POST /generate/inpaint_multi`

**Pipeline:**
```
1. Walls     → focused prompt + mask + denoise 0.8
2. Curtains  → focused prompt + mask + denoise 0.7
3. Bed       → focused prompt + mask + denoise 0.75
4. Wardrobe  → focused prompt + mask + denoise 0.7
```

**Why Multi-Pass?**
- Each object gets focused attention
- Tuned denoise per material type
- Sequential = controlled layering
- Final result = intentional design changes

**Example Request:**
```json
{
  "image_b64": "...",
  "masks": {
    "walls": "base64_mask_data",
    "curtains": "base64_mask_data",
    "bed": "base64_mask_data"
  },
  "steps": [
    {
      "object_name": "walls",
      "prompt": "Warm beige matte wall paint, modern interior",
      "denoise_strength": 0.8
    },
    {
      "object_name": "curtains",
      "prompt": "Sheer linen curtains in light grey",
      "denoise_strength": 0.7
    },
    {
      "object_name": "bed",
      "prompt": "Upholstered fabric headboard in taupe",
      "denoise_strength": 0.75
    }
  ]
}
```

**Output:**
```json
{
  "final_image": "base64_final_result",
  "intermediate_passes": [
    {"object": "walls", "image": "..."},
    {"object": "curtains", "image": "..."},
    {"object": "bed", "image": "..."}
  ],
  "num_passes": 3
}
```

---

## Complete Workflow

### User Journey
```
1. Upload image
   ↓
2. Detect objects (interior-only filter)
   ↓
3. Segment with edge refinement
   ↓
4. Vision Analyzer extracts facts (JSON)
   ↓
5. Generate base design proposal
   ↓
6. User provides feedback ("Make it darker and cozy")
   ↓
7. Design Reasoner refines (text-only LLM)
   ↓
8. Convert design → template prompt
   ↓
9. Multi-pass inpainting: walls → curtains → bed → wardrobe
   ↓
10. Final redesigned image
```

---

## Implementation Summary

### ✅ Completed

| Service | Feature | Status |
|---------|---------|--------|
| **Detect** | Interior-only class filter | ✅ Complete |
| **Detect** | Friendly class mapping | ✅ Complete |
| **Segment** | Edge refinement with Canny | ✅ Complete |
| **Segment** | Sharpen mask boundaries | ✅ Complete |
| **Advise** | Vision Analyzer (strict JSON) | ✅ Complete |
| **Advise** | Design Reasoner (text-only) | ✅ Complete |
| **Generate** | Per-object inpainting | ✅ Complete |
| **Generate** | Multi-pass pipeline | ✅ Complete |

### ⚠️ Pending

| Service | Feature | Status |
|---------|---------|--------|
| **Gateway** | Design versioning | ⚠️ Not implemented |
| **Gateway** | State caching | ⚠️ Not implemented |
| **Gateway** | Rollback capability | ⚠️ Not implemented |

---

## Key Architectural Principles

### 1. Separation of Concerns
- **Vision Analyzer**: Facts only (no opinions)
- **Design Reasoner**: Text-only (never sees image)
- **Image Generation**: Controlled by design state

### 2. Grounding Strategy
```
Detection → Facts → Design State → Visual Rendering
```

### 3. Controlled Generation
- Template-based prompts (no freestyle)
- Per-object focused attention
- Sequential layering (walls → furniture → details)

### 4. Quality Gates
- Interior-only classes prevent hallucination
- Edge refinement prevents bleeding
- Constraints preserve layout
- Multi-pass ensures intentional changes

---

## Files Modified

### Backend
1. `artistry-backend/detect/app/main.py` - Interior filter + class mapping
2. `artistry-backend/segment/app/main.py` - Edge refinement with Canny
3. `artistry-backend/advise/app/main.py` - Vision Analyzer + Design Reasoner
4. `artistry-backend/generate/app/main.py` - Per-object inpainting

### Frontend
1. `frontend/src/services/api.js` - New API functions
2. `frontend/src/pages/InteractiveWorkflow.jsx` - Updated workflow

---

## Next Steps

### Priority 1: Gateway State Management
Implement design versioning and caching in Gateway service.

### Priority 2: Integration Testing
Test complete workflow with all services.

### Priority 3: Frontend Integration
Update frontend to use new multi-pass inpainting endpoints.

---

## Notes

**Why This Architecture Works:**

1. **Factual Grounding**: Vision Analyzer prevents hallucination
2. **Text-Based Reasoning**: Design Reasoner acts like human designer
3. **Controlled Rendering**: Multi-pass inpainting = intentional changes
4. **Quality Preservation**: Edge refinement + ControlNet = clean results

**This is NOT just img2img.**  
This is **structured design reasoning → controlled visual rendering**.
