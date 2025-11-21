# Full Workflow Feature - User Guide

## Overview

The **Full Workflow** feature allows users to upload an image once and automatically process it through all AI services in sequence:

1. **Detect** - Identifies objects in the room
2. **Segment** - Segments the image into distinct regions
3. **Advise** - Provides design recommendations based on the image
4. **Generate** - Creates a new AI-generated design

## Why Use Full Workflow?

### Before (Manual Process)
- Upload image to Detect page
- Wait for results
- Upload same image to Segment page
- Wait for results
- Upload same image to Advise page
- Wait for results
- Upload same image to Generate page
- Wait for results
- Switch between pages to see different results

### After (Automated Workflow)
- Upload image once
- Click "Start Complete Workflow"
- Watch progress as image flows through all services
- See all results in one unified view

## Accessing the Feature

### From Home Page
1. Visit the homepage
2. Click **"Try Full AI Workflow"** button in the hero section

### From Navigation
1. Click **"Full Workflow"** in the navigation bar
2. Available from any page

### Direct URL
- Navigate to `http://localhost:5173/workflow`

## How to Use

### Step 1: Upload Image
1. Click the upload area or "Choose File" button
2. Select a room image (PNG, JPG up to 10MB)
3. Image preview will appear

### Step 2: Start Workflow
1. Click **"Start Complete Workflow"** button
2. Progress bar shows current step
3. Each step is marked with checkmarks as it completes

### Step 3: View Results
Results appear in a grid as they complete:

#### Detection Results
- Annotated image showing detected objects
- List of identified objects (furniture, decorations, etc.)

#### Segmentation Results
- Segmented image with distinct regions
- Number of segments identified

#### Design Advice
- Numbered list of design recommendations
- Personalized tips based on the room analysis

#### Generated Design
- AI-generated redesign of the room
- Shows the prompt used for generation

## Progress Tracking

The workflow includes a visual progress indicator with 5 steps:

```
Upload → Detect → Segment → Advise → Generate
```

- **Gray**: Not started
- **Blue (pulsing)**: Currently processing
- **Green**: Completed

## Features

### Single Upload
- Upload image once, used for all services
- No need to re-upload between steps

### Automatic Flow
- Services called sequentially
- No manual intervention required

### Error Handling
- Clear error messages if any step fails
- Option to retry or upload new image

### Individual Service Access
- Links to individual service pages at the bottom
- Use if you only need one specific service

## Technical Details

### Processing Time
Approximate time for each step:
- **Detect**: 2-5 seconds
- **Segment**: 3-8 seconds
- **Advise**: 5-10 seconds (depends on model loading)
- **Generate**: 15-30 seconds (most compute-intensive)

**Total**: ~30-60 seconds for complete workflow

### Image Requirements
- **Format**: PNG, JPG, JPEG
- **Size**: Up to 10MB
- **Recommended**: 1024x1024 or similar resolution
- **Content**: Interior room photos work best

### Service Endpoints
The workflow uses these backend services:
- Gateway: `http://localhost:8000`
- Detect: `http://localhost:8001`
- Segment: `http://localhost:8002`
- Advise: `http://localhost:8003`
- Generate: `http://localhost:8004`

## Troubleshooting

### Services Not Responding
**Problem**: Workflow gets stuck on a step

**Solutions**:
1. Ensure all backend services are running
2. Check service health: Run `.\artistry-backend\test_services.ps1`
3. Restart services: Run `.\artistry-backend\start_services.ps1`

### Image Upload Failed
**Problem**: Upload button not working

**Solutions**:
1. Check image file size (max 10MB)
2. Verify image format (PNG, JPG only)
3. Try a different image

### Slow Processing
**Problem**: Workflow takes too long

**Reasons**:
1. First time loading models (expected)
2. Large image size
3. Limited GPU/CPU resources

**Solutions**:
1. Wait for first run (models cached after)
2. Use smaller images (1024x1024)
3. Check CPU/GPU usage

### Error Messages
| Error | Cause | Solution |
|-------|-------|----------|
| "Please upload an image first" | No image selected | Upload image before starting |
| "Service unavailable" | Backend service down | Restart services |
| "Connection failed" | Network issue | Check service URLs in .env |
| "Processing timeout" | Service took too long | Increase timeout or use smaller image |

## Comparison with Individual Services

### Use Full Workflow When:
- ✓ You want comprehensive analysis
- ✓ You need all AI insights at once
- ✓ You're exploring design options
- ✓ You want to save time

### Use Individual Services When:
- ✓ You only need one specific analysis
- ✓ You want to experiment with parameters
- ✓ You need faster results for one task
- ✓ You're debugging a specific service

## API Integration

For developers integrating the workflow:

### Frontend API Call
```javascript
import { detectObjects, segmentImage, getDesignAdvice, generateDesign } from './services/api'

async function runWorkflow(imageFile) {
  // Step 1: Detect
  const detectResult = await detectObjects(imageFile)
  
  // Step 2: Segment
  const segmentResult = await segmentImage(imageFile, 10)
  
  // Step 3: Advise
  const adviseResult = await getDesignAdvice(imageFile)
  
  // Step 4: Generate
  const generateResult = await generateDesign(
    imageFile, 
    "Modern minimalist interior design",
    { numInferenceSteps: 20, guidanceScale: 7.5 }
  )
  
  return { detectResult, segmentResult, adviseResult, generateResult }
}
```

### Backend Service Flow
```
User Upload
    ↓
[Gateway:8000] → [Detect:8001] → Returns detected objects
    ↓
[Gateway:8000] → [Segment:8002] → Returns segmented image
    ↓
[Gateway:8000] → [Advise:8003] → Returns design advice
    ↓
[Gateway:8000] → [Generate:8004] → Returns generated design
```

## Future Enhancements

Planned improvements:
- [ ] Save workflow results to database
- [ ] Export all results as PDF
- [ ] Customize workflow order
- [ ] Skip optional steps
- [ ] Parallel processing where possible
- [ ] Real-time progress updates with WebSockets
- [ ] Batch processing multiple images

## Support

If you encounter issues:
1. Check the console for error messages (F12 in browser)
2. Verify all services are running (`test_services.ps1`)
3. Review service logs in terminal windows
4. Check `frontend/.env` and `artistry-backend/gateway/.env` for correct URLs

## Summary

The Full Workflow feature streamlines the entire AI design process into a single, automated experience. Upload once, get comprehensive results in under a minute, all displayed in a unified interface.

**Key Benefits:**
- ⚡ Faster than manual process
- 🎯 Comprehensive analysis
- 🖼️ Unified results view
- ✨ Better user experience
