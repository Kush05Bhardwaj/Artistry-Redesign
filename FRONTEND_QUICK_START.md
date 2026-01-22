# ⚡ FRONTEND MVP - QUICK SETUP

## 🚀 START FRONTEND (3 Steps)

### Step 1: Install Dependencies
```powershell
cd f:\Projects\Artistry\Artistry-Redesign\frontend
npm install
```

### Step 2: Create .env File
Create `frontend/.env`:
```env
VITE_API_GATEWAY=http://localhost:8000
VITE_DETECT_API=http://localhost:8001
VITE_SEGMENT_API=http://localhost:8002
VITE_ADVISE_API=http://localhost:8003
VITE_GENERATE_API=http://localhost:8004
```

### Step 3: Start Dev Server
```powershell
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🎯 ACCESS MVP WORKFLOW

Open browser: **http://localhost:5173/mvp**

---

## ✅ FULL TESTING (Complete Flow)

### **Terminal Setup (6 terminals):**

**Terminal 1-5:** Backend services (see QUICK_START.md)

**Terminal 6:** Frontend
```powershell
cd f:\Projects\Artistry\Artistry-Redesign\frontend
npm run dev
```

---

## 🧪 TEST WORKFLOW

1. **Upload:** Drop a room image
2. **Budget:** Select Low/Medium/High
3. **Room Size:** Adjust slider
4. **Analyze:** Click "Start AI Analysis"
5. **Wait:** Objects detected (10-15 sec)
6. **Suggestions:** Click "Get Design Suggestions"
7. **Cost:** View ₹ pricing breakdown
8. **Generate:** Click "Generate Visualization" (30-60 sec)
9. **DIY:** Click any item for instructions
10. **Save:** Click "Continue to Save & Share"
11. **Share:** Click WhatsApp/Facebook/etc.
12. **Download:** Get your design image

---

## 📊 WHAT YOU'LL SEE

### **Feature 1: AI Analysis**
- Detected objects list
- Annotated image with boxes

### **Feature 2: AI Suggestions**
- Bullet-point recommendations
- Design improvement ideas

### **Feature 3: Before-After**
- Original photo
- AI-generated redesign
- Side-by-side comparison

### **Feature 4: Cost Estimate**
- Total: ₹23,000 (example)
- DIY: ₹20,000
- Savings: ₹3,000 (13%)
- Timeline: 1.5 days
- Per-item breakdown
- "Where to buy" links

### **Feature 5: DIY Instructions**
- 6 steps for curtains
- 7 steps for walls
- Tools list with prices
- Materials with budget ranges
- Safety tips
- Video tutorial links

### **Feature 6: Save & Share**
- Save to cloud
- Share to WhatsApp/Facebook/Twitter/Pinterest/LinkedIn
- Download image

---

## 🔍 VERIFY INTEGRATION

All API calls working:
```powershell
# In browser console (F12), you should see:
POST http://localhost:8001/detect/        → 200 OK
POST http://localhost:8003/advise/        → 200 OK
POST http://localhost:8003/estimate/total-cost → 200 OK
POST http://localhost:8004/generate/      → 200 OK
POST http://localhost:8003/diy/instructions → 200 OK
```

---

## ⚠️ TROUBLESHOOTING

### **Frontend won't start:**
```powershell
npm install --force
npm run dev
```

### **API errors:**
- Check all 5 backend services running
- Verify .env file exists
- Check ports 8000-8004 accessible

### **CORS errors:**
- Backend CORS already configured
- Should work automatically

### **MongoDB errors (Save/Share):**
- Optional feature
- Works without MongoDB
- Share buttons still work (generate URLs)

---

## 💡 PRO TIPS

1. **Test with real room photos** (not stock images)
2. **Try all 3 budget tiers** (see price differences)
3. **Click different items** for DIY guides
4. **Expand all DIY steps** to see details
5. **Test share links** (they generate real URLs)
6. **Download image** works without MongoDB

---

## ✅ READY!

**Backend:** 5 services on ports 8000-8004
**Frontend:** http://localhost:5173/mvp

**All 6 MVP features integrated and working!** 🎉

