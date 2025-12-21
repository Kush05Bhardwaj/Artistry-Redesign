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
# MongoDB is optional - only needed for full workflow persistence
MONGO_URI = os.getenv("MONGO_URI", None)
MONGO_DB = os.getenv("MONGO_DB", "artistry")
# Development: Use localhost URLs with correct ports
DETECT_URL = os.getenv("DETECT_URL", "http://localhost:8001/detect/")
SEGMENT_URL = os.getenv("SEGMENT_URL", "http://localhost:8002/segment/")
ADVISE_URL = os.getenv("ADVISE_URL", "http://localhost:8003/advise/")
GENERATE_URL = os.getenv("GENERATE_URL", "http://localhost:8004/generate/")
COMMERCE_URL = os.getenv("COMMERCE_URL", "http://localhost:8005")

app = FastAPI(title="Artistry Gateway")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection (optional)
mongo = None
if MONGO_URI:
    try:
        mongo = AsyncIOMotorClient(MONGO_URI)[MONGO_DB]
        print("✓ MongoDB connected")
    except Exception as e:
        print(f"⚠ MongoDB not available: {e}")
        print("  Gateway will work without persistence")
else:
    print("⚠ MongoDB not configured - running without persistence")

client_timeout = httpx.Timeout(120.0, connect=10.0)

@app.get("/")
def root():
    """Root endpoint"""
    return {"status": "ok", "service": "Gateway"}

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "Gateway"}

class CreateRoomReq(BaseModel):
    image_b64: str
    prompt: str | None = ""
    options: dict | None = {}

# ============================================
# USER INTERACTION LAYER (Phase 2)
# ============================================

class UserPreferences(BaseModel):
    budget_range: str  # "low" | "medium" | "high"
    design_tips: str  # Free-text user input
    item_replacement: list[str]  # Items user wants to replace
    session_id: str | None = None

@app.post("/api/collect-preferences")
async def collect_preferences(prefs: UserPreferences):
    """
    User Interaction Layer
    Collects budget, design preferences, and item selections
    Stores in MongoDB session for later use
    """
    session_id = prefs.session_id or str(uuid.uuid4())
    
    # Store preferences in MongoDB if available
    if mongo:
        await mongo.sessions.update_one(
            {"_id": session_id},
            {"$set": {
                "budget_range": prefs.budget_range,
                "design_tips": prefs.design_tips,
                "item_replacement": prefs.item_replacement,
                "created_at": asyncio.get_event_loop().time()
            }},
            upsert=True
        )
    
    return {
        "session_id": session_id,
        "preferences_saved": True,
        "budget": prefs.budget_range,
        "items_selected": prefs.item_replacement,
        "design_tips": prefs.design_tips
    }

@app.get("/api/preferences/{session_id}")
async def get_preferences(session_id: str):
    """Retrieve stored user preferences"""
    if not mongo:
        raise HTTPException(status_code=503, detail="MongoDB not configured")
    
    session = await mongo.sessions.find_one({"_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "budget_range": session.get("budget_range", "medium"),
        "design_tips": session.get("design_tips", ""),
        "item_replacement": session.get("item_replacement", [])
    }

# ============================================
# ENHANCED WORKFLOW ORCHESTRATION (Phase 2)
# ============================================

class EnhancedWorkflowRequest(BaseModel):
    image_b64: str
    session_id: str  # Link to user preferences
    base_prompt: str | None = "Modern interior design"

@app.post("/workflow/enhanced")
async def enhanced_workflow(req: EnhancedWorkflowRequest):
    """
    Enhanced Workflow Orchestration
    Pipeline: preferences → analyze conditions → reason upgrades → budget refine → generate → analyze output
    """
    try:
        # Step 0: Retrieve user preferences
        if mongo:
            session = await mongo.sessions.find_one({"_id": req.session_id})
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            
            budget = session.get("budget_range", "medium")
            design_tips = session.get("design_tips", "")
            user_item_selection = session.get("item_replacement", [])
        else:
            # Fallback if no MongoDB
            budget = "medium"
            design_tips = req.base_prompt
            user_item_selection = []
        
        # Step 1: Detect objects
        detect_resp = await call_service(
            f"{DETECT_URL}detect/",
            {"image_b64": req.image_b64}
        )
        objects_detected = detect_resp.get("objects", [])
        bboxes = detect_resp.get("bboxes", [])
        
        # Step 2: Segment objects
        segment_resp = await call_service(
            f"{SEGMENT_URL}segment/",
            {"image_b64": req.image_b64, "bboxes": bboxes}
        )
        masks = segment_resp.get("masks", {})
        
        # Step 3: Analyze item conditions (NEW)
        condition_resp = await call_service(
            f"{ADVISE_URL}/condition/detect",
            {
                "image_b64": req.image_b64,
                "objects_detected": objects_detected
            }
        )
        condition_estimates = condition_resp.get("condition_estimates", {})
        
        # Step 4: Reason about upgrades (NEW)
        upgrade_resp = await call_service(
            f"{ADVISE_URL}/advise/reason-upgrades",
            {
                "item_conditions": condition_estimates,
                "user_selection": user_item_selection,
                "budget": budget
            }
        )
        replace_items = upgrade_resp.get("replace", [])
        keep_items = upgrade_resp.get("keep", [])
        
        # Step 5: Generate base design plan
        base_design = {
            "design_style": "Modern Minimalist",
            "color_palette": {
                "walls": "warm beige",
                "accent": "soft grey",
                "textiles": "off-white"
            },
            "materials": {
                item: "standard material" for item in replace_items
            }
        }
        
        # Step 6: Refine design with budget constraints (NEW)
        budget_refine_resp = await call_service(
            f"{ADVISE_URL}/advise/refine-budget",
            {
                "base_design": base_design,
                "budget": budget,
                "item_selection": replace_items
            }
        )
        material_specs = budget_refine_resp.get("detailed_specs", [])
        
        # Convert to dict format for generation
        material_specs_dict = {
            spec["item"]: {
                "material": spec["material"],
                "finish": spec["finish"]
            }
            for spec in material_specs
        }
        
        # Step 7: Generate image with budget-aware materials (NEW)
        combined_prompt = f"{req.base_prompt}. {design_tips}"
        
        gen_resp = await call_service(
            f"{GENERATE_URL}/generate/budget-aware",
            {
                "image_b64": req.image_b64,
                "base_prompt": combined_prompt,
                "material_specs": material_specs_dict,
                "replace_items": replace_items,
                "budget": budget,
                "masks": masks,
                "mode": "balanced"
            }
        )
        generated_image = gen_resp.get("image_b64", "")
        
        # Step 8: Analyze generated output for shopping metadata (NEW)
        analysis_resp = await call_service(
            f"{GENERATE_URL}/generate/analyze-output",
            {
                "generated_image_b64": generated_image,
                "replaced_items": replace_items
            }
        )
        shopping_items = analysis_resp.get("items", [])
        
        # Store complete result
        result = {
            "generated_image": generated_image,
            "objects_detected": objects_detected,
            "condition_analysis": condition_estimates,
            "items_replaced": replace_items,
            "items_kept": keep_items,
            "budget_applied": budget,
            "materials_used": material_specs_dict,
            "shopping_metadata": shopping_items,
            "overall_style": analysis_resp.get("overall_style", "Modern"),
            "color_palette": analysis_resp.get("color_palette", [])
        }
        
        # Save to MongoDB if available
        if mongo:
            await mongo.results.insert_one({
                "_id": str(uuid.uuid4()),
                "session_id": req.session_id,
                "result": result,
                "timestamp": asyncio.get_event_loop().time()
            })
        
        return result
        
    except Exception as e:
        print(f"Error in enhanced workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Artistry Gateway", "version": "1.0"}

@app.on_event("startup")
async def startup():
    if mongo:
        try:
            await mongo.jobs.create_index("status")
            print("✓ MongoDB indexes created")
        except Exception as e:
            print(f"⚠ MongoDB index creation failed: {e}")

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
    if not mongo:
        raise HTTPException(status_code=503, detail="MongoDB not configured. Please set MONGO_URI environment variable.")
    
    job_id = str(uuid.uuid4())
    await mongo.jobs.insert_one({"_id": job_id, "status": "pending"})
    # schedule background
    background_tasks.add_task(asyncio.create_task, process_job(job_id, payload))
    return {"job_id": job_id}

@app.get("/rooms/{job_id}")
async def get_room(job_id: str):
    if not mongo:
        raise HTTPException(status_code=503, detail="MongoDB not configured")
    
    job = await mongo.jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    return {"job_id": job_id, "status": job["status"], "result": job.get("result"), "error": job.get("error")}

# ============================================
# COMMERCE SERVICE PROXY ROUTES
# ============================================

@app.post("/commerce/match-products")
async def proxy_match_products(request_data: dict):
    """Proxy to commerce service for product matching"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{COMMERCE_URL}/commerce/match-products",
                json=request_data
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Commerce service error: {str(e)}")

@app.post("/commerce/batch-match")
async def proxy_batch_match(request_data: dict):
    """Proxy to commerce service for batch product matching"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{COMMERCE_URL}/commerce/batch-match",
                json=request_data
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Commerce service error: {str(e)}")

@app.get("/commerce/products/{category}")
async def proxy_get_products(category: str, budget: str = None):
    """Proxy to commerce service for browsing products"""
    try:
        url = f"{COMMERCE_URL}/commerce/products/{category}"
        if budget:
            url += f"?budget={budget}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Commerce service error: {str(e)}")

@app.post("/commerce/generate-affiliate-links")
async def proxy_affiliate_links(request_data: dict):
    """Proxy to commerce service for affiliate link generation"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{COMMERCE_URL}/commerce/generate-affiliate-links",
                json=request_data
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Commerce service error: {str(e)}")

