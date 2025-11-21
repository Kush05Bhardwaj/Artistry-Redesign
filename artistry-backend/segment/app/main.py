from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch, base64, io, numpy as np
from PIL import Image
import os
import sys
from mobile_sam import sam_model_registry, SamPredictor


app = FastAPI(title="MobileSAM Service")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = "cuda" if torch.cuda.is_available() else "cpu"
model_type = "vit_t"  # tiny variant for MobileSAM
# Use relative path from current directory
sam_checkpoint = os.path.join(os.path.dirname(__file__), "mobile_sam.pt")
if not os.path.exists(sam_checkpoint):
    sam_checkpoint = "mobile_sam.pt"  # Fallback to current directory
sam = sam_model_registry[model_type](checkpoint=sam_checkpoint).to(device)
predictor = SamPredictor(sam)

@app.get("/")
def root():
    """Root endpoint"""
    return {"status": "ok", "service": "Segment (MobileSAM)", "device": device}

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "Segment (MobileSAM)", "device": device}

class SegmentReq(BaseModel):
    image_b64: str
    bboxes: list | None = []

def decode_image(b64):
    img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    return np.array(img)

@app.post("/segment")
def segment(req: SegmentReq):
    image = decode_image(req.image_b64)
    predictor.set_image(image)
    masks = []
    for box in req.bboxes or []:
        box_np = np.array([[box["x1"], box["y1"], box["x2"], box["y2"]]])
        mask, _, _ = predictor.predict_torch(
            point_coords=None,
            point_labels=None,
            boxes=torch.tensor(box_np, device=device),
            multimask_output=False
        )
        mask_img = (mask[0][0].cpu().numpy() * 255).astype(np.uint8)
        mask_b64 = base64.b64encode(Image.fromarray(mask_img).tobytes()).decode()
        masks.append({"bbox": box, "mask_b64": mask_b64})
    return {"masks": masks}

@app.post("/segment/")
async def segment_file(file: UploadFile = File(...), num_samples: int = 10):
    """File upload endpoint for frontend integration"""
    file_bytes = await file.read()
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    image = np.array(img)
    
    predictor.set_image(image)
    
    # Generate automatic grid of sample points
    h, w = image.shape[:2]
    points = []
    labels = []
    
    # Create grid of points
    grid_size = int(np.sqrt(num_samples))
    for i in range(grid_size):
        for j in range(grid_size):
            x = int((j + 0.5) * w / grid_size)
            y = int((i + 0.5) * h / grid_size)
            points.append([x, y])
            labels.append(1)  # foreground points
    
    points_np = np.array(points)
    labels_np = np.array(labels)
    
    # Predict masks
    masks_list = []
    segmented_img = image.copy()
    
    for point, label in zip(points_np, labels_np):
        mask, _, _ = predictor.predict(
            point_coords=point.reshape(1, 2),
            point_labels=np.array([label]),
            multimask_output=False
        )
        masks_list.append(mask[0])
        
        # Overlay mask with random color
        color = np.random.randint(0, 255, 3)
        segmented_img[mask[0]] = segmented_img[mask[0]] * 0.5 + color * 0.5
    
    # Convert segmented image to base64
    segmented_pil = Image.fromarray(segmented_img.astype(np.uint8))
    buffer = io.BytesIO()
    segmented_pil.save(buffer, format="PNG")
    segmented_b64 = f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"
    
    # Convert numpy masks to lists for JSON serialization
    masks_serializable = [mask.tolist() for mask in masks_list]
    
    return {
        "segmented_image": segmented_b64,
        "num_segments": len(masks_list),
        "masks": masks_serializable
    }

