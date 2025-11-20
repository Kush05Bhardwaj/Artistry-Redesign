from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, EulerAncestralDiscreteScheduler
import torch, base64, io
from PIL import Image
import numpy as np
import cv2  # for real Canny edge detection

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
controlnet_model = "lllyasviel/sd-controlnet-canny"

# Determine dtype based on device (CPU needs float32, GPU can use float16)
dtype = torch.float16 if device == "cuda" else torch.float32

# Initialize as None - will load on startup
pipe = None

@app.on_event("startup")
async def load_models():
    """Load models during FastAPI startup to avoid blocking module import"""
    global pipe
    try:
        print("Loading ControlNet model...")
        controlnet = ControlNetModel.from_pretrained(controlnet_model, torch_dtype=dtype)
        print("Loading Stable Diffusion pipeline...")
        pipe = StableDiffusionControlNetPipeline.from_pretrained(
            base_model,
            controlnet=controlnet,
            torch_dtype=dtype
        ).to(device)
        
        # Optimize pipeline
        pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
        pipe.enable_attention_slicing()  # Helps reduce memory usage
        print(f"✓ Generate service ready on {device}")
    except Exception as e:
        print(f"⚠ Warning: Failed to load models: {e}")
        print("Service will run but generation endpoints will fail")

@app.get("/")
def root():
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

def create_canny_map(image: Image.Image) -> Image.Image:
    """Generate a Canny edge control image from input."""
    np_img = np.array(image)
    edges = cv2.Canny(np_img, 100, 200)
    return Image.fromarray(edges)

# ---- Main Endpoint ----
@app.post("/render")
def render(req: RenderReq):
    if pipe is None:
        return {"error": "Model not loaded. Service is still initializing."}
    
    image = decode_image(req.image_b64)
    image = image.resize((512, 512))

    # Generate proper ControlNet conditioning input (Canny)
    control_image = create_canny_map(image)

    # Run diffusion
    result = pipe(
        prompt=req.prompt,
        image=image,
        control_image=control_image,
        guidance_scale=req.options.get("guidance_scale", 7.5) if req.options else 7.5,
        num_inference_steps=req.options.get("steps", 20) if req.options else 20
    ).images[0]

    # Encode to base64
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    b64_img = base64.b64encode(buf.getvalue()).decode()

    return {"image_b64": b64_img}

@app.post("/generate/")
async def generate_file(
    file: UploadFile = File(...),
    prompt: str = "Modern minimalist interior design",
    num_inference_steps: int = 20,
    guidance_scale: float = 7.5,
    controlnet_conditioning_scale: float = 0.5
):
    """File upload endpoint for frontend integration"""
    if pipe is None:
        return {"error": "Model not loaded. Service is still initializing."}
    
    # Read and process image
    file_bytes = await file.read()
    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    image = image.resize((512, 512))
    
    # Generate Canny edge control image
    control_image = create_canny_map(image)
    
    # Run diffusion pipeline
    result = pipe(
        prompt=prompt,
        image=control_image,  # ControlNet uses canny edges
        guidance_scale=guidance_scale,
        num_inference_steps=num_inference_steps,
        controlnet_conditioning_scale=controlnet_conditioning_scale
    ).images[0]
    
    # Convert to base64
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    generated_b64 = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}"
    
    # Also return canny image for debugging
    canny_buf = io.BytesIO()
    control_image.save(canny_buf, format="PNG")
    canny_b64 = f"data:image/png;base64,{base64.b64encode(canny_buf.getvalue()).decode()}"
    
    return {
        "generated_image": generated_b64,
        "canny_image": canny_b64,
        "prompt": prompt
    }

