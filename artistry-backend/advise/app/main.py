from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
try:
    from transformers import LlavaForConditionalGeneration, BitsAndBytesConfig, LlamaTokenizer, AutoTokenizer, AutoModelForCausalLM
    HAS_LLAVA = True
except Exception:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    HAS_LLAVA = False
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

# Use local model path (all files including 13GB weights are here)
LOCAL_MODEL_PATH = os.path.abspath(".")
print(f"\n{'='*60}")
print(f"Loading LLaVA Model from Local Directory")
print(f"{'='*60}")
print(f"Device: {device.upper()}")
print(f"Model path: {LOCAL_MODEL_PATH}")

# Set cache directory
os.environ["HF_HOME"] = os.path.join(LOCAL_MODEL_PATH, ".cache")

# Check which format is available
has_safetensors = os.path.exists(os.path.join(LOCAL_MODEL_PATH, "model-00001-of-00002.safetensors"))
has_bin = os.path.exists(os.path.join(LOCAL_MODEL_PATH, "pytorch_model-00001-of-00002.bin"))

print(f"SafeTensors format: {'✓ Available' if has_safetensors else '✗ Not found'}")
print(f"PyTorch .bin format: {'✓ Available' if has_bin else '✗ Not found'}")

# Load tokenizer from local directory
print("Loading tokenizer...", end=" ")
try:
    if HAS_LLAVA and (os.path.exists(os.path.join(LOCAL_MODEL_PATH, "tokenizer.model")) or 
                      os.path.exists(os.path.join(LOCAL_MODEL_PATH, "tokenizer.json"))):
        # Use LlamaTokenizer with legacy=False to prefer new sentencepiece tokenizer
        tokenizer = LlamaTokenizer.from_pretrained(
            LOCAL_MODEL_PATH,
            local_files_only=True,
            legacy=False,
        )
    else:
        # Fallback: try local AutoTokenizer, otherwise use a small public model
        if os.path.exists(os.path.join(LOCAL_MODEL_PATH, "tokenizer.json")) or os.path.exists(os.path.join(LOCAL_MODEL_PATH, "tokenizer.model")):
            tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_PATH, local_files_only=True)
        else:
            tokenizer = AutoTokenizer.from_pretrained("gpt2")
except Exception as e:
    print(f"Failed to load tokenizer: {e}, using fallback gpt2 tokenizer")
    tokenizer = AutoTokenizer.from_pretrained("gpt2")
print("✓")

# Load model from local directory
# Note: For .bin files with torch < 2.6, we need to use a workaround
import torch.serialization
# Allow unsafe loading (only for local trusted files)
_old_load = torch.serialization.load
torch.serialization.load = lambda *args, **kwargs: _old_load(*args, **{**kwargs, 'weights_only': False})

try:
    # Check if model files actually exist
    model_exists = (has_safetensors or has_bin or 
                   os.path.exists(os.path.join(LOCAL_MODEL_PATH, "pytorch_model.bin")))
    
    if HAS_LLAVA and model_exists:
        if device == "cpu":
            print("Loading LLaVA model on CPU (this may take 2-3 minutes)...")
            print("Note: CPU inference will be slower than GPU")
            model = LlavaForConditionalGeneration.from_pretrained(
                LOCAL_MODEL_PATH,
                torch_dtype=torch.float32,
                low_cpu_mem_usage=True,
                local_files_only=True,
            ).to(device)
            print("✓ Model loaded successfully on CPU")
        else:
            print("Loading LLaVA model on GPU with 4-bit quantization...")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
            )
            model = LlavaForConditionalGeneration.from_pretrained(
                LOCAL_MODEL_PATH,
                device_map="auto",
                torch_dtype=torch.float16,
                quantization_config=quantization_config,
                local_files_only=True,
            )
            print("✓ Model loaded successfully on GPU")
    else:
        # Fallback to a causal LM (local if available, otherwise gpt2)
        if not model_exists:
            print("No local model files found — loading fallback GPT-2 model from HuggingFace")
        else:
            print("LLaVA not available — loading fallback causal LM (AutoModelForCausalLM)")
        
        if os.path.exists(os.path.join(LOCAL_MODEL_PATH, "pytorch_model.bin")) or os.path.exists(os.path.join(LOCAL_MODEL_PATH, "pytorch_model-00001-of-00002.bin")):
            model = AutoModelForCausalLM.from_pretrained(LOCAL_MODEL_PATH, local_files_only=True)
        else:
            model = AutoModelForCausalLM.from_pretrained("gpt2")
        model = model.to(device)
        print("✓ Fallback model loaded")
finally:
    # Restore original torch.load
    torch.serialization.load = _old_load

print(f"{'='*60}\n")

embedder = SentenceTransformer("all-MiniLM-L6-v2")

@app.get("/")
def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Advise (GPT-2)", "device": device}

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

