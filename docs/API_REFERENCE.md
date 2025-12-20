# API Endpoints Quick Reference

## Detect Service (Port 8001)

### POST /detect/
**Purpose**: Detect interior objects using YOLOv8n with interior-only filter

**Input**:
- `file`: Image file (multipart/form-data)

**Output**:
```json
{
  "objects": ["bed", "chair", "sofa"],
  "annotated_image": "data:image/jpeg;base64,...",
  "bounding_boxes": [{"x1": 10, "y1": 20, "x2": 100, "y2": 200}],
  "confidence": [0.94, 0.87, 0.71]
}
```

**Interior Classes**: bed, chair, sofa, table, tv, plant, vase, clock, book

---

## Segment Service (Port 8002)

### POST /segment/
**Purpose**: Segment image with MobileSAM + edge refinement

**Input**:
- `file`: Image file
- `num_samples`: Number of segmentation points (default: 10)

**Output**:
```json
{
  "segmented_image": "data:image/png;base64,...",
  "num_segments": 9,
  "masks": [[[true, false, ...]]],
  "edge_refinement": true
}
```

**Edge Refinement**: Canny edges sharpen mask boundaries

---

## Advise Service (Port 8003)

### POST /vision/analyze
**Purpose**: Extract objective facts from image (Vision Analyzer)

**Input**:
- `file`: Image file (optional)
- `detection_data`: JSON string from detect service

**Output**:
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

**Rules**: NO opinions, NO design advice, ONLY facts

---

### POST /proposal/initial
**Purpose**: Generate base design proposal

**Input**:
```json
{
  "detection_data": {
    "room_type": "bedroom",
    "objects_detected": ["bed", "chair"],
    "lighting": "natural"
  }
}
```

**Output**:
```json
{
  "base_design": {
    "design_style": "Modern Minimalist",
    "color_palette": {
      "walls": "warm beige",
      "accent": "soft grey"
    },
    "materials": {
      "curtains": "sheer linen",
      "bed": "upholstered fabric"
    },
    "lighting": {
      "type": "warm ambient"
    }
  },
  "summary": "This design uses warm beige walls...",
  "question": "What would you like to change or add?"
}
```

---

### POST /proposal/refine
**Purpose**: Refine design based on user feedback (Design Reasoner)

**Input**:
```json
{
  "base_design": {...},
  "user_feedback": "Make it darker and cozy",
  "vision_analysis": {...},
  "room_context": {}
}
```

**Output**:
```json
{
  "refined_design": {
    "style": "Modern cozy minimalist",
    "changes": {
      "walls": "warm taupe with matte finish",
      "bed": "dark fabric upholstered headboard",
      "curtains": "thicker linen in charcoal tone"
    },
    "lighting": "warm low-intensity ambient",
    "mood": "cozy, intimate"
  },
  "ready_for_generation": true
}
```

**Rules**: NEVER sees image, text-only reasoning

---

### POST /prompt/generate
**Purpose**: Convert refined design → template-based image prompt

**Input**:
```json
{
  "refined_design": {...}
}
```

**Output**:
```json
{
  "image_prompt": "Redesign this bedroom using the following interior design plan:\n- Style: Modern Minimalist\n- Walls: warm beige...",
  "design_applied": {...},
  "ready_for_img2img": true
}
```

**Template**: Structured, no freestyle

---

## Generate Service (Port 8004)

### POST /generate/
**Purpose**: Img2img with ControlNet (Canny) + two-pass generation

**Input**:
- `file`: Image file
- `prompt`: Design prompt (Form)
- `mode`: "subtle" | "balanced" | "bold" (default: "balanced")
- `two_pass`: boolean (default: false)
- `num_inference_steps`: int (default: 30)
- `guidance_scale`: float (default: 7.5)

**Output**:
```json
{
  "generated_image": "data:image/png;base64,...",
  "original_image": "...",
  "canny_image": "...",
  "pass_a_image": "..." (if two_pass=true),
  "parameters": {
    "mode": "balanced",
    "strength": 0.55,
    "two_pass": true
  }
}
```

**Mode Mapping**:
- `subtle`: strength 0.3
- `balanced`: strength 0.55
- `bold`: strength 0.7

---

### POST /generate/inpaint_multi (NEW ✨)
**Purpose**: Multi-pass per-object inpainting

**Input**:
```json
{
  "image_b64": "...",
  "masks": {
    "walls": "base64_mask",
    "curtains": "base64_mask",
    "bed": "base64_mask"
  },
  "steps": [
    {
      "object_name": "walls",
      "prompt": "Warm beige matte wall paint",
      "denoise_strength": 0.8
    },
    {
      "object_name": "curtains",
      "prompt": "Sheer linen curtains",
      "denoise_strength": 0.7
    }
  ],
  "guidance_scale": 7.5,
  "num_inference_steps": 30
}
```

**Output**:
```json
{
  "final_image": "data:image/png;base64,...",
  "intermediate_passes": [
    {"object": "walls", "image": "..."},
    {"object": "curtains", "image": "..."}
  ],
  "num_passes": 2
}
```

**Pipeline**: walls → curtains → bed → wardrobe (sequential)

---

### POST /generate/inpaint_file
**Purpose**: Simple single-object inpainting (testing/debugging)

**Input**:
- `file`: Image file
- `mask`: Mask file
- `prompt`: Text prompt (Form)
- `denoise_strength`: float (default: 0.8)

**Output**:
```json
{
  "inpainted_image": "data:image/png;base64,...",
  "prompt": "...",
  "denoise_strength": 0.8
}
```

---

## Complete Workflow Example

```javascript
// 1. Detect objects
const detection = await fetch('http://localhost:8001/detect/', {
  method: 'POST',
  body: formData
}).then(r => r.json());

// 2. Segment image
const segmentation = await fetch('http://localhost:8002/segment/', {
  method: 'POST',
  body: formData
}).then(r => r.json());

// 3. Vision analysis
const vision = await fetch('http://localhost:8003/vision/analyze', {
  method: 'POST',
  body: formData
}).then(r => r.json());

// 4. Initial proposal
const proposal = await fetch('http://localhost:8003/proposal/initial', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ detection_data: detection })
}).then(r => r.json());

// 5. User feedback → Refinement
const refined = await fetch('http://localhost:8003/proposal/refine', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    base_design: proposal.base_design,
    user_feedback: "Make it darker and cozy",
    vision_analysis: vision
  })
}).then(r => r.json());

// 6. Generate prompt
const promptData = await fetch('http://localhost:8003/prompt/generate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ refined_design: refined })
}).then(r => r.json());

// 7. Multi-pass inpainting
const result = await fetch('http://localhost:8004/generate/inpaint_multi', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    image_b64: originalImageBase64,
    masks: segmentation.masks,
    steps: [
      {object_name: "walls", prompt: "Warm taupe matte walls", denoise_strength: 0.8},
      {object_name: "curtains", prompt: "Charcoal linen curtains", denoise_strength: 0.7},
      {object_name: "bed", prompt: "Dark upholstered headboard", denoise_strength: 0.75}
    ]
  })
}).then(r => r.json());

console.log(result.final_image); // Final redesigned room
```

---

## Architecture Flow

```
Image Upload
   ↓
Detect (interior objects only)
   ↓
Segment (edge-refined masks)
   ↓
Vision Analyze (facts: room_type, size, lighting, constraints)
   ↓
Initial Proposal (base design JSON)
   ↓
User Feedback ("Make it darker and cozy")
   ↓
Design Reasoner (text-only refinement)
   ↓
Prompt Generator (template-based)
   ↓
Multi-Pass Inpainting (walls → curtains → bed → wardrobe)
   ↓
Final Redesigned Image
```

---

## Key Principles

1. **Interior-Only Detection**: Prevents hallucinations
2. **Edge Refinement**: Clean mask boundaries
3. **Vision Analyzer**: Facts only (NO opinions)
4. **Design Reasoner**: Text-only (NEVER sees image)
5. **Template Prompts**: Structured (NO freestyle)
6. **Multi-Pass Inpainting**: Sequential object redesign
