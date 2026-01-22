# 🚀 Quick Start - New MVP Features

## TL;DR - What's New?

**3 Major Features Added:**
1. **💰 Cost Estimation** - Get India-specific pricing for your room redesign
2. **🔨 DIY Guidance** - Step-by-step instructions to save money
3. **💾 Save & Share** - User accounts, design history, social sharing

---

## 1️⃣ Cost Estimation

### Start the Service
```powershell
cd artistry-backend/advise
uvicorn app.main:app --port 8003 --reload
```

### Test It
```powershell
# PowerShell
$body = @{
    detected_objects = @("bed", "curtains", "walls")
    budget = "medium"
    room_size_sqft = 150
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8003/estimate/total-cost" `
    -Method Post -Body $body -ContentType "application/json"
```

### What You Get
```json
{
  "total_cost_inr": 32000,
  "breakdown": {
    "materials_total_inr": 26000,
    "labor_total_inr": 6000,
    "timeline_days": 3.5
  },
  "diy_vs_professional": {
    "diy_total_inr": 26000,
    "savings_diy_inr": 6000,
    "savings_percentage": 18.8
  },
  "per_item_costs": [...]
}
```

**Budget Options:** `"low"` | `"medium"` | `"high"`  
**Items Supported:** bed, curtains, walls, chair, wardrobe, sofa, table, lighting, flooring, rug

---

## 2️⃣ DIY Instructions

### Test It
```powershell
# PowerShell
$body = @{
    item = "curtains"
    budget = "medium"
    skill_level = "beginner"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8003/diy/instructions" `
    -Method Post -Body $body -ContentType "application/json"
```

### What You Get
```json
{
  "item": "curtains",
  "difficulty": "beginner",
  "estimated_time_hours": 2,
  "total_cost_diy_inr": 2000,
  "savings_inr": 500,
  "steps": [
    {
      "step": 1,
      "title": "Measure Window Width & Height",
      "description": "Use measuring tape...",
      "duration_minutes": 10,
      "tips": ["Measure multiple points..."],
      "video_url": "https://youtube.com/..."
    }
  ],
  "tools_needed": [...],
  "materials_checklist": [...],
  "safety_tips": [...],
  "pro_tips": [...]
}
```

**Items with Full Instructions:**
- `"curtains"` - 6 steps, 2 hours, Beginner
- `"walls"` - 7 steps, 8 hours, Intermediate  
- `"bed"` - 6 steps, 4 hours, Intermediate
- `"lighting"` - 6 steps, 2 hours, Intermediate

---

## 3️⃣ User Authentication

### Start Gateway Service
```powershell
cd artistry-backend/gateway
uvicorn app.main:app --port 8000 --reload
```

### Signup
```powershell
$body = @{
    email = "user@example.com"
    password = "mypassword123"
    name = "John Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/auth/signup" `
    -Method Post -Body $body -ContentType "application/json"
```

**Response:**
```json
{
  "access_token": "abc123...",
  "user_id": "uuid-here",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Login
```powershell
$body = @{
    email = "user@example.com"
    password = "mypassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/auth/login" `
    -Method Post -Body $body -ContentType "application/json"
```

---

## 4️⃣ Save Design

### Save Your Design
```powershell
$body = @{
    user_id = "your-user-id"
    original_image_b64 = "base64..."
    generated_image_b64 = "base64..."
    detected_objects = @("bed", "curtains")
    budget = "medium"
    design_tips = "Modern minimalist"
    total_cost_inr = 22500
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/designs/save" `
    -Method Post -Body $body -ContentType "application/json"
```

**Response:**
```json
{
  "design_id": "design-uuid",
  "message": "Design saved successfully",
  "shareable_link": "https://artistry.ai/designs/design-uuid"
}
```

---

## 5️⃣ Share Design

### Get All Share Links
```powershell
$body = @{
    design_id = "your-design-id"
    platform = "whatsapp"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/designs/share" `
    -Method Post -Body $body -ContentType "application/json"
```

**Response:**
```json
{
  "all_share_options": {
    "link": "https://artistry.ai/designs/...",
    "whatsapp": "https://wa.me/?text=...",
    "facebook": "https://facebook.com/sharer/...",
    "twitter": "https://twitter.com/intent/tweet/...",
    "pinterest": "https://pinterest.com/pin/create/...",
    "linkedin": "https://linkedin.com/sharing/..."
  }
}
```

---

## 🧪 Run All Tests

```powershell
# PowerShell - Run automated test suite
.\test-mvp-endpoints.ps1
```

**What it tests:**
- ✅ Cost estimation
- ✅ DIY instructions
- ✅ User signup
- ✅ User login
- ✅ Save design
- ✅ Get user designs
- ✅ Share design
- ✅ Service health checks

---

## 📊 Complete Workflow Example

```powershell
# 1. User Signs Up
$signup = Invoke-RestMethod -Uri "http://localhost:8000/auth/signup" `
    -Method Post -Body (@{email="test@ex.com";password="pass";name="Test"} | ConvertTo-Json) `
    -ContentType "application/json"

$userId = $signup.user_id

# 2. Upload Image & Detect Objects (existing service)
# ... detection happens ...

# 3. Get Cost Estimate
$cost = Invoke-RestMethod -Uri "http://localhost:8003/estimate/total-cost" `
    -Method Post -Body (@{detected_objects=@("bed","curtains");budget="medium";room_size_sqft=150} | ConvertTo-Json) `
    -ContentType "application/json"

Write-Host "Total Cost: ₹$($cost.total_cost_inr)"

# 4. Get DIY Instructions
$diy = Invoke-RestMethod -Uri "http://localhost:8003/diy/instructions" `
    -Method Post -Body (@{item="curtains";budget="medium"} | ConvertTo-Json) `
    -ContentType "application/json"

Write-Host "DIY Steps: $($diy.steps.Count)"

# 5. Generate Design (existing service)
# ... generation happens ...

# 6. Save Design
$saved = Invoke-RestMethod -Uri "http://localhost:8000/designs/save" `
    -Method Post -Body (@{
        user_id=$userId;
        original_image_b64="img1";
        generated_image_b64="img2";
        detected_objects=@("bed");
        budget="medium";
        design_tips="Modern";
        total_cost_inr=$cost.total_cost_inr
    } | ConvertTo-Json) -ContentType "application/json"

# 7. Share Design
$share = Invoke-RestMethod -Uri "http://localhost:8000/designs/share" `
    -Method Post -Body (@{design_id=$saved.design_id;platform="whatsapp"} | ConvertTo-Json) `
    -ContentType "application/json"

Write-Host "WhatsApp Share: $($share.all_share_options.whatsapp)"
```

---

## 🎯 Common Use Cases

### Use Case 1: Get Budget Estimate
```powershell
# User wants to know cost before generating design
Invoke-RestMethod -Uri "http://localhost:8003/estimate/total-cost" `
    -Method Post -Body (@{detected_objects=@("bed","walls");budget="low";room_size_sqft=120} | ConvertTo-Json) `
    -ContentType "application/json"
```

### Use Case 2: DIY vs Professional Decision
```powershell
# Get cost estimate to see savings
$estimate = Invoke-RestMethod -Uri "http://localhost:8003/estimate/total-cost" ...
Write-Host "DIY: ₹$($estimate.diy_vs_professional.diy_total_inr)"
Write-Host "Professional: ₹$($estimate.diy_vs_professional.professional_total_inr)"
Write-Host "You Save: ₹$($estimate.diy_vs_professional.savings_diy_inr)"
```

### Use Case 3: Learn How to DIY
```powershell
# Get step-by-step instructions
$guide = Invoke-RestMethod -Uri "http://localhost:8003/diy/instructions" ...
foreach ($step in $guide.steps) {
    Write-Host "$($step.step). $($step.title)"
    Write-Host "   $($step.description)"
    Write-Host "   Time: $($step.duration_minutes) min"
    Write-Host ""
}
```

### Use Case 4: Build Portfolio
```powershell
# User wants to save all their designs
# After each generation, call:
Invoke-RestMethod -Uri "http://localhost:8000/designs/save" ...

# View all designs later:
Invoke-RestMethod -Uri "http://localhost:8000/designs/user/$userId?limit=10" -Method Get
```

### Use Case 5: Share on Social Media
```powershell
# Get WhatsApp share link
$share = Invoke-RestMethod -Uri "http://localhost:8000/designs/share" ...
Start-Process $share.all_share_options.whatsapp
```

---

## 🔧 Troubleshooting

### Error: "Database not configured"
**Solution:** Ensure MongoDB is running and `MONGO_URI` is set in `.env`

```powershell
# Check if MongoDB is accessible
Test-NetConnection localhost -Port 27017

# Or use MongoDB Atlas connection string
$env:MONGO_URI = "mongodb+srv://user:pass@cluster.mongodb.net/artistry"
```

### Error: "Service not responding"
**Solution:** Ensure all services are running

```powershell
# Check service health
Invoke-RestMethod -Uri "http://localhost:8003/health" -Method Get
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
```

### Error: "Invalid token"
**Solution:** Login again to get new token

```powershell
$login = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" ...
$token = $login.access_token
```

---

## 📚 More Information

- **Full API Documentation:** `MVP_IMPLEMENTATION.md`
- **Deployment Guide:** `DEPLOYMENT_CHECKLIST.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Summary:** `MVP_SUMMARY.md`

---

## 🚀 Ready to Launch!

**Your MVP backend is 100% complete with:**
- ✅ Cost estimation (India-specific)
- ✅ DIY instructions (4 major items)
- ✅ User authentication
- ✅ Design save & share
- ✅ Social media integration

**Next:** Frontend integration → Testing → Launch! 🎉

---

**Questions?**  
Email: kush2012bhardwaj@gmail.com | sankusharma09@gmail.com
