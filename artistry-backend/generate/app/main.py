from fastapi import FastAPI
from pydantic import BaseModel
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, EulerAncestralDiscreteScheduler
import torch, base64, io
from PIL import Image
import numpy as np

app = FastAPI(title="Stable Diffusion + ControlNet Service")

device = "cuda" if torch.cuda.is_available() else "cpu"

base_model = "runwayml/stable-diffusion-v1-5"
controlnet_model = "lllyasviel/sd-controlnet-canny"

controlnet = ControlNetModel.from_pretrained(controlnet_model, torch_dtype=torch.float16)
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    base_model,
    controlnet=controlnet,
    torch_dtype=torch.float16
).to(device)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.enable_xformers_memory_efficient_attention()
pipe.enable_attention_slicing()

class RenderReq(BaseModel):
    image_b64: str
    masks: list | None = []
    prompt: str
    options: dict | None = {}

def decode_image(b64):
    img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    return img

@app.post("/render")
def render(req: RenderReq):
    image = decode_image(req.image_b64)
    low_res = image.resize((512,512))
    control = low_res.convert("L")  # placeholder control (Canny)
    result = pipe(
        prompt=req.prompt,
        image=low_res,
        control_image=control,
        guidance_scale=7.5,
        num_inference_steps=req.options.get("steps",20) if req.options else 20
    ).images[0]
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    b64_img = base64.b64encode(buf.getvalue()).decode()
    return {"image_b64": b64_img}
