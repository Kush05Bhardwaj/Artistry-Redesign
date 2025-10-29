from fastapi import FastAPI
from pydantic import BaseModel
from ultralytics import YOLO
import torch, base64, io
from PIL import Image
import numpy as np
import cv2

app = FastAPI(title="YOLOv8n Detection Service")

device = "cuda" if torch.cuda.is_available() else "cpu"
model = YOLO("yolov8n.pt")  # auto-download
model.to(device)
model.fuse()  # fuse conv+bn layers for speed

class DetectReq(BaseModel):
    image_b64: str

def decode_image(b64):
    img_bytes = base64.b64decode(b64)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return np.array(img)

@app.post("/detect")
def detect(req: DetectReq):
    img = decode_image(req.image_b64)
    results = model.predict(img, imgsz=640, device=device, half=True, verbose=False)
    dets = []
    for r in results:
        for box in r.boxes:
            b = box.xyxy[0].tolist()
            dets.append({
                "label": model.names[int(box.cls[0])],
                "x1": int(b[0]), "y1": int(b[1]), "x2": int(b[2]), "y2": int(b[3]),
                "score": float(box.conf[0])
            })
    return {"bboxes": dets}
