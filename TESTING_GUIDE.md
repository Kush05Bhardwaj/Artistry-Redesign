# 🧪 Testing Guide - Enhanced Artistry AI

## Quick Health Check

### Test All Services Are Running

```bash
# Test Gateway
curl http://localhost:8000/health

# Test Detect
curl http://localhost:8001/health

# Test Segment
curl http://localhost:8002/health

# Test Advise
curl http://localhost:8003/health

# Test Generate
curl http://localhost:8004/health

# Test Commerce
curl http://localhost:8005/health
```

**Expected Response (all services):**
```json
{
  "status": "ok",
  "service": "ServiceName"
}
```

---

## Test Individual Endpoints

### 1. Test Product Catalog (Commerce)

```bash
# Get all bed products
curl http://localhost:8005/commerce/products/bed

# Get medium-budget beds
curl http://localhost:8005/commerce/products/bed?budget=medium
```

**Expected Response:**
```json
{
  "category": "bed",
  "budget": "medium",
  "products": [
    {
      "id": "bed_001",
      "name": "Modern Upholstered Platform Bed",
      "price": "$399",
      ...
    }
  ],
  "count": 1
}
```

### 2. Test Product Matching (Commerce)

```bash
curl -X POST http://localhost:8005/commerce/match-products \
  -H "Content-Type: application/json" \
  -d '{
    "item_type": "bed",
    "style": "modern",
    "material": "wood",
    "color": "beige",
    "budget": "medium"
  }'
```

**Expected Response:**
```json
{
  "matches": [
    {
      "product_id": "bed_001",
      "name": "Modern Upholstered Platform Bed",
      "vendor": "Amazon",
      "price": "$399",
      "match_score": 0.87,
      ...
    }
  ],
  "total_matches": 1
}
```

### 3. Test Preference Collection (Gateway)

```bash
curl -X POST http://localhost:8000/api/collect-preferences \
  -H "Content-Type: application/json" \
  -d '{
    "budget_range": "medium",
    "design_tips": "Modern minimalist with warm tones",
    "item_replacement": ["bed", "curtains"]
  }'
```

**Expected Response:**
```json
{
  "session_id": "uuid-here",
  "preferences_saved": true,
  "budget": "medium",
  "items_selected": ["bed", "curtains"]
}
```

---

## Test Complete Workflow (End-to-End)

### Preparation

1. **Get a test image as base64:**

```python
import base64

# Read image
with open("test_bedroom.jpg", "rb") as f:
    image_data = f.read()

# Convert to base64
image_b64 = base64.b64encode(image_data).decode()
print(image_b64)
```

### Step-by-Step Workflow Test

#### Step 1: Collect Preferences

```bash
curl -X POST http://localhost:8000/api/collect-preferences \
  -H "Content-Type: application/json" \
  -d '{
    "budget_range": "medium",
    "design_tips": "Modern minimalist",
    "item_replacement": ["bed", "curtains"]
  }' > session.json

# Extract session_id
SESSION_ID=$(cat session.json | jq -r '.session_id')
echo "Session ID: $SESSION_ID"
```

#### Step 2: Run Enhanced Workflow

**Note:** Replace `YOUR_IMAGE_BASE64` with actual base64 image data

```bash
curl -X POST http://localhost:8000/workflow/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "image_b64": "YOUR_IMAGE_BASE64",
    "session_id": "'$SESSION_ID'",
    "base_prompt": "Modern minimalist design"
  }' > result.json
```

**This will take 1-2 minutes (CPU) or 20-30 seconds (GPU)**

#### Step 3: Check Results

```bash
# View generated image metadata
cat result.json | jq '.shopping_metadata'

# View materials used
cat result.json | jq '.materials_used'

# View items replaced
cat result.json | jq '.items_replaced'
```

---

## Test Individual Intelligence Layers

### Test Condition Detection

```bash
curl -X POST http://localhost:8003/condition/detect \
  -H "Content-Type: application/json" \
  -d '{
    "image_b64": "YOUR_IMAGE_BASE64",
    "objects_detected": ["bed", "chair", "curtains"]
  }'
```

**Expected Response:**
```json
{
  "condition_estimates": {
    "bed": "old",
    "chair": "acceptable",
    "curtains": "old"
  },
  "detailed_conditions": [
    {
      "item": "bed",
      "condition": "old",
      "reasoning": "Shows signs of wear or outdated style",
      "confidence": 0.75
    },
    ...
  ]
}
```

### Test Budget Refinement

```bash
curl -X POST http://localhost:8003/advise/refine-budget \
  -H "Content-Type: application/json" \
  -d '{
    "base_design": {
      "design_style": "Modern Minimalist",
      "color_palette": {"walls": "beige"}
    },
    "budget": "medium",
    "item_selection": ["bed", "curtains"]
  }'
```

**Expected Response:**
```json
{
  "budget_tier": "medium",
  "materials": {
    "bed": "engineered wood with quality upholstered headboard",
    "curtains": "poly-linen blend"
  },
  "detailed_specs": [
    {
      "item": "bed",
      "material": "engineered wood with quality upholstered headboard",
      "finish": "fabric upholstery with wooden accents",
      "quality_tier": "mid-range",
      "estimated_cost": "$400-$800"
    },
    ...
  ]
}
```

### Test Upgrade Reasoning

```bash
curl -X POST http://localhost:8003/advise/reason-upgrades \
  -H "Content-Type: application/json" \
  -d '{
    "item_conditions": {
      "bed": "old",
      "curtains": "old",
      "chair": "acceptable"
    },
    "user_selection": ["bed", "curtains"],
    "budget": "medium"
  }'
```

**Expected Response:**
```json
{
  "replace": ["bed", "curtains"],
  "keep": ["chair"],
  "reasoning": {
    "bed": "Item is in poor condition and user requested replacement. High priority for medium budget.",
    "curtains": "Item is in poor condition and user requested replacement. High priority for medium budget.",
    "chair": "Item in acceptable condition and user chose to keep."
  },
  "detailed_decisions": [...]
}
```

---

## Frontend Testing

### Manual UI Testing Checklist

#### Upload Phase
- [ ] Click "Choose Image" button
- [ ] Select a bedroom/living room image
- [ ] Image displays correctly
- [ ] Phase indicator shows "Upload" as active
- [ ] Automatically advances to "Preferences" phase

#### Preferences Phase
- [ ] Budget selector shows 3 options (Low/Medium/High)
- [ ] Budget selection highlights correctly
- [ ] Design tips input accepts text
- [ ] Detected objects display as checkboxes
- [ ] Items can be checked/unchecked
- [ ] Condition hints display (if "old" items detected)
- [ ] "Generate Design" button is disabled if no items selected
- [ ] "Generate Design" button shows correct item count

#### Processing Phase
- [ ] Loading spinner displays
- [ ] Progress messages show
- [ ] Phase indicator shows "Processing" as active
- [ ] No errors in browser console

#### Results Phase
- [ ] Before/After images display side-by-side
- [ ] Budget tier displays correctly
- [ ] Overall style displays
- [ ] Items replaced list is correct
- [ ] Material details show for each item
- [ ] Shopping recommendations display
- [ ] Product cards show:
  - [ ] Product image
  - [ ] Product name
  - [ ] Vendor
  - [ ] Price
  - [ ] Match score
  - [ ] "Shop Now" button
- [ ] "Shop Now" opens product URL in new tab
- [ ] "Start New Design" button resets workflow

---

## Performance Testing

### Measure Inference Times

Create a test script: `test_performance.py`

```python
import time
import requests
import base64

API_BASE = "http://localhost:8000"

# Load test image
with open("test_bedroom.jpg", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

# 1. Collect preferences
start = time.time()
prefs_resp = requests.post(f"{API_BASE}/api/collect-preferences", json={
    "budget_range": "medium",
    "design_tips": "Modern minimalist",
    "item_replacement": ["bed", "curtains"]
})
session_id = prefs_resp.json()["session_id"]
print(f"Preferences: {time.time() - start:.2f}s")

# 2. Run workflow
start = time.time()
workflow_resp = requests.post(f"{API_BASE}/workflow/enhanced", json={
    "image_b64": image_b64,
    "session_id": session_id,
    "base_prompt": "Modern minimalist design"
})
print(f"Complete Workflow: {time.time() - start:.2f}s")

# 3. Check results
result = workflow_resp.json()
print(f"\nResults:")
print(f"- Objects detected: {result.get('objects_detected', [])}")
print(f"- Items replaced: {result.get('items_replaced', [])}")
print(f"- Shopping items: {len(result.get('shopping_metadata', []))}")
```

**Run:**
```bash
python test_performance.py
```

**Expected Times (CPU):**
- Preferences: <1s
- Complete Workflow: 90-120s

**Expected Times (GPU):**
- Preferences: <1s
- Complete Workflow: 20-30s

---

## Error Testing

### Test Invalid Inputs

#### 1. Empty Budget
```bash
curl -X POST http://localhost:8000/api/collect-preferences \
  -H "Content-Type: application/json" \
  -d '{
    "budget_range": "",
    "design_tips": "Modern",
    "item_replacement": ["bed"]
  }'
```

**Expected:** Validation error or default to "medium"

#### 2. No Items Selected
```bash
curl -X POST http://localhost:8000/workflow/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "image_b64": "valid_base64",
    "session_id": "invalid-session-id",
    "base_prompt": "Modern"
  }'
```

**Expected:** 404 Session not found

#### 3. Invalid Image
```bash
curl -X POST http://localhost:8001/detect/ \
  -H "Content-Type: application/json" \
  -d '{
    "image_b64": "not-valid-base64"
  }'
```

**Expected:** Decode error or 400 Bad Request

---

## Load Testing (Optional)

### Simple Load Test with Apache Bench

```bash
# Test Gateway health endpoint
ab -n 100 -c 10 http://localhost:8000/health

# Test Commerce product browsing
ab -n 100 -c 10 http://localhost:8005/commerce/products/bed
```

**Expected:**
- All requests successful
- Average response time <100ms for health checks
- No 500 errors

---

## Database Testing (MongoDB)

### Check Session Storage

```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017"

# Use artistry database
use artistry

# Check sessions
db.sessions.find().pretty()

# Check results
db.results.find().pretty()

# Count sessions
db.sessions.count()
```

---

## Debugging Tips

### Enable Verbose Logging

Add to service main.py:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Docker Logs

```bash
# Gateway logs
docker logs artistry-gateway -f

# Advise logs (for LLaVA debugging)
docker logs artistry-advise -f

# Generate logs (for SD debugging)
docker logs artistry-generate -f
```

### Frontend Browser Console

Open DevTools (F12) and check:
- Network tab for API calls
- Console for errors
- Application > Local Storage for session data

---

## Success Criteria

### All Tests Pass When:
- ✅ All 6 services respond to `/health`
- ✅ Product catalog returns 8+ products
- ✅ Product matching returns relevant results
- ✅ Preferences save to MongoDB
- ✅ Complete workflow executes without errors
- ✅ Generated image is valid base64
- ✅ Shopping metadata is extracted
- ✅ Frontend displays all results correctly
- ✅ "Shop Now" links work
- ✅ Material details match budget tier

---

## Common Issues & Solutions

### Issue: Services timeout
**Solution:** Increase timeout in gateway (default: 120s)

### Issue: MongoDB connection fails
**Solution:** Check MONGO_URI env variable, ensure MongoDB is running

### Issue: Model download fails
**Solution:** Ensure 20GB+ free disk space, stable internet

### Issue: Out of memory
**Solution:** Close other apps, reduce batch size, use CPU mode

### Issue: CORS errors in frontend
**Solution:** Check backend CORS settings, verify frontend origin

---

## Test Reports

Document your test results:

```markdown
## Test Report - [Date]

### Environment
- OS: Windows/Linux/Mac
- CPU/GPU: [specs]
- RAM: [amount]
- Python: [version]
- Node: [version]

### Results
- [ ] All services healthy
- [ ] Product matching working
- [ ] Workflow execution: [time]
- [ ] Frontend functional
- [ ] Shopping links work

### Issues Found
1. [Issue description]
2. [Issue description]

### Performance
- Detection: [time]
- Condition Analysis: [time]
- Generation: [time]
- Total Workflow: [time]
```

---

**Happy Testing! 🧪✅**
