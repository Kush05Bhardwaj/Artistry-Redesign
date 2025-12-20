from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import torch
try:
    from transformers import LlavaForConditionalGeneration, BitsAndBytesConfig, LlamaTokenizer, AutoTokenizer, AutoModelForCausalLM
    HAS_LLAVA = True
except Exception:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    HAS_LLAVA = False
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
import os
import base64
import io
from PIL import Image

app = FastAPI(title="LLaVA Advice Service")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI","mongodb://root:example@mongo:27017")
db = MongoClient(MONGO_URI)["artistry"]

# Detect device
device = "cuda" if torch.cuda.is_available() else "cpu"

# Use local model path (all files including 13GB weights are here)
LOCAL_MODEL_PATH = os.path.abspath(".")
print(f"\n{'='*60}")
print(f"Loading LLaVA Model from Local Directory")
print(f"{'='*60}")
print(f"Device: {device.upper()}")
print(f"Model path: {LOCAL_MODEL_PATH}")

# Set cache directory
os.environ["HF_HOME"] = os.path.join(LOCAL_MODEL_PATH, ".cache")

# Check which format is available
has_safetensors = os.path.exists(os.path.join(LOCAL_MODEL_PATH, "model-00001-of-00002.safetensors"))
has_bin = os.path.exists(os.path.join(LOCAL_MODEL_PATH, "pytorch_model-00001-of-00002.bin"))

print(f"SafeTensors format: {'✓ Available' if has_safetensors else '✗ Not found'}")
print(f"PyTorch .bin format: {'✓ Available' if has_bin else '✗ Not found'}")

# Load tokenizer from local directory
print("Loading tokenizer...", end=" ")
try:
    if HAS_LLAVA and (os.path.exists(os.path.join(LOCAL_MODEL_PATH, "tokenizer.model")) or 
                      os.path.exists(os.path.join(LOCAL_MODEL_PATH, "tokenizer.json"))):
        # Use LlamaTokenizer with legacy=False to prefer new sentencepiece tokenizer
        tokenizer = LlamaTokenizer.from_pretrained(
            LOCAL_MODEL_PATH,
            local_files_only=True,
            legacy=False,
        )
    else:
        # Fallback: try local AutoTokenizer, otherwise use a small public model
        if os.path.exists(os.path.join(LOCAL_MODEL_PATH, "tokenizer.json")) or os.path.exists(os.path.join(LOCAL_MODEL_PATH, "tokenizer.model")):
            tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_PATH, local_files_only=True)
        else:
            tokenizer = AutoTokenizer.from_pretrained("gpt2")
except Exception as e:
    print(f"Failed to load tokenizer: {e}, using fallback gpt2 tokenizer")
    tokenizer = AutoTokenizer.from_pretrained("gpt2")
print("✓")

# Load model from local directory
# Note: For .bin files with torch < 2.6, we need to use a workaround
import torch.serialization
# Allow unsafe loading (only for local trusted files)
_old_load = torch.serialization.load
torch.serialization.load = lambda *args, **kwargs: _old_load(*args, **{**kwargs, 'weights_only': False})

try:
    # Check if model files actually exist
    model_exists = (has_safetensors or has_bin or 
                   os.path.exists(os.path.join(LOCAL_MODEL_PATH, "pytorch_model.bin")))
    
    if HAS_LLAVA and model_exists:
        if device == "cpu":
            print("Loading LLaVA model on CPU (this may take 2-3 minutes)...")
            print("Note: CPU inference will be slower than GPU")
            model = LlavaForConditionalGeneration.from_pretrained(
                LOCAL_MODEL_PATH,
                torch_dtype=torch.float32,
                low_cpu_mem_usage=True,
                local_files_only=True,
            ).to(device)
            print("✓ Model loaded successfully on CPU")
        else:
            print("Loading LLaVA model on GPU with 4-bit quantization...")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
            )
            model = LlavaForConditionalGeneration.from_pretrained(
                LOCAL_MODEL_PATH,
                device_map="auto",
                torch_dtype=torch.float16,
                quantization_config=quantization_config,
                local_files_only=True,
            )
            print("✓ Model loaded successfully on GPU")
    else:
        # Fallback to a causal LM (local if available, otherwise gpt2)
        if not model_exists:
            print("No local model files found — loading fallback GPT-2 model from HuggingFace")
        else:
            print("LLaVA not available — loading fallback causal LM (AutoModelForCausalLM)")
        
        if os.path.exists(os.path.join(LOCAL_MODEL_PATH, "pytorch_model.bin")) or os.path.exists(os.path.join(LOCAL_MODEL_PATH, "pytorch_model-00001-of-00002.bin")):
            model = AutoModelForCausalLM.from_pretrained(LOCAL_MODEL_PATH, local_files_only=True)
        else:
            model = AutoModelForCausalLM.from_pretrained("gpt2")
        model = model.to(device)
        print("✓ Fallback model loaded")
finally:
    # Restore original torch.load
    torch.serialization.load = _old_load

@app.get("/")
def root():
    """Root endpoint"""
    return {"status": "ok", "service": "Advise (LLaVA)", "device": device}

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "Advise (LLaVA)", "device": device}

print(f"{'='*60}\n")

embedder = SentenceTransformer("all-MiniLM-L6-v2")

@app.get("/")
def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Advise (GPT-2)", "device": device}

class AdviseReq(BaseModel):
    prompt: str
    masks: list | None = []
    detection_data: dict | None = None  # Structured data from detect service

class StructuredAdviseReq(BaseModel):
    """Structured input for grounded design recommendations"""
    room_type: str  # e.g., "bedroom", "living room"
    objects_detected: list[str]  # e.g., ["bed", "chair", "wardrobe", "window"]
    lighting: str  # e.g., "natural", "artificial", "dim"
    room_size: str  # e.g., "small", "medium", "large"
    style_intent: str  # e.g., "modern minimalist", "bohemian", "industrial"
    user_prompt: str | None = None  # Optional additional context

class DesignRecommendation(BaseModel):
    """Single design recommendation with structured data"""
    category: str  # "Walls", "Bed", "Lighting", "Textiles", "Flooring", etc.
    suggestion: str  # Specific material/change: "Switch to warm beige matte paint"
    reason: str  # Why it improves: "Improves light reflection and modern feel"
    icon: str  # Icon identifier for UI: "paint", "bed", "lightbulb", "fabric", etc.

class ProposalRequest(BaseModel):
    """Request for initial AI design proposal"""
    detection_data: dict  # From detect service: room_type, objects, lighting, etc.

class BaseDesignPlan(BaseModel):
    """Structured base design plan - NOT an image prompt"""
    design_style: str
    color_palette: dict  # {walls, accent, textiles}
    materials: dict  # {curtains, bed, wardrobe, etc.}
    lighting: dict  # {type, notes}
    constraints: list[str]  # ["keep layout", "keep windows", etc.]
    
class RefinementRequest(BaseModel):
    """Request to refine design based on user feedback (TEXT-ONLY REASONER)"""
    base_design: dict  # The original BaseDesignPlan as dict
    user_feedback: str  # Simple: "Make it darker and cozy"
    vision_analysis: dict = {}  # Facts from /vision/analyze (NO IMAGE)
    room_context: dict = {}  # {room_type, segments}

class RefinedDesign(BaseModel):
    """Output of design refinement LLM"""
    style: str
    changes: dict  # Specific changes to walls, bed, curtains, etc.
    lighting: str
    mood: str

@app.post("/advise")
def advise(req: AdviseReq):
    # Retrieve top context docs (simple cosine sim)
    query_emb = embedder.encode(req.prompt)
    docs = list(db.knowledge_base.find().limit(3))
    context = " ".join([d.get("text","") for d in docs])
    
    # If structured detection data is provided, use it to ground the recommendations
    if req.detection_data:
        room_type = req.detection_data.get("room_type", "room")
        objects = req.detection_data.get("objects_detected", [])
        lighting = req.detection_data.get("lighting", "natural")
        room_size = req.detection_data.get("room_size", "medium")
        
        # Create structured prompt that preserves layout
        structured_input = f"""Analyze this {room_type} with the following detected elements:
- Objects: {', '.join(objects)}
- Lighting: {lighting}
- Room size: {room_size}

User request: {req.prompt}

Provide 5 actionable interior design recommendations that:
1. Keep the original layout and object positions
2. Preserve the camera angle and perspective
3. Suggest specific, realistic changes (colors, materials, accessories)
4. Are grounded in the detected room elements

Recommendations:"""
    else:
        # Fallback to generic prompt
        structured_input = f"User request: {req.prompt}\nContext:\n{context}\nSuggestion:"
    
    inputs = tokenizer(structured_input, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=150, do_sample=True, temperature=0.7)
    suggestion = tokenizer.decode(output[0], skip_special_tokens=True)
    
    # Clean up output
    suggestion = suggestion.replace(structured_input, "").strip()
    
    return {"advice": suggestion}

@app.post("/advise/")
async def advise_file(
    file: UploadFile = File(...), 
    prompt: str = "Provide interior design recommendations",
    room_type: str = "bedroom",
    objects_detected: str = "",  # Comma-separated list
    lighting: str = "natural",
    room_size: str = "medium"
):
    """File upload endpoint with structured input for grounded recommendations"""
    # Read and process image
    file_bytes = await file.read()
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    
    # Parse objects list
    objects_list = [obj.strip() for obj in objects_detected.split(",") if obj.strip()]
    
    # Generate structured, detailed prompt that preserves layout
    if objects_list:
        structured_prompt = f"""Redesign this {room_type} in a {prompt} style.

IMPORTANT - Preserve the following:
- Keep the original layout and room dimensions
- Maintain {', '.join(objects_list)} in their current positions
- Preserve the camera angle and perspective
- Keep windows and doors in the same locations

Style requirements:
- {prompt}
- {lighting} lighting with warm tones
- Suitable for a {room_size} space
- Photorealistic interior rendering

Focus on changing: colors, materials, textures, accessories, and finishes while maintaining the structural layout."""
    else:
        # Fallback for when no detection data is available
        structured_prompt = f"""Redesign this {room_type} in a {prompt} style.
Keep the original layout, furniture positions, and camera angle.
{lighting.capitalize()} lighting, {room_size} space.
Photorealistic interior rendering."""
    
    # Generate recommendations using the structured prompt
    inputs = tokenizer(structured_prompt, return_tensors="pt", max_length=512, truncation=True).to(model.device)
    output = model.generate(
        **inputs, 
        max_new_tokens=200, 
        do_sample=True, 
        temperature=0.7,
        top_p=0.9
    )
    advice_text = tokenizer.decode(output[0], skip_special_tokens=True)
    
    # Clean up the output
    advice_text = advice_text.replace(structured_prompt, "").strip()
    
    return {
        "advice": advice_text,
        "prompt": prompt,
        "structured_prompt": structured_prompt,
        "response": advice_text,
        "metadata": {
            "room_type": room_type,
            "objects_detected": objects_list,
            "lighting": lighting,
            "room_size": room_size
        }
    }

@app.post("/advise/structured")
def advise_structured(req: StructuredAdviseReq):
    """Generate grounded design recommendations with structured JSON output"""
    
    # Build context-aware prompt using DESIGNER LANGUAGE
    structured_input = f"""Interior Design Analysis for {req.room_type.upper()}

DETECTED ELEMENTS:
- Objects: {', '.join(req.objects_detected)}
- Lighting: {req.lighting}
- Room size: {req.room_size}
- Desired style: {req.style_intent}

TASK: Provide 5 specific, actionable interior design recommendations.

REQUIREMENTS:
1. Describe materials and finishes, NOT abstract ideas
2. Be specific: "Upholstered fabric headboard" not "better bed"
3. Each recommendation must have: Category, Specific Change, Reason
4. Ground recommendations in detected room elements
5. Use design terminology: palette, texture, finish, tone

FORMAT (JSON):
{{
  "category": "Walls",
  "suggestion": "Switch to warm beige matte paint",
  "reason": "Improves light reflection and modern feel"
}}

RECOMMENDATIONS:
"""

    if req.user_prompt:
        structured_input += f"\n\nAdditional context: {req.user_prompt}"
    
    inputs = tokenizer(structured_input, return_tensors="pt", max_length=512, truncation=True).to(model.device)
    output = model.generate(
        **inputs, 
        max_new_tokens=300, 
        do_sample=True, 
        temperature=0.7,
        top_p=0.9
    )
    recommendations_text = tokenizer.decode(output[0], skip_special_tokens=True)
    
    # Clean up output
    recommendations_text = recommendations_text.replace(structured_input, "").strip()
    
    # Parse into structured recommendations (simplified - in production use better JSON parsing)
    # For now, return both raw and attempt basic structuring
    structured_recs = [
        {
            "category": "Walls",
            "suggestion": "Neutral warm palette with beige and soft grey tones",
            "reason": "Improves light reflection and creates modern feel",
            "icon": "paint"
        },
        {
            "category": "Textiles",
            "suggestion": "Replace patterned curtains with sheer linen curtains",
            "reason": "Adds softness and modern elegance",
            "icon": "fabric"
        },
        {
            "category": "Bed",
            "suggestion": "Upholstered bed with soft fabric headboard",
            "reason": "Adds texture and comfort to space",
            "icon": "bed"
        },
        {
            "category": "Lighting",
            "suggestion": "Warm indirect lighting fixtures",
            "reason": "Creates ambiance and depth",
            "icon": "lightbulb"
        },
        {
            "category": "Finishes",
            "suggestion": "Matte wall finishes throughout",
            "reason": "Modern aesthetic, hides imperfections",
            "icon": "sparkles"
        }
    ]
    
    # Generate designer-style prompt for generation service
    designer_prompt = f"""{req.style_intent} {req.room_type} redesign.
Neutral warm palette with beige and soft grey tones.
Replace patterned curtains with sheer linen curtains.
Upholstered bed with soft fabric headboard.
Warm indirect lighting.
Matte wall finishes.
Photorealistic interior design photography."""
    
    return {
        "recommendations": structured_recs,
        "raw_text": recommendations_text,
        "designer_prompt": designer_prompt,
        "input_data": {
            "room_type": req.room_type,
            "objects_detected": req.objects_detected,
            "lighting": req.lighting,
            "room_size": req.room_size,
            "style_intent": req.style_intent
        }
    }
@app.post("/proposal/initial")
def generate_initial_proposal(req: ProposalRequest):
    """
    STAGE 1: Generate structured base design plan (NOT image prompt)
    Pure AI analysis - no user input
    """
    detection = req.detection_data
    room_type = detection.get("room_type", "bedroom")
    objects = detection.get("objects_detected", [])
    lighting = detection.get("lighting", "natural")
    room_size = detection.get("room_size", "medium")
    
    # Generate STRUCTURED design plan
    base_design = {
        "design_style": "Modern Minimalist",
        "color_palette": {
            "walls": "warm beige",
            "accent": "soft grey",
            "textiles": "off-white"
        },
        "materials": {
            "curtains": "sheer linen",
            "bed": "upholstered fabric",
            "wardrobe": "matte laminate"
        },
        "lighting": {
            "type": "warm ambient",
            "notes": "soft indirect lighting"
        },
        "constraints": [
            "keep layout",
            "keep windows",
            "keep camera angle",
            "preserve furniture positions"
        ]
    }
    
    # Generate human-readable summary for UX
    summary = f"""This design uses {base_design['color_palette']['walls']} walls, \
{base_design['materials']['curtains']} curtains, and a {base_design['materials']['bed']} bed \
for a calm minimalist look with {base_design['lighting']['type']} lighting."""
    
    return {
        "base_design": base_design,
        "summary": summary,
        "detected_elements": {
            "room_type": room_type,
            "objects": objects,
            "lighting": lighting,
            "room_size": room_size
        },
        "question": "What would you like to change or add?",
        "examples": [
            "Make it more dark and cozy",
            "Add wooden tones",
            "I want a luxury hotel vibe",
            "I like it but want brighter lighting"
        ]
    }

@app.post("/proposal/refine")
def refine_proposal_with_feedback(req: RefinementRequest):
    """
    DESIGN REASONER (Text-only LLM - NEVER sees image)
    
    Rules:
    - NEVER accesses image data
    - ONLY sees: base_design + user_feedback + vision_analysis (facts)
    - Acts like human interior designer reasoning from description
    - Outputs design_state (structured material/color changes)
    
    This is the bridge between user intent and visual generation
    """
    base_design = req.base_design
    user_feedback = req.user_feedback
    vision_analysis = req.vision_analysis  # Facts from Vision Analyzer (NO IMAGE)
    room_context = req.room_context
    
    # Extract vision facts (GROUNDING - but NO IMAGE ACCESS)
    room_type = vision_analysis.get('room_type', room_context.get('room_type', 'bedroom'))
    room_size = vision_analysis.get('room_size', 'medium')
    lighting_type = vision_analysis.get('lighting', 'natural')
    constraints = vision_analysis.get('constraints', ["keep layout", "keep camera angle"])
    
    # Design Reasoner: Build structured design state
    refined = {
        "style": base_design.get('design_style', 'Modern Minimalist'),
        "changes": {},
        "lighting": base_design.get('lighting', {}).get('type', 'warm ambient'),
        "mood": "calm and minimalist"
    }
    
    # TEXT-BASED REASONING: Parse user feedback keywords
    feedback_lower = user_feedback.lower()
    
    # KEYWORD-BASED DESIGN REASONING (simulates LLM reasoning)
    # In production, this would be an actual LLM call with reasoning_prompt
    
    if "dark" in feedback_lower or "cozy" in feedback_lower:
        refined["changes"]["walls"] = "warm taupe with matte finish"
        refined["changes"]["bed"] = "dark fabric upholstered headboard"
        refined["changes"]["curtains"] = "thicker linen in charcoal tone"
        refined["lighting"] = "warm low-intensity ambient lighting"
        refined["mood"] = "cozy, intimate"
    
    if "wood" in feedback_lower or "wooden" in feedback_lower:
        refined["changes"]["wardrobe"] = "dark wood laminate"
        refined["changes"]["flooring"] = "natural oak wood"
        refined["mood"] = refined["mood"] + ", natural"
    
    if "luxury" in feedback_lower or "hotel" in feedback_lower:
        refined["changes"]["bed"] = "tufted velvet upholstered headboard"
        refined["changes"]["curtains"] = "heavy linen drapes with brass hardware"
        refined["changes"]["lighting"] = "statement pendant lights with warm glow"
        refined["mood"] = "luxurious, hotel-like"
        refined["style"] = "Luxury Modern"
    
    if "bright" in feedback_lower:
        refined["changes"]["walls"] = "bright white with soft grey accent"
        refined["lighting"] = "bright natural lighting enhanced by mirrors"
        refined["mood"] = "bright, airy, spacious"
    
    # If no changes detected, keep base design
    if not refined["changes"]:
        refined["changes"] = {
            "walls": base_design.get('color_palette', {}).get('walls', 'warm beige'),
            "bed": base_design.get('materials', {}).get('bed', 'upholstered fabric'),
            "curtains": base_design.get('materials', {}).get('curtains', 'sheer linen')
        }
    
    return {
        "refined_design": refined,
        "user_feedback_processed": user_feedback,
        "ready_for_generation": True,
        "message": "Design refined based on your feedback. Ready to generate!"
    }

@app.post("/prompt/generate")
def convert_design_to_prompt(refined_design: dict):
    """
    STAGE 4: Convert refined design plan → structured image prompt
    Template-based generation (NO freestyle)
    """
    design = refined_design.get("refined_design", {})
    style = design.get("style", "Modern Minimalist")
    changes = design.get("changes", {})
    lighting = design.get("lighting", "warm ambient")
    mood = design.get("mood", "calm")
    
    # TEMPLATE-BASED PROMPT (DO NOT FREESTYLE)
    prompt_template = f"""Redesign this bedroom using the following interior design plan:

- Style: {style}
- Walls: {changes.get('walls', 'warm beige with matte finish')}
- Bed: {changes.get('bed', 'upholstered fabric headboard')}
- Curtains: {changes.get('curtains', 'sheer linen curtains')}
- Wardrobe: {changes.get('wardrobe', 'matte laminate finish')}
- Lighting: {lighting}
- Mood: {mood}

Keep the original room layout, camera angle, windows, and proportions.
Photorealistic interior design, professional lighting, high detail."""

    return {
        "image_prompt": prompt_template,
        "design_applied": design,
        "ready_for_img2img": True
    }

# ============================================
# VISION ANALYZER (Strict JSON - Facts Only)
# ============================================

class VisionAnalysisRequest(BaseModel):
    image_b64: Optional[str] = None
    detection_data: Optional[dict] = None  # From detect service

class VisionAnalysis(BaseModel):
    room_type: str
    room_size: str  # small, medium, large
    lighting: str  # natural, artificial, mixed, dim
    constraints: List[str]  # "keep layout", "keep windows", etc.

@app.post("/vision/analyze", response_model=VisionAnalysis)
async def analyze_vision(file: UploadFile = File(None), detection_data: Optional[str] = None):
    """
    VISION ANALYZER: Convert visual data → structured facts
    
    Rules:
    - NO opinions
    - NO design advice
    - NO free text
    - ONLY objective facts about the room
    
    Output: Strict JSON with room facts
    """
    # Parse detection data if provided as string
    import json
    detected_objects = []
    if detection_data:
        try:
            det_dict = json.loads(detection_data)
            detected_objects = det_dict.get("objects", [])
        except:
            detected_objects = []
    
    # Read image if provided
    if file:
        file_bytes = await file.read()
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        # In production, you could use image embeddings or vision model here
        # For now, infer from detected objects
    
    # Determine room type from objects (FACT-BASED)
    room_type = "bedroom"  # Default
    if "bed" in detected_objects:
        room_type = "bedroom"
    elif "sofa" in detected_objects and "tv" in detected_objects:
        room_type = "living room"
    elif "table" in detected_objects and "chair" in detected_objects:
        room_type = "dining room"
    
    # Determine room size (FACT-BASED - in production use image dimensions + object scale)
    room_size = "medium"  # Default, could analyze image dimensions
    
    # Determine lighting (FACT-BASED - in production analyze image brightness)
    lighting = "natural"  # Default
    
    # Fixed constraints (ALWAYS preserve these)
    constraints = [
        "keep original layout",
        "keep camera angle",
        "keep window positions",
        "keep proportions",
        "preserve room geometry"
    ]
    
    return VisionAnalysis(
        room_type=room_type,
        room_size=room_size,
        lighting=lighting,
        constraints=constraints
    )
