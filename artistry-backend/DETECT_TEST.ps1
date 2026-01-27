# DETECT SERVICE DIAGNOSTIC
# Simple test for YOLOv8 object detection

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "DETECT SERVICE DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Step 1: Check service health
Write-Host "[1] Checking service status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8001/health" -Method Get -TimeoutSec 5
    Write-Host "  OK - Service running" -ForegroundColor Green
    Write-Host "  Device: $($health.device)" -ForegroundColor Gray
} catch {
    Write-Host "  FAILED - Service not running" -ForegroundColor Red
    Write-Host "  Start with: cd detect; python -m uvicorn app.main:app --port 8001 --reload" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check model file
Write-Host "`n[2] Checking YOLOv8 model..." -ForegroundColor Yellow
$modelPath = "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect\yolov8n.pt"
if (Test-Path $modelPath) {
    $size = (Get-Item $modelPath).Length / 1MB
    Write-Host "  OK - Model exists ($([math]::Round($size, 1)) MB)" -ForegroundColor Green
} else {
    Write-Host "  WARNING - Model will auto-download on first use" -ForegroundColor Yellow
}

# Step 3: Test with sample image
Write-Host "`n[3] Testing detection..." -ForegroundColor Yellow
$testImage = "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect\image-asset.webp"

if (Test-Path $testImage) {
    Write-Host "  Using: image-asset.webp" -ForegroundColor Gray
    
    # Simple file upload test
    $uri = "http://localhost:8001/detect/"
    
    # Using curl (simpler than Invoke-RestMethod for multipart)
    Write-Host "  Uploading image..." -ForegroundColor Cyan
    
    $curlCmd = "curl.exe -X POST -F `"file=@$testImage`" $uri"
    $result = Invoke-Expression $curlCmd | ConvertFrom-Json
    
    if ($result.objects) {
        Write-Host "`n  SUCCESS - Detected $($result.objects.Count) objects:" -ForegroundColor Green
        for ($i = 0; $i -lt $result.objects.Count; $i++) {
            Write-Host "    $($i+1). $($result.objects[$i])" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n  WARNING - No objects detected" -ForegroundColor Yellow
        Write-Host "  This might mean:" -ForegroundColor White
        Write-Host "    - Image has no recognizable furniture" -ForegroundColor Gray
        Write-Host "    - Objects are too small/unclear" -ForegroundColor Gray
        Write-Host "    - Not a room interior photo" -ForegroundColor Gray
    }
} else {
    Write-Host "  SKIPPED - No test image found" -ForegroundColor Yellow
    Write-Host "  Place a room photo at: $testImage" -ForegroundColor Gray
}

# Step 4: Show what can be detected
Write-Host "`n[4] Detectable interior objects:" -ForegroundColor Yellow
Write-Host "  Furniture: bed, chair, sofa, table, desk" -ForegroundColor White
Write-Host "  Electronics: tv, laptop, keyboard, phone" -ForegroundColor White
Write-Host "  Decor: plant, vase, clock, picture" -ForegroundColor White
Write-Host "  Lighting: lamp, light" -ForegroundColor White
Write-Host "  Structural: door, window, curtain" -ForegroundColor White

# Step 5: Test with your own image
Write-Host "`n[5] Test with your own image:" -ForegroundColor Yellow
Write-Host @"
  
  curl.exe -X POST -F "file=@C:\path\to\your\image.jpg" http://localhost:8001/detect/
  
"@ -ForegroundColor Gray

Write-Host "`n==================================`n" -ForegroundColor Cyan
