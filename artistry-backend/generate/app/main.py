from fastapi import FastAPI
from pydantic import BaseModel
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, EulerAncestralDiscreteScheduler
import torch, base64, io
from PIL import Image
import numpy as np
import cv2  # for real Canny edge detection

app = FastAPI(title="Stable Diffusion + ControlNet Service")

# Choose device
device = "cuda" if torch.cuda.is_available() else "cpu"

# Model identifiers
base_model = "runwayml/stable-diffusion-v1-5"
controlnet_model = "lllyasviel/sd-controlnet-canny"

# Determine dtype based on device (CPU needs float32, GPU can use float16)
dtype = torch.float16 if device == "cuda" else torch.float32

# Load models with appropriate dtype
controlnet = ControlNetModel.from_pretrained(controlnet_model, torch_dtype=dtype)
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    base_model,
    controlnet=controlnet,
    torch_dtype=dtype
).to(device)

# Optimize pipeline
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
# Only enable xformers on CUDA (and if xformers is installed)
# pipe.enable_xformers_memory_efficient_attention()  # Disabled - xformers not compatible with PyTorch 2.4.0
pipe.enable_attention_slicing()  # Still helps reduce memory usage

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
