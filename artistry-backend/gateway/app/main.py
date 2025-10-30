import os
import uuid
import base64
import asyncio
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import httpx
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://root:example@mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "artistry")
DETECT_URL = os.getenv("DETECT_URL", "http://detect:8000/detect")
SEGMENT_URL = os.getenv("SEGMENT_URL", "http://segment:8000/segment")
ADVISE_URL = os.getenv("ADVISE_URL", "http://advise:8000/advise")
GENERATE_URL = os.getenv("GENERATE_URL", "http://generate:8000/render")

app = FastAPI(title="Artistry Gateway (prototype)")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
mongo = AsyncIOMotorClient(MONGO_URI)[MONGO_DB]

client_timeout = httpx.Timeout(120.0, connect=10.0)

class CreateRoomReq(BaseModel):
    image_b64: str
    prompt: str | None = ""
    options: dict | None = {}

@app.on_event("startup")
async def startup():
    await mongo.jobs.create_index("status")

async def call_service(url: str, json: dict, timeout: float = 60.0):
    async with httpx.AsyncClient(timeout=client_timeout) as c:
        r = await c.post(url, json=json)
        r.raise_for_status()
        return r.json()

async def process_job(job_id: str, payload: CreateRoomReq):
    try:
        await mongo.jobs.update_one({"_id": job_id}, {"$set": {"status": "running"}})
        # 1) Detect
        detect_resp = await call_service(DETECT_URL, {"image_b64": payload.image_b64})
        bboxes = detect_resp.get("bboxes", [])
        # 2) Segment
        segment_resp = await call_service(SEGMENT_URL, {"image_b64": payload.image_b64, "bboxes": bboxes})
        masks = segment_resp.get("masks", [])
        # 3) Advise (RAG + LLaVA)
        advise_resp = await call_service(ADVISE_URL, {"masks": masks, "prompt": payload.prompt})
        # 4) Generate (Stable Diffusion + ControlNet)
        gen_resp = await call_service(GENERATE_URL, {"image_b64": payload.image_b64, "masks": masks, "prompt": payload.prompt, "options": payload.options},)
        output_url = gen_resp.get("image_url")
        # Finalize
        await mongo.jobs.update_one({"_id": job_id}, {"$set": {"status": "done", "result": {"output_url": output_url, "advise": advise_resp}}})
    except Exception as e:
        await mongo.jobs.update_one({"_id": job_id}, {"$set": {"status": "failed", "error": str(e)}})

@app.post("/rooms")
async def create_room(payload: CreateRoomReq, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    await mongo.jobs.insert_one({"_id": job_id, "status": "pending"})
    # schedule background
    background_tasks.add_task(asyncio.create_task, process_job(job_id, payload))
    return {"job_id": job_id}

@app.get("/rooms/{job_id}")
async def get_room(job_id: str):
    job = await mongo.jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    return {"job_id": job_id, "status": job["status"], "result": job.get("result"), "error": job.get("error")}
