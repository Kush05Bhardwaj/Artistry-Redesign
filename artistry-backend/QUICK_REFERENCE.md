# 🎯 Quick Reference - Optimized Backend

## 🚀 Getting Started

### First Time Setup
```powershell
cd artistry-backend
.\manage-dependencies.ps1 -Install
```

### Start All Services
```powershell
.\start-optimized-services.ps1
```

### Check Status
```powershell
.\check-optimizations.ps1
```

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Gateway | 8000 | http://localhost:8000 |
| Detect | 8001 | http://localhost:8001 |
| Segment | 8002 | http://localhost:8002 |
| Generate | 8004 | http://localhost:8004 |

## 🛠️ Common Commands

### Dependencies
```powershell
# Install
.\manage-dependencies.ps1 -Install

# Update
.\manage-dependencies.ps1 -Update

# Clean cache
.\manage-dependencies.ps1 -Clean
```

### Services
```powershell
# Start all
.\start-optimized-services.ps1

# Stop all
# Press Ctrl+C in the terminal
```

### Verification
```powershell
# Check optimizations
.\check-optimizations.ps1

# Test health
curl http://localhost:8000/health
curl http://localhost:8001/health
```

## ⚡ Performance Tips

### Best Practices
1. ✅ Always use `start-optimized-services.ps1`
2. ✅ Let services warm up (first request slower)
3. ✅ Monitor GPU with `nvidia-smi`
4. ✅ Clear CUDA cache if memory issues

### Adjusting Settings

**Detect:**
```json
{
  "conf_threshold": 0.1,  // Lower = more objects
  "iou_threshold": 0.3    // Higher = less overlap
}
```

**Segment:**
```json
{
  "enable_edge_refinement": true  // Toggle for speed
}
```

## 🐛 Troubleshooting

### Service Won't Start
```powershell
# Check venv
ls .\detect\venv\Scripts\python.exe

# Recreate if needed
.\manage-dependencies.ps1 -Install
```

### Out of Memory
```powershell
# Check GPU
nvidia-smi

# Restart services
# (Ctrl+C then restart)
```

### Slow Performance
```powershell
# Verify optimizations
.\check-optimizations.ps1

# Check CUDA
python -c "import torch; print(torch.cuda.is_available())"
```

## 📈 Performance Metrics

### Speed Improvements
- Detect: **80%+ faster** (3s → 0.5s)
- Gateway: **40% faster** (100ms → 60ms)
- Generate: **20% faster** (15s → 12s)

### Memory Savings
- Detect: **33% less** GPU memory
- Segment: **37% less** GPU memory
- Generate: **37% less** GPU memory

## 📝 Key Files

| File | Purpose |
|------|---------|
| `start-optimized-services.ps1` | Start all services |
| `manage-dependencies.ps1` | Manage venvs |
| `check-optimizations.ps1` | Verify setup |
| `OPTIMIZATION_README.md` | Full guide |
| `OPTIMIZATION_GUIDE.md` | Detailed docs |

## 🎯 Quick Health Check

```powershell
# All-in-one status check
.\check-optimizations.ps1

# Should show:
# ✓ All services running
# ✓ All optimized
# ✓ All with venv
```

## 💡 Tips

1. **First run is slower** - Models need to load
2. **Subsequent runs are fast** - Models stay in memory
3. **Use venv scripts** - Don't activate manually
4. **Monitor resources** - Keep an eye on GPU/RAM
5. **Clean caches periodically** - Saves disk space

## 🔗 Endpoints Reference

### Gateway (8000)
- `GET /health` - Health check
- `POST /api/create-room` - Full workflow
- `POST /api/mvp/detect` - Quick detect
- `POST /api/mvp/redesign` - Quick redesign

### Detect (8001)
- `GET /health` - Health check
- `POST /detect` - Detection (JSON)
- `POST /detect/` - Detection (file)

### Segment (8002)
- `GET /health` - Health check
- `POST /segment` - Segmentation
- `POST /segment/` - Segmentation (file)

### Generate (8004)
- `GET /health` - Health check
- `POST /generate` - Image generation
- `POST /inpaint` - Inpainting

---

**Need more help?** See `OPTIMIZATION_GUIDE.md` for detailed documentation.
