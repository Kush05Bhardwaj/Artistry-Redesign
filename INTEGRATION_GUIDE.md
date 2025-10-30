# 🚀 Frontend-Backend Integration Guide

**Last Updated:** October 30, 2025
**Status:** Backend CORS enabled, API layer created, ready for frontend integration

---

## ✅ COMPLETED STEPS

### 1. Frontend Structure Cleanup
- ✅ Removed Next.js files (app/ folder and next.config.ts)
- ✅ Kept Vite/React structure (src/ folder)
- ✅ Single framework for simpler development

### 2. Environment Configuration
- ✅ Created `frontend/.env` with all API URLs
  ```env
  VITE_API_GATEWAY=http://localhost:8000
  VITE_DETECT_API=http://localhost:8001
  VITE_SEGMENT_API=http://localhost:8002
  VITE_ADVISE_API=http://localhost:8003
  VITE_GENERATE_API=http://localhost:8004
  ```

### 3. API Service Layer
- ✅ Created `frontend/src/services/api.js`
- ✅ Functions for all services: detectObjects(), segmentImage(), getDesignAdvice(), generateDesign()
- ✅ Error handling, progress callbacks, health checks
- ✅ Full workflow orchestration function

### 4. Backend CORS Configuration
- ✅ Added CORS middleware to all 5 services
- ✅ Allows requests from http://localhost:5173 (Vite dev server)
- ✅ Added file upload endpoints to all services:
  - `POST /detect/` - Multipart file upload for detection
  - `POST /segment/` - Multipart file upload for segmentation
  - `POST /advise/` - Multipart file upload for advice
  - `POST /generate/` - Multipart file upload for generation

---

## 📋 NEXT STEPS

### Step 1: Restart Backend Services with CORS

All backend services have been updated with CORS. You need to restart them:

**Stop all running services** (close the 5 PowerShell windows)

**Start all services again:**
```powershell
cd F:\Projects\Artistry-V2\artistry-backend

# Activate venv
.\venv\Scripts\Activate.ps1

# Start each service in separate windows
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\gateway\app'; python -m uvicorn main:app --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\detect\app'; python -m uvicorn main:app --host 0.0.0.0 --port 8001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\segment\app'; python -m uvicorn main:app --host 0.0.0.0 --port 8002"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\advise\app'; python -m uvicorn main:app --host 0.0.0.0 --port 8003"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\generate\app'; python -m uvicorn main:app --host 0.0.0.0 --port 8004"
```

### Step 2: Test Backend Services

Test each service accepts file uploads:

```powershell
# Test Detect service
$file = Get-Item "path\to\test\image.jpg"
$form = @{file = $file}
Invoke-RestMethod -Uri "http://localhost:8001/detect/" -Method Post -Form $form

# Test Segment service
Invoke-RestMethod -Uri "http://localhost:8002/segment/" -Method Post -Form $form

# Test Advise service
Invoke-RestMethod -Uri "http://localhost:8003/advise/" -Method Post -Form $form -Body @{prompt="Give design advice"}

# Test Generate service
Invoke-RestMethod -Uri "http://localhost:8004/generate/" -Method Post -Form $form -Body @{prompt="Modern design"}
```

### Step 3: Start Frontend Dev Server

```powershell
cd F:\Projects\Artistry-V2\frontend
npm install  # If needed
npm run dev
```

Frontend will start on http://localhost:5173

### Step 4: Update Frontend Pages

Update each page to use the API service layer. Here's the pattern for each page:

---

## 🎯 PAGE UPDATE INSTRUCTIONS

### Detect.jsx - Object Detection

**Import the API function:**
```javascript
import { detectObjects } from "../services/api"
```

**Add state for file object:**
```javascript
const [imageFile, setImageFile] = useState(null)
const [error, setError] = useState(null)
const [annotatedImage, setAnnotatedImage] = useState(null)
```

**Update file upload handler:**
```javascript
const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    setImageFile(file) // Store File object
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result) // Preview
    }
    reader.readAsDataURL(file)
    
    // Reset results
    setDetectedObjects([])
    setAnnotatedImage(null)
    setError(null)
  }
}
```

**Replace mock detect function:**
```javascript
const handleDetect = async () => {
  if (!imageFile) {
    setError("Please upload an image first")
    return
  }
  
  setIsProcessing(true)
  setError(null)
  
  try {
    const result = await detectObjects(imageFile)
    setDetectedObjects(result.objects || [])
    setAnnotatedImage(result.annotatedImage)
  } catch (err) {
    setError(err.message)
    console.error("Detection error:", err)
  } finally {
    setIsProcessing(false)
  }
}
```

**Update UI to show annotated image:**
```javascript
<img 
  src={annotatedImage || uploadedImage} 
  alt="Room with detections" 
  className="w-full rounded-lg mb-4 max-h-96 object-cover" 
/>
```

---

### Segment.jsx - Image Segmentation

**Import API function:**
```javascript
import { segmentImage } from "../services/api"
```

**Add state:**
```javascript
const [imageFile, setImageFile] = useState(null)
const [error, setError] = useState(null)
```

**Update file handler:**
```javascript
const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => setUploadedImage(event.target?.result)
    reader.readAsDataURL(file)
    setSegmentedImage(null)
    setError(null)
  }
}
```

**Replace mock segment function:**
```javascript
const handleSegment = async () => {
  if (!imageFile) {
    setError("Please upload an image first")
    return
  }
  
  setIsProcessing(true)
  setError(null)
  
  try {
    const result = await segmentImage(imageFile, 10)
    setSegmentedImage(result.segmentedImage)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsProcessing(false)
  }
}
```

---

### Advise.jsx - Design Advice

**Import API function:**
```javascript
import { getDesignAdvice } from "../services/api"
```

**Add state:**
```javascript
const [imageFile, setImageFile] = useState(null)
const [error, setError] = useState(null)
```

**Update file handler:**
```javascript
const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => setUploadedImage(event.target?.result)
    reader.readAsDataURL(file)
    setAdvice([])
    setError(null)
  }
}
```

**Replace mock advise function:**
```javascript
const handleGetAdvice = async () => {
  if (!imageFile) {
    setError("Please upload an image first")
    return
  }
  
  setIsProcessing(true)
  setError(null)
  
  try {
    const result = await getDesignAdvice(imageFile)
    setAdvice(result.advice)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsProcessing(false)
  }
}
```

---

### Generate.jsx - Image Generation

**Import API function:**
```javascript
import { generateDesign } from "../services/api"
```

**Add state:**
```javascript
const [imageFile, setImageFile] = useState(null)
const [error, setError] = useState(null)
const [prompt, setPrompt] = useState("Modern minimalist interior design")
```

**Update file handler:**
```javascript
const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => setUploadedImage(event.target?.result)
    reader.readAsDataURL(file)
    setGeneratedImage(null)
    setError(null)
  }
}
```

**Replace mock generate function:**
```javascript
const handleGenerate = async () => {
  if (!imageFile) {
    setError("Please upload an image first")
    return
  }
  
  setIsProcessing(true)
  setError(null)
  
  try {
    const result = await generateDesign(imageFile, prompt, {
      numInferenceSteps: 20,
      guidanceScale: 7.5
    })
    setGeneratedImage(result.generatedImage)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsProcessing(false)
  }
}
```

**Add prompt input field:**
```javascript
<input
  type="text"
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  placeholder="Describe the design style..."
  className="w-full px-4 py-2 border rounded-lg mb-4"
/>
```

---

### AIDesign.jsx - Full Workflow

**Import API function:**
```javascript
import { runFullWorkflow } from "../services/api"
```

**Add state:**
```javascript
const [imageFile, setImageFile] = useState(null)
const [error, setError] = useState(null)
const [progress, setProgress] = useState(0)
const [progressMessage, setProgressMessage] = useState("")
const [results, setResults] = useState(null)
const [prompt, setPrompt] = useState("Modern minimalist interior design")
```

**Replace mock workflow:**
```javascript
const handleFullWorkflow = async () => {
  if (!imageFile) {
    setError("Please upload an image first")
    return
  }
  
  setIsLoading(true)
  setError(null)
  setResults(null)
  
  try {
    const workflowResults = await runFullWorkflow(
      imageFile,
      prompt,
      (message, percent) => {
        setProgressMessage(message)
        setProgress(percent)
      }
    )
    
    setResults(workflowResults)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
    setProgress(0)
  }
}
```

**Show results:**
```javascript
{results && (
  <div className="space-y-4">
    <h3>Detected Objects:</h3>
    <p>{results.detection.objects.join(", ")}</p>
    
    <h3>Segmented Image:</h3>
    <img src={results.segmentation.segmentedImage} alt="Segmented" />
    
    <h3>Design Advice:</h3>
    <ul>
      {results.advice.advice.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
    
    <h3>Generated Design:</h3>
    <img src={results.generation.generatedImage} alt="Generated" />
  </div>
)}
```

---

## 🧪 TESTING CHECKLIST

### Backend Health Check
- [ ] Gateway (8000) responds: http://localhost:8000/docs
- [ ] Detect (8001) responds: http://localhost:8001/docs
- [ ] Segment (8002) responds: http://localhost:8002/docs
- [ ] Advise (8003) responds: http://localhost:8003/docs
- [ ] Generate (8004) responds: http://localhost:8004/docs

### Frontend Integration
- [ ] Environment variables load (`import.meta.env.VITE_DETECT_API` works)
- [ ] API service can be imported
- [ ] Detect page uploads image and shows results
- [ ] Segment page uploads image and shows segmentation
- [ ] Advise page uploads image and shows recommendations
- [ ] Generate page uploads image and creates new design
- [ ] AIDesign page runs full workflow

### Error Handling
- [ ] Shows error messages for failed API calls
- [ ] Shows loading states during processing
- [ ] Can retry after errors
- [ ] Can upload new images

---

## 🐛 TROUBLESHOOTING

### CORS Errors
**Symptom:** "Access to fetch at 'http://localhost:8001/detect/' from origin 'http://localhost:5173' has been blocked by CORS policy"

**Solution:** Restart backend services (they now have CORS enabled)

### Module Not Found
**Symptom:** "Cannot find module '../services/api'"

**Solution:** Check `frontend/src/services/api.js` exists

### 404 Errors
**Symptom:** "POST http://localhost:8001/detect/ 404 (Not Found)"

**Solution:** Backend service not running or wrong endpoint. Check service is running and endpoint is `/detect/` with trailing slash

### Environment Variables Not Loading
**Symptom:** API URLs are undefined

**Solution:** 
1. Check `frontend/.env` exists
2. Restart Vite dev server (env vars loaded at startup)
3. Use `import.meta.env.VITE_*` not `process.env.*`

### Large Response Times
**Symptom:** Generate service takes 30-60 seconds

**Solution:** This is normal for Stable Diffusion. Show proper loading UI with progress indicators.

---

## 📊 EXPECTED API RESPONSE TIMES

| Service | Average Time | Notes |
|---------|--------------|-------|
| Gateway | < 1s | Lightweight orchestration |
| Detect | 1-3s | YOLOv8 is fast |
| Segment | 3-5s | MobileSAM processing |
| Advise | 10-20s | LLaVA model loading + inference |
| Generate | 30-60s | Stable Diffusion 20 steps |

---

## 🎉 SUCCESS CRITERIA

Integration is complete when:
1. ✅ All backend services running with CORS
2. ✅ Frontend dev server running
3. ✅ Can upload image in each page
4. ✅ See real AI results (not mock setTimeout)
5. ✅ Error handling works
6. ✅ Full workflow completes successfully

---

## 📁 FILE CHANGES SUMMARY

### Modified Files:
- `artistry-backend/gateway/app/main.py` - Added CORS
- `artistry-backend/detect/app/main.py` - Added CORS + file upload endpoint
- `artistry-backend/segment/app/main.py` - Added CORS + file upload endpoint
- `artistry-backend/advise/app/main.py` - Added CORS + file upload endpoint
- `artistry-backend/generate/app/main.py` - Added CORS + file upload endpoint

### Created Files:
- `frontend/.env` - Environment configuration
- `frontend/src/services/api.js` - API service layer

### Deleted Files:
- `frontend/app/*` - Removed Next.js structure
- `frontend/next.config.ts` - Removed Next.js config

### To Update:
- `frontend/src/pages/Detect.jsx`
- `frontend/src/pages/Segment.jsx`
- `frontend/src/pages/Advise.jsx`
- `frontend/src/pages/Generate.jsx`
- `frontend/src/pages/AIDesign.jsx`

---

**Ready to integrate! Follow steps 1-4 above to complete the integration. 🚀**
