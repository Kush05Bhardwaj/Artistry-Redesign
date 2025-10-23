from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import LlavaForConditionalGeneration, AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
import os

app = FastAPI(title="LLaVA Advice Service")

MONGO_URI = os.getenv("MONGO_URI","mongodb://root:example@mongo:27017")
db = MongoClient(MONGO_URI)["artistry"]

# Load quantized small model (fits in 4GB VRAM)
model_id = "liuhaotian/llava-v1.5-7b"  # or any small open LLaVA 7B
tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False)

# Configure 4-bit quantization
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)

model = LlavaForConditionalGeneration.from_pretrained(
    model_id,
    device_map="auto",
    dtype=torch.float16,
    quantization_config=quantization_config
)

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
