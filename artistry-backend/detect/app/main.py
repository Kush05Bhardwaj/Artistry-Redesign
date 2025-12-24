from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import torch, base64, io
from PIL import Image
import numpy as np
import cv2

app = FastAPI(title="YOLOv8n Detection Service")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INTERIOR-ONLY CLASS FILTER
# Expanded to detect ALL interior-related objects including structural elements
INTERIOR_CLASSES = {
    # Furniture
    "bed", "chair", "couch", "sofa", "dining table", "bench", "desk", "dresser",
    # Electronics
    "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "monitor",
    # Appliances
    "microwave", "oven", "toaster", "sink", "refrigerator", "dishwasher",
    # Decor & Items
    "potted plant", "vase", "clock", "book", "bottle", "cup", 
    "wine glass", "bowl", "knife", "spoon", "fork", "picture", "frame",
    # Storage & Organization
    "backpack", "handbag", "suitcase", "umbrella", "cabinet", "shelf",
    # Lighting
    "lamp", "light", "chandelier",
    # Textiles & Bedding
    "tie", "teddy bear", "hair drier", "toothbrush", "pillow", "blanket", "towel",
    # Structural (if detected)
    "door", "window", "curtain", "blinds", "wall", "floor", "ceiling",
    # Sports/Leisure (sometimes in rooms)
    "frisbee", "skis", "snowboard", "sports ball", "kite", 
    "baseball bat", "baseball glove", "skateboard", "surfboard", 
    "tennis racket",
    # Additional common items
    "scissors", "pen", "pencil", "person"
}

# Map YOLO COCO names to interior-friendly names
CLASS_MAPPING = {
    "couch": "sofa",
    "dining table": "table",
    "potted plant": "plant",
    "tv": "television",
    "cell phone": "phone",
    "remote": "remote control"
}

device = "cuda" if torch.cuda.is_available() else "cpu"
model = YOLO("yolov8n.pt")  # auto-download
model.to(device)
model.fuse()  # fuse conv+bn layers for speed

@app.get("/")
def root():
    """Root endpoint"""
    return {"status": "ok", "service": "Detect (YOLOv8)", "device": device}

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "Detect (YOLOv8)", "device": device}

class DetectReq(BaseModel):
    image_b64: str

def decode_image(b64):
    img_bytes = base64.b64decode(b64)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return np.array(img)

def decode_image_file(file_bytes):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    return np.array(img)

@app.post("/detect")
def detect(req: DetectReq):
    img = decode_image(req.image_b64)
    # Lower confidence threshold to detect more objects
    results = model.predict(img, imgsz=640, device=device, half=True, verbose=False, conf=0.1, iou=0.3)
    dets = []
    for r in results:
        for box in r.boxes:
            label = model.names[int(box.cls[0])]
            
            # Filter: only interior classes
            if label not in INTERIOR_CLASSES:
                continue
            
            # Map to friendly name
            label = CLASS_MAPPING.get(label, label)
            
            b = box.xyxy[0].tolist()
            dets.append({
                "label": label,
                "x1": int(b[0]), "y1": int(b[1]), "x2": int(b[2]), "y2": int(b[3]),
                "score": float(box.conf[0])
            })
    return {"bboxes": dets}

@app.post("/detect/")
async def detect_file(file: UploadFile = File(...)):
    """File upload endpoint for frontend integration"""
    file_bytes = await file.read()
    img = decode_image_file(file_bytes)
    
    # Run detection with lower confidence threshold to detect more objects
    results = model.predict(img, imgsz=640, device=device, verbose=False, conf=0.1, iou=0.3)
    
    # Extract object names and bounding boxes
    objects = []
    bounding_boxes = []
    confidence = []
    
    # Draw bounding boxes on image
    annotated_img = img.copy()
    
    for r in results:
        for box in r.boxes:
            label = model.names[int(box.cls[0])]
            
            # Filter: only interior classes
            if label not in INTERIOR_CLASSES:
                continue
            
            # Map to friendly name
            label = CLASS_MAPPING.get(label, label)
            
            b = box.xyxy[0].tolist()
            score = float(box.conf[0])
            
            objects.append(label)
            bounding_boxes.append({
                "x1": int(b[0]), "y1": int(b[1]), 
                "x2": int(b[2]), "y2": int(b[3])
            })
            confidence.append(score)
            
            # Draw rectangle and label on image
            cv2.rectangle(annotated_img, 
                         (int(b[0]), int(b[1])), 
                         (int(b[2]), int(b[3])), 
                         (0, 255, 0), 2)
            cv2.putText(annotated_img, f"{label} {score:.2f}", 
                       (int(b[0]), int(b[1])-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # Convert annotated image to base64
    annotated_pil = Image.fromarray(annotated_img)
    buffer = io.BytesIO()
    annotated_pil.save(buffer, format="JPEG")
    annotated_b64 = f"data:image/jpeg;base64,{base64.b64encode(buffer.getvalue()).decode()}"
    
    return {
        "objects": objects,
        "annotated_image": annotated_b64,
        "bounding_boxes": bounding_boxes,
        "confidence": confidence
    }
