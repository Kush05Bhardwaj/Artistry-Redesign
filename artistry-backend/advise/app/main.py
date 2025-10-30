from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import LlavaForConditionalGeneration, AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
import os
import base64
import io
from PIL import Image

app = FastAPI(title="LLaVA Advice Service")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI","mongodb://root:example@mongo:27017")
db = MongoClient(MONGO_URI)["artistry"]

# Detect device
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load quantized small model (fits in 4GB VRAM)
model_id = "liuhaotian/llava-v1.5-7b"  # or any small open LLaVA 7B
tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False)

# Only use quantization on CUDA (4-bit quantization doesn't work on CPU)
if device == "cuda":
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    )
    model = LlavaForConditionalGeneration.from_pretrained(
        model_id,
        device_map="auto",
        torch_dtype=torch.float16,
        quantization_config=quantization_config
    )
else:
    # CPU mode: use float32, no quantization
    model = LlavaForConditionalGeneration.from_pretrained(
        model_id,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True
    ).to(device)

embedder = SentenceTransformer("all-MiniLM-L6-v2")

class AdviseReq(BaseModel):
    prompt: str
    masks: list | None = []

@app.post("/advise")
def advise(req: AdviseReq):
    # Retrieve top context docs (simple cosine sim)
    query_emb = embedder.encode(req.prompt)
    docs = list(db.knowledge_base.find().limit(3))
    context = " ".join([d.get("text","") for d in docs])
    input_text = f"User request: {req.prompt}\nContext:\n{context}\nSuggestion:"
    inputs = tokenizer(input_text, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=100, do_sample=True, temperature=0.7)
    suggestion = tokenizer.decode(output[0], skip_special_tokens=True)
    return {"advice": suggestion}

@app.post("/advise/")
async def advise_file(file: UploadFile = File(...), prompt: str = "Analyze this room and provide interior design recommendations"):
    """File upload endpoint for frontend integration"""
    # Read and process image
    file_bytes = await file.read()
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    
    # For now, use text-only model (LLaVA vision features require proper setup)
    # Generate advice based on prompt and general interior design knowledge
    input_text = f"Interior Design Task: {prompt}\nProvide 5-7 specific design recommendations:"
    inputs = tokenizer(input_text, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=200, do_sample=True, temperature=0.7)
    advice_text = tokenizer.decode(output[0], skip_special_tokens=True)
    
    # Clean up the output
    advice_text = advice_text.replace(input_text, "").strip()
    
    return {
        "advice": advice_text,
        "prompt": prompt,
        "response": advice_text
    }

