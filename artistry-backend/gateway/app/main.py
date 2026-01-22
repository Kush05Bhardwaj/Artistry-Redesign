import os
import uuid
import base64
import asyncio
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional
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

# ============================================
# DESIGN SAVE ENDPOINT
# ============================================

class SaveDesignRequest(BaseModel):
    originalImage: str | None = None
    detectedObjects: list[str] | None = None
    segmentedImage: str | None = None
    advice: list[str] | None = None
    generatedImage: str | None = None
    prompt: str | None = None
    timestamp: str | None = None

@app.post("/api/designs")
async def save_design(design: SaveDesignRequest):
    """Save design results to MongoDB (optional)"""
    if not mongo:
        # If MongoDB not configured, just return success without saving
        return {
            "status": "ok",
            "message": "Design received (MongoDB not configured, not persisted)",
            "id": str(uuid.uuid4())
        }
    
    try:
        design_id = str(uuid.uuid4())
        await mongo.designs.insert_one({
            "_id": design_id,
            "original_image": design.originalImage,
            "detected_objects": design.detectedObjects,
            "segmented_image": design.segmentedImage,
            "advice": design.advice,
            "generated_image": design.generatedImage,
            "prompt": design.prompt,
            "timestamp": design.timestamp,
            "created_at": asyncio.get_event_loop().time()
        })
        return {
            "status": "ok",
            "message": "Design saved successfully",
            "id": design_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save design: {str(e)}")

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


# ============================================
# USER AUTHENTICATION (MVP - High Priority)
# ============================================

class UserSignup(BaseModel):
    email: str
    password: str
    name: str

class LoginCredentials(BaseModel):
    email: str
    password: str

class AuthToken(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    name: str

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Generate secure random token"""
    return secrets.token_urlsafe(32)

@app.post("/auth/signup")
async def signup(user: UserSignup):
    """
    User Registration
    Creates new user account with email and password
    """
    if not mongo:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    # Check if email already exists
    existing_user = await mongo.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = hash_password(user.password)
    
    # Create user document
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "email": user.email,
        "name": user.name,
        "password_hash": password_hash,
        "created_at": datetime.utcnow(),
        "designs_count": 0
    }
    
    await mongo.users.insert_one(user_doc)
    
    # Generate access token
    access_token = generate_token()
    
    # Store token in database
    await mongo.tokens.insert_one({
        "token": access_token,
        "user_id": user_id,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=30)
    })
    
    return AuthToken(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id,
        email=user.email,
        name=user.name
    )

@app.post("/auth/login")
async def login(credentials: LoginCredentials):
    """
    User Login
    Authenticate user and return access token
    """
    if not mongo:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    # Find user by email
    user = await mongo.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    password_hash = hash_password(credentials.password)
    if password_hash != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate new access token
    access_token = generate_token()
    
    # Store token in database
    await mongo.tokens.insert_one({
        "token": access_token,
        "user_id": user["_id"],
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=30)
    })
    
    return AuthToken(
        access_token=access_token,
        token_type="bearer",
        user_id=user["_id"],
        email=user["email"],
        name=user["name"]
    )

@app.get("/auth/verify")
async def verify_token(token: str):
    """
    Verify if access token is valid
    """
    if not mongo:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    # Find token in database
    token_doc = await mongo.tokens.find_one({"token": token})
    if not token_doc:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Check if token is expired
    if token_doc["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Token expired")
    
    # Get user info
    user = await mongo.users.find_one({"_id": token_doc["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "valid": True,
        "user_id": user["_id"],
        "email": user["email"],
        "name": user["name"]
    }


# ============================================
# SAVE & SHARE DESIGNS (MVP - High Priority)
# ============================================

class SaveDesignRequest(BaseModel):
    user_id: str
    original_image_b64: str
    generated_image_b64: str
    detected_objects: list
    budget: str
    design_tips: str
    total_cost_inr: int
    metadata: dict = {}

class ShareDesignRequest(BaseModel):
    design_id: str
    platform: str  # "whatsapp" | "facebook" | "link"

@app.post("/designs/save")
async def save_design(design: SaveDesignRequest):
    """
    Save design to user's history
    Stores original image, generated image, and metadata
    """
    if not mongo:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    # Verify user exists
    user = await mongo.users.find_one({"_id": design.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create design document
    design_id = str(uuid.uuid4())
    design_doc = {
        "_id": design_id,
        "user_id": design.user_id,
        "original_image_b64": design.original_image_b64,
        "generated_image_b64": design.generated_image_b64,
        "detected_objects": design.detected_objects,
        "budget": design.budget,
        "design_tips": design.design_tips,
        "total_cost_inr": design.total_cost_inr,
        "metadata": design.metadata,
        "created_at": datetime.utcnow(),
        "views": 0,
        "shares": 0
    }
    
    await mongo.designs.insert_one(design_doc)
    
    # Update user's design count
    await mongo.users.update_one(
        {"_id": design.user_id},
        {"$inc": {"designs_count": 1}}
    )
    
    return {
        "design_id": design_id,
        "message": "Design saved successfully",
        "shareable_link": f"https://artistry.ai/designs/{design_id}"  # TODO: Update with actual domain
    }

@app.get("/designs/user/{user_id}")
async def get_user_designs(user_id: str, limit: int = 10, skip: int = 0):
    """
    Retrieve all designs for a user
    Supports pagination
    """
    if not mongo:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    # Get designs from database
    cursor = mongo.designs.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    designs = await cursor.to_list(length=limit)
    
    # Get total count
    total_count = await mongo.designs.count_documents({"user_id": user_id})
    
    return {
        "designs": designs,
        "total_count": total_count,
        "page": skip // limit + 1,
        "page_size": limit
    }

@app.get("/designs/share/{design_id}")
async def get_shareable_design(design_id: str):
    """
    Get public shareable version of design
    Increments view count
    """
    if not mongo:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    # Find design
    design = await mongo.designs.find_one({"_id": design_id})
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Increment view count
    await mongo.designs.update_one(
        {"_id": design_id},
        {"$inc": {"views": 1}}
    )
    
    # Get user info (without sensitive data)
    user = await mongo.users.find_one({"_id": design["user_id"]}, {"password_hash": 0})
    
    return {
        "design_id": design_id,
        "generated_image": design["generated_image_b64"],
        "original_image": design["original_image_b64"],
        "budget": design["budget"],
        "design_tips": design["design_tips"],
        "total_cost_inr": design["total_cost_inr"],
        "created_at": design["created_at"],
        "created_by": user["name"] if user else "Anonymous",
        "views": design["views"],
        "shares": design["shares"]
    }

@app.post("/designs/share")
async def share_design(req: ShareDesignRequest):
    """
    Generate shareable link for design
    Track shares for analytics
    """
    if not mongo:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    # Find design
    design = await mongo.designs.find_one({"_id": req.design_id})
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Increment share count
    await mongo.designs.update_one(
        {"_id": req.design_id},
        {"$inc": {"shares": 1}}
    )
    
    # Generate platform-specific share links
    base_url = f"https://artistry.ai/designs/{req.design_id}"  # TODO: Update with actual domain
    
    share_links = {
        "link": base_url,
        "whatsapp": f"https://wa.me/?text=Check%20out%20my%20room%20redesign!%20{base_url}",
        "facebook": f"https://www.facebook.com/sharer/sharer.php?u={base_url}",
        "twitter": f"https://twitter.com/intent/tweet?url={base_url}&text=Check%20out%20my%20AI%20room%20redesign!",
        "pinterest": f"https://pinterest.com/pin/create/button/?url={base_url}",
        "linkedin": f"https://www.linkedin.com/sharing/share-offsite/?url={base_url}"
    }
    
    return {
        "design_id": req.design_id,
        "platform": req.platform,
        "share_url": share_links.get(req.platform, base_url),
        "all_share_options": share_links
    }

@app.delete("/designs/{design_id}")
async def delete_design(design_id: str, user_id: str):
    """
    Delete a design (user must own the design)
    """
    if not mongo:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    # Find design and verify ownership
    design = await mongo.designs.find_one({"_id": design_id})
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    if design["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this design")
    
    # Delete design
    await mongo.designs.delete_one({"_id": design_id})
    
    # Update user's design count
    await mongo.users.update_one(
        {"_id": user_id},
        {"$inc": {"designs_count": -1}}
    )
    
    return {"message": "Design deleted successfully"}


