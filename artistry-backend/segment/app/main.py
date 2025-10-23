from fastapi import FastAPI
from pydantic import BaseModel
import torch, base64, io, numpy as np
from PIL import Image
import os
import sys
sys.path.append(r'F:\Projects\Artistry-V2\artistry-backend\segment\MobileSAM')
from mobile_sam import sam_model_registry, SamPredictor


app = FastAPI(title="MobileSAM Service")

device = "cuda" if torch.cuda.is_available() else "cpu"
model_type = "vit_t"  # tiny variant for MobileSAM
sam_checkpoint = os.path.abspath(r"F:\Projects\Artistry-V2\artistry-backend\segment\MobileSAM/weights/mobile_sam.pt")
sam = sam_model_registry[model_type](checkpoint=sam_checkpoint).to(device)
predictor = SamPredictor(sam)

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
