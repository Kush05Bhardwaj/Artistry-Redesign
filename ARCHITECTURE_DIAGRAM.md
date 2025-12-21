# Artistry AI - System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│                         http://localhost:5173                                │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      EnhancedWorkflow.jsx                              │  │
│  │  - Upload Image                                                        │  │
│  │  - Budget Selector (Low/Medium/High)                                  │  │
│  │  - Design Tips Input                                                   │  │
│  │  - Item Replacement Checklist                                         │  │
│  │  - Before/After Display                                               │  │
│  │  - Shopping Recommendations                                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ HTTP/JSON
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GATEWAY SERVICE (Port 8000)                          │
│                         Session + Orchestration                              │
│                                                                              │
│  API Endpoints:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  POST /api/collect-preferences  → Save user budget/items/style      │   │
│  │  POST /workflow/enhanced        → Run complete pipeline             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  MongoDB:                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  sessions { budget, design_tips, item_replacement }                  │   │
│  │  results  { generated_image, materials, shopping_metadata }          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────┘
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│   DETECT     │ │ SEGMENT  │ │  ADVISE  │ │ GENERATE │ │  COMMERCE    │
│  Port 8001   │ │Port 8002 │ │Port 8003 │ │Port 8004 │ │  Port 8005   │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘

════════════════════════════════════════════════════════════════════════════════
                         LAYER 1: IMAGE ANALYSIS
════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│ DETECT SERVICE (YOLOv8n)                                                     │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ POST /detect/                                                            │ │
│ │                                                                          │ │
│ │ Input:  { image_b64: "..." }                                            │ │
│ │ Output: {                                                                │ │
│ │   objects: ["bed", "chair", "curtains", "wardrobe"],                   │ │
│ │   bboxes: [[x, y, w, h], ...],                                          │ │
│ │   confidence: [0.92, 0.87, ...]                                         │ │
│ │ }                                                                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ SEGMENT SERVICE (MobileSAM)                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ POST /segment/                                                           │ │
│ │                                                                          │ │
│ │ Input:  { image_b64: "...", bboxes: [...] }                            │ │
│ │ Output: {                                                                │ │
│ │   masks: {                                                               │ │
│ │     "bed": "base64_mask",                                               │ │
│ │     "curtains": "base64_mask",                                          │ │
│ │     ...                                                                  │ │
│ │   }                                                                      │ │
│ │ }                                                                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
                    LAYER 2: USER INTERACTION (NEW!)
════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│ USER PREFERENCES COLLECTION                                                  │
│                                                                              │
│ ┌────────────────┐  ┌─────────────────┐  ┌──────────────────────────────┐  │
│ │ Budget Range   │  │  Design Tips    │  │  Item Replacement Selector   │  │
│ │                │  │                 │  │                              │  │
│ │ ○ Low          │  │ "Modern minimal │  │ ☑ bed (old - needs update)  │  │
│ │ ● Medium       │  │  with warm      │  │ ☑ curtains (old)            │  │
│ │ ○ High         │  │  wood tones"    │  │ ☐ chair (acceptable)        │  │
│ │                │  │                 │  │ ☐ wardrobe (new)            │  │
│ └────────────────┘  └─────────────────┘  └──────────────────────────────┘  │
│                                                                              │
│ Saved to MongoDB session:                                                   │
│ { budget: "medium", design_tips: "...", items: ["bed", "curtains"] }       │
└──────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
                    LAYER 3: DESIGN INTELLIGENCE (NEW!)
════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│ ADVISE SERVICE - Intelligence Layer                                         │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ 1. CONDITION DETECTION (LLaVA Vision Analysis)                          │ │
│ │    POST /condition/detect                                                │ │
│ │                                                                          │ │
│ │    Analyzes: wear, outdated style, color fading                         │ │
│ │    Output: { bed: "old", curtains: "old", chair: "acceptable" }        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ 2. ITEM UPGRADE REASONER (Decision Engine)                              │ │
│ │    POST /advise/reason-upgrades                                         │ │
│ │                                                                          │ │
│ │    Combines: condition + user_selection + budget                        │ │
│ │    Output: {                                                             │ │
│ │      replace: ["bed", "curtains"],                                      │ │
│ │      keep: ["chair", "wardrobe"],                                       │ │
│ │      reasoning: { bed: "Old + user selected → HIGH priority" }         │ │
│ │    }                                                                     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ 3. BUDGET-AWARE DESIGN REFINER (Material Selector)                      │ │
│ │    POST /advise/refine-budget                                           │ │
│ │                                                                          │ │
│ │    Budget Database:                                                      │ │
│ │    ┌─────────┬──────────────────────────────────────────────────────┐   │ │
│ │    │ Low     │ Engineered wood + basic fabric ($150-$300)           │   │ │
│ │    │ Medium  │ Engineered wood + quality upholstery ($400-$800)     │   │ │
│ │    │ High    │ Solid wood + premium velvet ($1000-$2500)            │   │ │
│ │    └─────────┴──────────────────────────────────────────────────────┘   │ │
│ │                                                                          │ │
│ │    Output: {                                                             │ │
│ │      bed: {                                                              │ │
│ │        material: "engineered wood with upholstered headboard",          │ │
│ │        finish: "fabric upholstery",                                     │ │
│ │        cost: "$400-$800"                                                 │ │
│ │      }                                                                   │ │
│ │    }                                                                     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
                    LAYER 4: IMAGE GENERATION (Enhanced)
════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│ GENERATE SERVICE - Budget-Aware Generation                                  │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ POST /generate/budget-aware                                              │ │
│ │                                                                          │ │
│ │ Prompt Building:                                                         │ │
│ │ "Modern minimalist bedroom.                                              │ │
│ │  Mid-range quality interior design.                                      │ │
│ │  Materials:                                                               │ │
│ │    - bed with engineered wood, fabric upholstery                        │ │
│ │    - curtains with poly-linen blend, grommet hardware                   │ │
│ │  Photorealistic, professional interior photography."                     │ │
│ │                                                                          │ │
│ │ Pipeline:                                                                │ │
│ │ 1. Global img2img pass (Canny ControlNet for structure)                 │ │
│ │ 2. Per-item inpainting (for selected items)                             │ │
│ │    ├─ bed → "engineered wood upholstered bed, medium budget"           │ │
│ │    └─ curtains → "poly-linen curtains, medium budget"                  │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Models Used:                                                                │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ • Stable Diffusion 1.5 (base model)                                      │ │
│ │ • ControlNet Canny (structure preservation)                              │ │
│ │ • SD Inpainting Pipeline (per-object redesign)                           │ │
│ │ • Euler Ancestral Scheduler (quality)                                    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
                   LAYER 5: POST-GENERATION ANALYSIS (NEW!)
════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│ GENERATE SERVICE - Metadata Extraction                                      │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ POST /generate/analyze-output                                            │ │
│ │                                                                          │ │
│ │ Uses LLaVA to analyze GENERATED image:                                   │ │
│ │                                                                          │ │
│ │ Output: {                                                                │ │
│ │   items: [                                                               │ │
│ │     {                                                                    │ │
│ │       item_type: "bed",                                                  │ │
│ │       style: "modern minimalist",                                        │ │
│ │       material: "engineered wood",                                       │ │
│ │       color: "beige",                                                    │ │
│ │       confidence: 0.87                                                   │ │
│ │     },                                                                   │ │
│ │     {                                                                    │ │
│ │       item_type: "curtains",                                             │ │
│ │       style: "minimalist",                                               │ │
│ │       material: "linen blend",                                           │ │
│ │       color: "off-white",                                                │ │
│ │       confidence: 0.92                                                   │ │
│ │     }                                                                    │ │
│ │   ],                                                                     │ │
│ │   overall_style: "Modern Minimalist",                                    │ │
│ │   color_palette: ["beige", "white", "grey"]                             │ │
│ │ }                                                                        │ │
│ │                                                                          │ │
│ │ → This metadata enables shopping recommendations!                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
                        LAYER 6: COMMERCE (NEW!)
════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│ COMMERCE SERVICE - Product Matching & Shopping                              │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ POST /commerce/match-products                                            │ │
│ │                                                                          │ │
│ │ Semantic Search Pipeline:                                                │ │
│ │                                                                          │ │
│ │ 1. Input Metadata:                                                       │ │
│ │    { item: "bed", style: "modern", material: "wood", budget: "medium" } │ │
│ │                                                                          │ │
│ │ 2. Generate Query Embedding (SentenceTransformers):                     │ │
│ │    query_text = "bed modern engineered wood beige"                      │ │
│ │    query_emb = embedder.encode(query_text)                              │ │
│ │                                                                          │ │
│ │ 3. Filter Products:                                                      │ │
│ │    - Category = "bed"                                                    │ │
│ │    - Budget tier = "medium"                                              │ │
│ │                                                                          │ │
│ │ 4. Calculate Similarity:                                                 │ │
│ │    cosine_similarity(query_emb, product_emb)                            │ │
│ │                                                                          │ │
│ │ 5. Return Top 3 Matches:                                                 │ │
│ │    [                                                                     │ │
│ │      {                                                                   │ │
│ │        name: "Modern Upholstered Platform Bed",                         │ │
│ │        vendor: "Amazon",                                                 │ │
│ │        price: "$399",                                                    │ │
│ │        url: "https://amazon.com/...",                                   │ │
│ │        match_score: 0.89,                                                │ │
│ │        affiliate: true                                                   │ │
│ │      },                                                                  │ │
│ │      ...                                                                 │ │
│ │    ]                                                                     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Product Catalog (Static - Future: Real APIs):                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ • Amazon - General furniture                                             │ │
│ │ • IKEA - Budget-friendly options                                         │ │
│ │ • Wayfair - Mid-range selection                                          │ │
│ │ • West Elm - Premium/luxury                                              │ │
│ │ • Pottery Barn - High-end designs                                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
                         COMPLETE WORKFLOW FLOW
════════════════════════════════════════════════════════════════════════════════

1. USER UPLOADS IMAGE
   │
   ├─► Gateway → Detect Service
   │   Output: ["bed", "chair", "curtains", "wardrobe"]
   │
2. USER SETS PREFERENCES
   │
   ├─► Budget: Medium
   ├─► Design: "Modern minimal with wood tones"
   └─► Items: [✓] bed, [✓] curtains, [ ] chair, [ ] wardrobe
   │
3. BACKEND PROCESSES (Gateway Orchestration)
   │
   ├─► Step 1: Detect objects (YOLOv8)
   │
   ├─► Step 2: Segment objects (MobileSAM)
   │
   ├─► Step 3: Analyze conditions (LLaVA)
   │   Output: { bed: "old", curtains: "old", chair: "acceptable" }
   │
   ├─► Step 4: Reason upgrades (Decision Engine)
   │   Output: { replace: ["bed", "curtains"], keep: ["chair", "wardrobe"] }
   │
   ├─► Step 5: Generate base design plan
   │   Output: { style: "Modern Minimalist", palette: {...} }
   │
   ├─► Step 6: Refine with budget (Material Selector)
   │   Output: {
   │     bed: "engineered wood + upholstered headboard ($399)",
   │     curtains: "poly-linen blend ($89)"
   │   }
   │
   ├─► Step 7: Generate image (Stable Diffusion + Budget Prompts)
   │   Output: Generated room image (base64)
   │
   ├─► Step 8: Analyze output (LLaVA Metadata Extraction)
   │   Output: { items: [{type, style, material, color}, ...] }
   │
   └─► Step 9: Match products (Semantic Search)
       Output: { bed: [3 product matches], curtains: [3 product matches] }
   │
4. USER SEES RESULTS
   │
   ├─► Before/After Comparison
   ├─► Budget Summary: Medium ($500-$2,000)
   ├─► Materials Used: Engineered wood, poly-linen, etc.
   ├─► Shopping Recommendations:
   │   ┌─────────────────────────────────────┐
   │   │ Bed - Modern Upholstered Platform   │
   │   │ Vendor: Amazon                      │
   │   │ Price: $399                         │
   │   │ Match: 89%                          │
   │   │ [Shop Now] ────► Affiliate Link     │
   │   └─────────────────────────────────────┘
   │
   └─► Total Estimate: ~$500

════════════════════════════════════════════════════════════════════════════════

Key Innovations:
✅ Budget affects MATERIALS, not just aesthetics
✅ User controls what gets replaced
✅ AI explains WHY items need replacement
✅ Shopping metadata extracted from GENERATED image
✅ Semantic product matching (not keyword search)
✅ Complete microservices architecture
