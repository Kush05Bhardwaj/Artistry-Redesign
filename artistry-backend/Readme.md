# Artistry Backend Prototype

## Prereqs
- Docker & Docker Compose
- (Optional) GPU drivers if you plan to load heavy models

## Run locally
1. Copy `.env.example` -> `.env` and adjust any values (e.g., S3 or Mongo URI if using Atlas)
2. Build & run:

3. Gateway available: http://localhost:8000
- POST `http://localhost:8000/rooms` with JSON:
  ```json
  {
    "image_b64": "<base64 image>",
    "prompt": "Make the living room cozier",
    "options": {}
  }
  ```
- GET `http://localhost:8000/rooms/{job_id}` to poll status.

## How to integrate real models
- detect: replace stub with `ultralytics` YOLOv8n inference.
- segment: add MobileSAM/EfficientViT-SAM model code and return masks as base64 PNGs.
- advise: plug in vector search (MongoDB Atlas Vector Search or local FAISS), and a quantized LLaVA / local LLM.
- generate: use `diffusers` + ControlNet with `stable-fast` or ONNX/Trton for optimized inference on GPU.

