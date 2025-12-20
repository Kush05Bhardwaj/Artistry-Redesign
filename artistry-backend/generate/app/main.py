from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from diffusers import (
    StableDiffusionControlNetImg2ImgPipeline, 
    StableDiffusionInpaintPipeline,
    ControlNetModel, 
    EulerAncestralDiscreteScheduler
)
import torch, base64, io
from PIL import Image
import numpy as np
import cv2  # for real Canny edge detection
from typing import Optional, List, Dict

app = FastAPI(title="Stable Diffusion + ControlNet Service")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Choose device
device = "cuda" if torch.cuda.is_available() else "cpu"

# Model identifiers
base_model = "runwayml/stable-diffusion-v1-5"
controlnet_canny = "lllyasviel/sd-controlnet-canny"
controlnet_depth = "lllyasviel/sd-controlnet-depth"

# Determine dtype based on device (CPU needs float32, GPU can use float16)
dtype = torch.float16 if device == "cuda" else torch.float32

# Initialize as None - will load on startup
pipe = None
inpaint_pipe = None  # Separate pipeline for inpainting
controlnet_models = {}

@app.on_event("startup")
async def load_models():
    """Load models during FastAPI startup to avoid blocking module import"""
    global pipe, inpaint_pipe, controlnet_models
    try:
        print("Loading ControlNet models...")
        # Load Canny ControlNet (primary for edge preservation)
        controlnet_models['canny'] = ControlNetModel.from_pretrained(controlnet_canny, torch_dtype=dtype)
        print("✓ Canny ControlNet loaded")
        
        # Optionally load Depth ControlNet (uncomment if needed)
        # controlnet_models['depth'] = ControlNetModel.from_pretrained(controlnet_depth, torch_dtype=dtype)
        # print("✓ Depth ControlNet loaded")
        
        print("Loading Stable Diffusion Img2Img pipeline with ControlNet...")
        pipe = StableDiffusionControlNetImg2ImgPipeline.from_pretrained(
            base_model,
            controlnet=controlnet_models['canny'],
            torch_dtype=dtype
        ).to(device)
        
        # Load Inpainting pipeline for per-object redesign
        print("Loading Stable Diffusion Inpainting pipeline...")
        inpaint_pipe = StableDiffusionInpaintPipeline.from_pretrained(
            "runwayml/stable-diffusion-inpainting",
            torch_dtype=dtype
        ).to(device)
        
        # Optimize pipelines
        pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
        pipe.enable_attention_slicing()  # Helps reduce memory usage
        inpaint_pipe.enable_attention_slicing()
        print(f"✓ Generate service ready on {device} (img2img + inpainting modes)")
    except Exception as e:
        print(f"⚠ Warning: Failed to load models: {e}")
        print("Service will run but generation endpoints will fail")

@app.get("/")
def root():
    """Root endpoint"""
    return {"status": "ok", "service": "Generate (Stable Diffusion)", "device": device, "model_loaded": pipe is not None}

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "Generate (Stable Diffusion)", "device": device, "model_loaded": pipe is not None}

class RenderReq(BaseModel):
    image_b64: str
    prompt: str
    masks: list | None = []
    options: dict | None = {}

# ---- Helpers ----
def decode_image(b64_str: str) -> Image.Image:
    """Decode base64 to PIL image."""
    img_bytes = base64.b64decode(b64_str)
    return Image.open(io.BytesIO(img_bytes)).convert("RGB")

def create_canny_map(image: Image.Image, low_threshold: int = 100, high_threshold: int = 200) -> Image.Image:
    """Generate a Canny edge control image from input."""
    np_img = np.array(image)
    edges = cv2.Canny(np_img, low_threshold, high_threshold)
    # Convert to 3-channel for consistency
    edges_3ch = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)
    return Image.fromarray(edges_3ch)

def create_depth_map(image: Image.Image) -> Image.Image:
    """Generate a simple depth map (placeholder - use MiDaS for production)."""
    # This is a placeholder - in production, use MiDaS depth estimation
    np_img = np.array(image.convert('L'))
    # Simple depth approximation using gradient
    depth = cv2.GaussianBlur(np_img, (9, 9), 0)
    depth_3ch = cv2.cvtColor(depth, cv2.COLOR_GRAY2RGB)
    return Image.fromarray(depth_3ch)

# ---- Main Endpoint ----
@app.post("/render")
def render(req: RenderReq):
    if pipe is None:
        return {"error": "Model not loaded. Service is still initializing."}
    
    # Decode original image
    image = decode_image(req.image_b64)
    image = image.resize((512, 512))

    # Generate ControlNet conditioning (Canny edges for structure preservation)
    control_image = create_canny_map(image)

    # Extract parameters
    strength = req.options.get("strength", 0.75) if req.options else 0.75
    guidance_scale = req.options.get("guidance_scale", 7.5) if req.options else 7.5
    num_steps = req.options.get("steps", 30) if req.options else 30
    controlnet_scale = req.options.get("controlnet_conditioning_scale", 1.0) if req.options else 1.0

    # Run img2img diffusion with ControlNet
    result = pipe(
        prompt=req.prompt,
        image=image,  # Original image for img2img
        control_image=control_image,  # Canny edges for structure
        strength=strength,  # How much to transform (0.0 = original, 1.0 = complete redraw)
        guidance_scale=guidance_scale,
        num_inference_steps=num_steps,
        controlnet_conditioning_scale=controlnet_scale
    ).images[0]

    # Encode to base64
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    b64_img = base64.b64encode(buf.getvalue()).decode()

    return {"image_b64": b64_img}

@app.post("/generate/")
async def generate_file(
    file: UploadFile = File(...),
    prompt: str = Form("Modern minimalist bedroom redesign. Neutral warm palette with beige and soft grey tones. Replace patterned curtains with sheer linen curtains. Upholstered bed with soft fabric headboard. Warm indirect lighting. Matte wall finishes. Photorealistic interior design photography."),
    num_inference_steps: int = Form(30),
    guidance_scale: float = Form(7.5),
    mode: str = Form("balanced"),  # "subtle", "balanced", "bold"
    two_pass: bool = Form(False),  # Enable two-pass generation
    controlnet_conditioning_scale: float = Form(1.0)
):
    """File upload endpoint using img2img with ControlNet and adaptive strength"""
    if pipe is None:
        return {"error": "Model not loaded. Service is still initializing."}
    
    # Map mode to strength values
    strength_map = {
        "subtle": 0.3,
        "balanced": 0.55,
        "bold": 0.7
    }
    strength = strength_map.get(mode, 0.55)
    
    # Read and process original image
    file_bytes = await file.read()
    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    image = image.resize((512, 512))
    
    # Generate Canny edge control image for structure preservation
    control_image = create_canny_map(image)
    
    if two_pass:
        # PASS A: Structure lock (low strength, high ControlNet)
        print("Pass A: Structure lock...")
        pass_a_result = pipe(
            prompt=prompt,
            image=image,
            control_image=control_image,
            strength=0.3,  # Low denoise for structure preservation
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            controlnet_conditioning_scale=1.2  # Strong ControlNet influence
        ).images[0]
        
        # PASS B: Style enhancement (higher strength, weak/no ControlNet)
        print("Pass B: Style enhancement...")
        result = pipe(
            prompt=prompt,
            image=pass_a_result,  # Use Pass A output as input
            control_image=control_image,
            strength=0.5,  # Higher denoise for style changes
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            controlnet_conditioning_scale=0.3  # Weak ControlNet for creativity
        ).images[0]
        
        # Save Pass A for debugging
        pass_a_buf = io.BytesIO()
        pass_a_result.save(pass_a_buf, format="PNG")
        pass_a_b64 = f"data:image/png;base64,{base64.b64encode(pass_a_buf.getvalue()).decode()}"
    else:
        # Single pass generation
        result = pipe(
            prompt=prompt,
            image=image,
            control_image=control_image,
            strength=strength,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            controlnet_conditioning_scale=controlnet_conditioning_scale
        ).images[0]
        pass_a_b64 = None
    
    # Convert result to base64
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    generated_b64 = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}"
    
    # Also return canny image for debugging
    canny_buf = io.BytesIO()
    control_image.save(canny_buf, format="PNG")
    canny_b64 = f"data:image/png;base64,{base64.b64encode(canny_buf.getvalue()).decode()}"
    
    # Return original image for comparison
    orig_buf = io.BytesIO()
    image.save(orig_buf, format="PNG")
    original_b64 = f"data:image/png;base64,{base64.b64encode(orig_buf.getvalue()).decode()}"
    
    return {
        "generated_image": generated_b64,
        "original_image": original_b64,
        "canny_image": canny_b64,
        "pass_a_image": pass_a_b64,  # Only if two_pass=True
        "prompt": prompt,
        "parameters": {
            "mode": mode,
            "strength": strength,
            "guidance_scale": guidance_scale,
            "steps": num_inference_steps,
            "controlnet_scale": controlnet_conditioning_scale,
            "two_pass": two_pass
        }
    }


# ============================================
# PER-OBJECT INPAINTING (Multi-pass Generation)
# ============================================

class InpaintingStep(BaseModel):
    """Single inpainting step for one object"""
    object_name: str  # "walls", "curtains", "bed", "wardrobe"
    prompt: str  # Focused prompt for this object
    denoise_strength: float = 0.8  # How much to change (0.0-1.0)

class MultiPassInpaintRequest(BaseModel):
    """Request for multi-pass inpainting"""
    image_b64: str
    masks: Dict[str, str]  # {"walls": "base64_mask", "curtains": "base64_mask", ...}
    steps: List[InpaintingStep]  # Ordered steps
    guidance_scale: float = 7.5
    num_inference_steps: int = 30

@app.post("/generate/inpaint_multi")
async def inpaint_multi_pass(req: MultiPassInpaintRequest):
    """
    MULTI-PASS INPAINTING: Sequential object redesign
    
    Pipeline:
    1. Walls → focused prompt, specific mask, tuned denoise
    2. Curtains → focused prompt, specific mask, tuned denoise
    3. Bed → focused prompt, specific mask, tuned denoise
    4. Wardrobe → focused prompt, specific mask, tuned denoise
    
    Each pass uses the previous pass output as input.
    This creates intentional, controlled design changes.
    """
    if inpaint_pipe is None:
        return {"error": "Inpainting model not loaded"}
    
    # Decode original image
    current_image = decode_image(req.image_b64)
    current_image = current_image.resize((512, 512))
    
    # Decode all masks
    masks = {}
    for obj_name, mask_b64 in req.masks.items():
        mask_img = decode_image(mask_b64).convert("L")
        mask_img = mask_img.resize((512, 512))
        masks[obj_name] = mask_img
    
    # Execute inpainting steps sequentially
    pass_results = []
    
    for step in req.steps:
        obj_name = step.object_name
        prompt = step.prompt
        denoise = step.denoise_strength
        
        if obj_name not in masks:
            print(f"⚠ Warning: No mask found for {obj_name}, skipping...")
            continue
        
        mask = masks[obj_name]
        
        print(f"Inpainting {obj_name} (denoise: {denoise})...")
        
        # Inpaint this object
        result = inpaint_pipe(
            prompt=prompt,
            image=current_image,
            mask_image=mask,
            num_inference_steps=req.num_inference_steps,
            guidance_scale=req.guidance_scale,
            strength=denoise  # How much to change
        ).images[0]
        
        # Save intermediate result
        pass_results.append({
            "object": obj_name,
            "image": result
        })
        
        # Use this result as input for next step
        current_image = result
    
    # Convert final result to base64
    final_buf = io.BytesIO()
    current_image.save(final_buf, format="PNG")
    final_b64 = f"data:image/png;base64,{base64.b64encode(final_buf.getvalue()).decode()}"
    
    # Also return intermediate passes for debugging
    intermediate_results = []
    for pass_result in pass_results:
        buf = io.BytesIO()
        pass_result["image"].save(buf, format="PNG")
        intermediate_results.append({
            "object": pass_result["object"],
            "image": f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}"
        })
    
    return {
        "final_image": final_b64,
        "intermediate_passes": intermediate_results,
        "num_passes": len(pass_results)
    }


@app.post("/generate/inpaint_file")
async def inpaint_file(
    file: UploadFile = File(...),
    mask: UploadFile = File(...),
    prompt: str = Form("Redesigned interior element, photorealistic"),
    denoise_strength: float = Form(0.8),
    num_inference_steps: int = Form(30),
    guidance_scale: float = Form(7.5)
):
    """
    Simple single-object inpainting endpoint
    For testing/debugging individual object redesigns
    """
    if inpaint_pipe is None:
        return {"error": "Inpainting model not loaded"}
    
    # Read image and mask
    image_bytes = await file.read()
    mask_bytes = await mask.read()
    
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((512, 512))
    mask_img = Image.open(io.BytesIO(mask_bytes)).convert("L").resize((512, 512))
    
    # Run inpainting
    result = inpaint_pipe(
        prompt=prompt,
        image=image,
        mask_image=mask_img,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        strength=denoise_strength
    ).images[0]
    
    # Convert to base64
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    result_b64 = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}"
    
    return {
        "inpainted_image": result_b64,
        "prompt": prompt,
        "denoise_strength": denoise_strength
    }
