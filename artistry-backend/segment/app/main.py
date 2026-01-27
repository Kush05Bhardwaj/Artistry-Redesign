from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch, base64, io, numpy as np
from PIL import Image
import os
import sys
import cv2
from mobile_sam import sam_model_registry, SamPredictor
from functools import lru_cache
import gc


app = FastAPI(title="MobileSAM Service (Optimized)")

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

# Lazy loading for optimization
sam = None
predictor = None

def get_sam_predictor():
    """Lazy load SAM model with caching"""
    global sam, predictor
    if predictor is None:
        # Use relative path from current directory
        sam_checkpoint = os.path.join(os.path.dirname(__file__), "mobile_sam.pt")
        if not os.path.exists(sam_checkpoint):
            sam_checkpoint = "mobile_sam.pt"  # Fallback to current directory
        sam = sam_model_registry[model_type](checkpoint=sam_checkpoint).to(device)
        predictor = SamPredictor(sam)
        
        # Enable optimizations for CUDA
        if device == "cuda":
            torch.backends.cudnn.benchmark = True
    return predictor

@app.on_event("startup")
async def startup_event():
    """Preload SAM model during startup"""
    print(f"Loading MobileSAM model on {device}...")
    get_sam_predictor()
    print("✓ MobileSAM model loaded and optimized")

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
    enable_edge_refinement: bool = True  # Toggle for edge refinement

@lru_cache(maxsize=64)
def decode_image_cached(b64: str):
    """Cache decoded images"""
    img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    return np.array(img)

def decode_image(b64):
    return decode_image_cached(b64)

def generate_canny_edges(image, low_threshold=50, high_threshold=150):
    """
    Generate Canny edge map for edge refinement
    Helps sharpen mask boundaries (walls, curtains, furniture edges)
    """
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, low_threshold, high_threshold)
    return edges

def refine_mask_with_edges(mask, edge_map, dilation_kernel_size=3):
    """
    Refine SAM mask boundaries using edge map
    Prevents fuzzy edges and bleeding (curtains into windows, etc.)
    """
    # Dilate edge map slightly to create boundary zone
    kernel = np.ones((dilation_kernel_size, dilation_kernel_size), np.uint8)
    edge_dilated = cv2.dilate(edge_map, kernel, iterations=1)
    
    # Where edges exist, sharpen mask boundaries
    # If mask overlaps with edge, keep it sharp
    refined_mask = mask.copy()
    
    # Use edge map to clean up mask boundaries
    # Remove mask pixels that don't align with edges at boundaries
    mask_edges = cv2.Canny((mask * 255).astype(np.uint8), 50, 150)
    
    # Combine: keep mask interior, align boundaries with detected edges
    edge_agreement = cv2.bitwise_and(mask_edges, edge_map)
    
    # If edge_agreement is strong, trust it; otherwise keep original mask
    refined_mask = np.where(edge_dilated > 0, edge_agreement > 0, mask)
    
    return refined_mask.astype(bool)

@app.post("/segment")
def segment(req: SegmentReq):
    """Optimized segmentation with optional edge refinement"""
    image = decode_image(req.image_b64)
    predictor = get_sam_predictor()
    predictor.set_image(image)
    
    # Generate edge map for refinement if enabled
    edge_map = generate_canny_edges(image) if req.enable_edge_refinement else None
    
    masks = []
    for box in req.bboxes or []:
        box_np = np.array([[box["x1"], box["y1"], box["x2"], box["y2"]]])
        mask, _, _ = predictor.predict_torch(
            point_coords=None,
            point_labels=None,
            boxes=torch.tensor(box_np, device=device),
            multimask_output=False
        )
        mask_raw = mask[0][0].cpu().numpy()
        
        # EDGE REFINEMENT: sharpen boundaries (if enabled)
        if req.enable_edge_refinement and edge_map is not None:
            mask_refined = refine_mask_with_edges(mask_raw, edge_map)
        else:
            mask_refined = mask_raw
        
        mask_img = (mask_refined * 255).astype(np.uint8)
        mask_b64 = base64.b64encode(Image.fromarray(mask_img).tobytes()).decode()
        masks.append({"bbox": box, "mask_b64": mask_b64})
    
    # Clean up memory
    if device == "cuda":
        torch.cuda.empty_cache()
        
    return {"masks": masks}

@app.post("/segment/")
async def segment_file(file: UploadFile = File(...), num_samples: int = 10):
    """File upload endpoint for frontend integration with edge refinement"""
    file_bytes = await file.read()
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    image = np.array(img)
    
    predictor.set_image(image)
    
    # Generate edge map for refinement
    edge_map = generate_canny_edges(image)
    
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
        mask_raw = mask[0]
        
        # EDGE REFINEMENT: sharpen boundaries
        mask_refined = refine_mask_with_edges(mask_raw, edge_map)
        
        masks_list.append(mask_refined)
        
        # Overlay mask with random color
        color = np.random.randint(0, 255, 3)
        segmented_img[mask_refined] = segmented_img[mask_refined] * 0.5 + color * 0.5
    
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
        "masks": masks_serializable,
        "edge_refinement": True  # Indicate edge refinement was applied
    }

