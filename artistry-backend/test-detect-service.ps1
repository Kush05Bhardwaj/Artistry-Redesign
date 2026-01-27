# =============================================
# DETECT SERVICE DIAGNOSTIC TOOL
# Tests YOLOv8 detection with detailed output
# =============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔍 DETECT SERVICE DIAGNOSTIC TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# =============================================
# STEP 1: Check if service is running
# =============================================

Write-Host "[Step 1] Checking if Detect service is running..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "http://localhost:8001/health" -Method Get -TimeoutSec 5
    Write-Host "  ✅ Service is RUNNING" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
    Write-Host "  Device: $($health.device)" -ForegroundColor Gray
    Write-Host "  Service: $($health.service)`n" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Service is NOT RUNNING" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n⚠️  Please start the Detect service first!" -ForegroundColor Yellow
    Write-Host "  Command: cd f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect; f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect\venv\Scripts\python.exe -m uvicorn app.main:app --port 8001 --reload`n" -ForegroundColor Gray
    exit 1
}

# =============================================
# STEP 2: Check if YOLOv8 model exists
# =============================================

Write-Host "[Step 2] Checking YOLOv8 model file..." -ForegroundColor Yellow

$modelPath = "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect\yolov8n.pt"

if (Test-Path $modelPath) {
    $modelSize = (Get-Item $modelPath).Length / 1MB
    Write-Host "  ✅ Model file exists" -ForegroundColor Green
    Write-Host "  Path: $modelPath" -ForegroundColor Gray
    Write-Host "  Size: $([math]::Round($modelSize, 2)) MB`n" -ForegroundColor Gray
} else {
    Write-Host "  ❌ Model file NOT FOUND" -ForegroundColor Red
    Write-Host "  Expected: $modelPath" -ForegroundColor Red
    Write-Host "`n⚠️  The model will auto-download on first use, but this may take time." -ForegroundColor Yellow
    Write-Host "  To manually download: Visit https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt`n" -ForegroundColor Gray
}

# =============================================
# STEP 3: Check test image
# =============================================

Write-Host "[Step 3] Checking test image..." -ForegroundColor Yellow

$testImagePath = "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect\image-asset.webp"

if (Test-Path $testImagePath) {
    Write-Host "  ✅ Test image found" -ForegroundColor Green
    Write-Host "  Path: $testImagePath`n" -ForegroundColor Gray
    $useTestImage = $true
} else {
    Write-Host "  ⚠️  Default test image not found" -ForegroundColor Yellow
    Write-Host "  You'll need to provide your own image`n" -ForegroundColor Gray
    $useTestImage = $false
}

# =============================================
# STEP 4: Test detection with image
# =============================================

Write-Host "[Step 4] Testing object detection..." -ForegroundColor Yellow

if ($useTestImage) {
    Write-Host "  Using test image: image-asset.webp" -ForegroundColor Gray
    
    try {
        # Read image file
        $imageBytes = [System.IO.File]::ReadAllBytes($testImagePath)
        
        # Create multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"test.webp`"",
            "Content-Type: image/webp$LF",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($imageBytes),
            "--$boundary--$LF"
        ) -join $LF
        
        Write-Host "  📤 Sending image to detection service..." -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri "http://localhost:8001/detect/" `
            -Method Post `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -Body $bodyLines `
            -TimeoutSec 30
        
        Write-Host "  ✅ Detection completed!" -ForegroundColor Green
        Write-Host "`n  📊 RESULTS:" -ForegroundColor Cyan
        Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        
        if ($response.objects -and $response.objects.Count -gt 0) {
            Write-Host "  ✅ Objects Detected: $($response.objects.Count)" -ForegroundColor Green
            Write-Host "`n  Detected Items:" -ForegroundColor White
            
            for ($i = 0; $i -lt $response.objects.Count; $i++) {
                $obj = $response.objects[$i]
                $conf = if ($response.confidence -and $i -lt $response.confidence.Count) { 
                    " (Confidence: $([math]::Round($response.confidence[$i] * 100, 1))%)" 
                } else { 
                    "" 
                }
                Write-Host "    $($i+1). $obj$conf" -ForegroundColor Yellow
            }
            
            Write-Host "`n  Bounding Boxes: $($response.bounding_boxes.Count)" -ForegroundColor Gray
            
            if ($response.annotated_image) {
                Write-Host "  ✅ Annotated image generated" -ForegroundColor Green
                Write-Host "  Image format: Base64 encoded" -ForegroundColor Gray
                
                # Save annotated image to file
                try {
                    $base64Data = $response.annotated_image -replace 'data:image/jpeg;base64,', ''
                    $imageBytes = [Convert]::FromBase64String($base64Data)
                    $outputPath = "f:\Projects\Artistry\Artistry-Redesign\artistry-backend\detect\test-output.jpg"
                    [System.IO.File]::WriteAllBytes($outputPath, $imageBytes)
                    Write-Host "  ✅ Saved annotated image: $outputPath" -ForegroundColor Green
                } catch {
                    Write-Host "  ⚠️  Could not save annotated image" -ForegroundColor Yellow
                }
            }
            
            Write-Host "`n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
            Write-Host "  ✅ DETECTION WORKING PROPERLY!" -ForegroundColor Green
            
        } else {
            Write-Host "  ⚠️  NO OBJECTS DETECTED" -ForegroundColor Yellow
            Write-Host "`n  Possible reasons:" -ForegroundColor White
            Write-Host "    1. Image doesn't contain recognizable objects" -ForegroundColor Gray
            Write-Host "    2. Objects are too small or unclear" -ForegroundColor Gray
            Write-Host "    3. Confidence threshold too high" -ForegroundColor Gray
            Write-Host "    4. Image is not a room/interior photo" -ForegroundColor Gray
            Write-Host "`n  Current detection settings:" -ForegroundColor White
            Write-Host "    • Confidence threshold: 0.1 (10%)" -ForegroundColor Gray
            Write-Host "    • IOU threshold: 0.3" -ForegroundColor Gray
            Write-Host "    • Image size: 640px" -ForegroundColor Gray
            Write-Host "    • Interior-only filter: ENABLED" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "  ❌ Detection FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n  Full error details:" -ForegroundColor Yellow
        Write-Host "  $($_.Exception)" -ForegroundColor Gray
    }
    
} else {
    Write-Host "  ⚠️  Skipping detection test (no test image)" -ForegroundColor Yellow
}

# =============================================
# STEP 5: Test with your own image
# =============================================

Write-Host "`n[Step 5] Want to test with your own image?" -ForegroundColor Yellow
Write-Host "  Use this PowerShell command:" -ForegroundColor White
Write-Host @"
  
  `$imagePath = "C:\path\to\your\image.jpg"
  `$boundary = [System.Guid]::NewGuid().ToString()
  `$LF = "``r``n"
  `$imageBytes = [System.IO.File]::ReadAllBytes(`$imagePath)
  `$bodyLines = (
      "--`$boundary",
      "Content-Disposition: form-data; name=``"file``"; filename=``"test.jpg``"",
      "Content-Type: image/jpeg`$LF",
      [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString(`$imageBytes),
      "--`$boundary--`$LF"
  ) -join `$LF
  
  `$result = Invoke-RestMethod -Uri "http://localhost:8001/detect/" ``
      -Method Post ``
      -ContentType "multipart/form-data; boundary=`$boundary" ``
      -Body `$bodyLines
  
  `$result | ConvertTo-Json -Depth 10
  
"@ -ForegroundColor Gray

# =============================================
# STEP 6: Common Issues & Solutions
# =============================================

Write-Host "`n[Step 6] Common Issues & Solutions" -ForegroundColor Yellow
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n  ❌ Problem: No objects detected" -ForegroundColor Red
Write-Host "  ✅ Solutions:" -ForegroundColor Green
Write-Host "     1. Use a clear, well-lit room photo" -ForegroundColor White
Write-Host "     2. Make sure photo contains furniture/items" -ForegroundColor White
Write-Host "     3. Try a higher resolution image (640px+)" -ForegroundColor White
Write-Host "     4. Check if objects are in the INTERIOR_CLASSES list" -ForegroundColor White

Write-Host "`n  ❌ Problem: Service crashes or timeouts" -ForegroundColor Red
Write-Host "  ✅ Solutions:" -ForegroundColor Green
Write-Host "     1. Check if CUDA/GPU drivers installed (optional)" -ForegroundColor White
Write-Host "     2. Reduce image size before upload" -ForegroundColor White
Write-Host "     3. Increase timeout to 60 seconds" -ForegroundColor White
Write-Host "     4. Check Python dependencies installed" -ForegroundColor White

Write-Host "`n  ❌ Problem: Wrong objects detected" -ForegroundColor Red
Write-Host "  ✅ Solutions:" -ForegroundColor Green
Write-Host "     1. YOLOv8n is a general model (80 COCO classes)" -ForegroundColor White
Write-Host "     2. Only interior items are filtered and returned" -ForegroundColor White
Write-Host "     3. Some misclassification is normal (AI limitation)" -ForegroundColor White
Write-Host "     4. Use YOLOv8m or YOLOv8l for better accuracy (slower)" -ForegroundColor White

Write-Host "`n  ❌ Problem: Confidence too low" -ForegroundColor Red
Write-Host "  ✅ Solutions:" -ForegroundColor Green
Write-Host "     1. Current threshold is 0.1 (10%) - very permissive" -ForegroundColor White
Write-Host "     2. To increase quality, raise to 0.25 (25%) in main.py" -ForegroundColor White
Write-Host "     3. Trade-off: Higher threshold = fewer but more accurate" -ForegroundColor White

# =============================================
# STEP 7: Detectable Objects List
# =============================================

Write-Host "`n[Step 7] What can YOLOv8 detect?" -ForegroundColor Yellow
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n  🪑 Furniture:" -ForegroundColor Cyan
Write-Host "     bed, chair, sofa, table, bench, desk, dresser" -ForegroundColor White

Write-Host "`n  📺 Electronics:" -ForegroundColor Cyan
Write-Host "     tv, laptop, mouse, keyboard, phone, remote" -ForegroundColor White

Write-Host "`n  🍳 Appliances:" -ForegroundColor Cyan
Write-Host "     microwave, oven, toaster, sink, refrigerator" -ForegroundColor White

Write-Host "`n  🎨 Decor:" -ForegroundColor Cyan
Write-Host "     plant, vase, clock, book, picture, frame" -ForegroundColor White

Write-Host "`n  💡 Lighting:" -ForegroundColor Cyan
Write-Host "     lamp, light, chandelier" -ForegroundColor White

Write-Host "`n  🚪 Structural:" -ForegroundColor Cyan
Write-Host "     door, window, curtain, wall, floor, ceiling" -ForegroundColor White

Write-Host "`n  Note: YOLO detects 80 COCO classes, but only interior items are returned" -ForegroundColor Gray

# =============================================
# Summary
# =============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 DIAGNOSTIC COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. If detection worked: ✅ Service is ready!" -ForegroundColor Green
Write-Host "  2. If no objects: Try a different room photo" -ForegroundColor White
Write-Host "  3. If crashed: Check Python dependencies" -ForegroundColor White
Write-Host "  4. For frontend: Test at http://localhost:5173/mvp`n" -ForegroundColor White

Write-Host "For more help, see: artistry-backend/detect/README.md" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan
