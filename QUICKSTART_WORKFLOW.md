# 🚀 Quick Start - Full Workflow Feature

## Start Everything
```powershell
.\test_workflow.ps1
```

## Manual Start
```powershell
# Terminal 1 - Backend Services
cd artistry-backend
.\start_services.ps1

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Access Points

### Frontend
- **Full Workflow Page**: http://localhost:5173/workflow
- **Home Page**: http://localhost:5173
- **All Pages**: Available via navigation bar

### Backend Services
- **Gateway**: http://localhost:8000 (health: /health)
- **Detect**: http://localhost:8001 (health: /health)
- **Segment**: http://localhost:8002 (health: /health)
- **Advise**: http://localhost:8003 (health: /health)
- **Generate**: http://localhost:8004 (health: /health)

## What's New?

### ✨ Full Workflow Page (`/workflow`)
- **Upload Once**: Single image upload for all services
- **Auto Process**: Automatically flows through all 4 AI services
- **Progress Bar**: Visual indicator showing current step
- **Unified Results**: All outputs displayed in one view

### 🎯 Features
1. **Detect** - Objects identified with annotated image
2. **Segment** - Image segmented into regions
3. **Advise** - Design recommendations provided
4. **Generate** - New design created by AI

### ⏱️ Processing Time
- **Total**: ~30-60 seconds
- **First Run**: May take longer (model loading)
- **Subsequent**: Faster (models cached)

## File Structure

```
Artistry-Redesign/
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── FullWorkflow.jsx          [NEW] Main workflow page
│       ├── App.jsx                        [MODIFIED] Added /workflow route
│       └── components/
│           └── Navbar.jsx                 [MODIFIED] Added workflow link
├── test_workflow.ps1                      [NEW] Test script
├── WORKFLOW_GUIDE.md                      [NEW] Complete documentation
└── WORKFLOW_COMPLETE.md                   [NEW] Completion summary
```

## Quick Test

1. Run `.\test_workflow.ps1`
2. Open http://localhost:5173/workflow
3. Upload a room image
4. Click "Start Complete Workflow"
5. Watch the magic happen! ✨

## Troubleshooting

### Services not starting?
```powershell
cd artistry-backend
.\test_services.ps1
```

### Check all service health:
```powershell
# Test each service
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

### Frontend errors?
```powershell
cd frontend
npm install  # Reinstall dependencies
npm run dev  # Restart dev server
```

## Documentation

- **📖 Full Guide**: `WORKFLOW_GUIDE.md`
- **✅ Completion**: `WORKFLOW_COMPLETE.md`
- **🔧 Setup**: `VENV_SETUP_GUIDE.md`
- **🔗 Integration**: `INTEGRATION_GUIDE.md`

## User Flow

```
Homepage
  ↓
"Try Full AI Workflow" button
  ↓
/workflow page
  ↓
Upload image
  ↓
"Start Complete Workflow"
  ↓
Watch progress: Upload → Detect → Segment → Advise → Generate
  ↓
View all results in unified display
```

## Benefits

✅ **Single Upload** - No more uploading same image 4 times
✅ **Automatic** - No manual navigation between services
✅ **Fast** - Complete analysis in under 1 minute
✅ **Clear** - Progress tracking shows current step
✅ **Complete** - All results in one view

## Status: ✅ READY TO USE

Everything is set up and ready to go. Just run the test script and start designing!

---

**Need Help?** Check `WORKFLOW_GUIDE.md` for detailed instructions.
