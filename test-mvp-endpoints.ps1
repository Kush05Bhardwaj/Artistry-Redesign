# MVP Endpoint Testing Script
# Tests all new endpoints: Cost Estimation, DIY Instructions, Auth, Save/Share

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Artistry MVP - API Testing Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$ADVISE_URL = "http://localhost:8003"
$GATEWAY_URL = "http://localhost:8000"

# Test 1: Cost Estimation
Write-Host "Test 1: Cost Estimation API" -ForegroundColor Yellow
Write-Host "Endpoint: POST $ADVISE_URL/estimate/total-cost" -ForegroundColor Gray

$costRequest = @{
    detected_objects = @("bed", "curtains", "walls")
    budget = "medium"
    room_size_sqft = 150
} | ConvertTo-Json

try {
    $costResponse = Invoke-RestMethod -Uri "$ADVISE_URL/estimate/total-cost" -Method Post -Body $costRequest -ContentType "application/json"
    Write-Host "✓ Success! Total Cost: ₹$($costResponse.total_cost_inr)" -ForegroundColor Green
    Write-Host "  - Materials: ₹$($costResponse.breakdown.materials_total_inr)" -ForegroundColor Gray
    Write-Host "  - Labor: ₹$($costResponse.breakdown.labor_total_inr)" -ForegroundColor Gray
    Write-Host "  - DIY Savings: ₹$($costResponse.diy_vs_professional.savings_diy_inr)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: DIY Instructions
Write-Host "Test 2: DIY Instructions API" -ForegroundColor Yellow
Write-Host "Endpoint: POST $ADVISE_URL/diy/instructions" -ForegroundColor Gray

$diyRequest = @{
    item = "curtains"
    budget = "medium"
    skill_level = "beginner"
} | ConvertTo-Json

try {
    $diyResponse = Invoke-RestMethod -Uri "$ADVISE_URL/diy/instructions" -Method Post -Body $diyRequest -ContentType "application/json"
    Write-Host "✓ Success! DIY Guide for: $($diyResponse.item)" -ForegroundColor Green
    Write-Host "  - Difficulty: $($diyResponse.difficulty)" -ForegroundColor Gray
    Write-Host "  - Time: $($diyResponse.estimated_time_hours) hours" -ForegroundColor Gray
    Write-Host "  - Steps: $($diyResponse.steps.Count)" -ForegroundColor Gray
    Write-Host "  - DIY Cost: ₹$($diyResponse.total_cost_diy_inr)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: User Signup
Write-Host "Test 3: User Authentication - Signup" -ForegroundColor Yellow
Write-Host "Endpoint: POST $GATEWAY_URL/auth/signup" -ForegroundColor Gray

$signupRequest = @{
    email = "test_$(Get-Random)@example.com"
    password = "SecurePassword123"
    name = "Test User"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/auth/signup" -Method Post -Body $signupRequest -ContentType "application/json"
    Write-Host "✓ Success! User created: $($signupResponse.name)" -ForegroundColor Green
    Write-Host "  - User ID: $($signupResponse.user_id)" -ForegroundColor Gray
    Write-Host "  - Email: $($signupResponse.email)" -ForegroundColor Gray
    Write-Host "  - Token: $($signupResponse.access_token.Substring(0, 20))..." -ForegroundColor Gray
    
    # Store for next tests
    $global:userId = $signupResponse.user_id
    $global:accessToken = $signupResponse.access_token
    $global:userEmail = $signupResponse.email
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: User Login (reuse email from signup)
if ($global:userEmail) {
    Write-Host "Test 4: User Authentication - Login" -ForegroundColor Yellow
    Write-Host "Endpoint: POST $GATEWAY_URL/auth/login" -ForegroundColor Gray

    $loginRequest = @{
        email = $global:userEmail
        password = "SecurePassword123"
    } | ConvertTo-Json

    try {
        $loginResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/auth/login" -Method Post -Body $loginRequest -ContentType "application/json"
        Write-Host "✓ Success! User logged in: $($loginResponse.name)" -ForegroundColor Green
        Write-Host "  - New Token: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

# Test 5: Save Design
if ($global:userId) {
    Write-Host "Test 5: Save Design" -ForegroundColor Yellow
    Write-Host "Endpoint: POST $GATEWAY_URL/designs/save" -ForegroundColor Gray

    $saveDesignRequest = @{
        user_id = $global:userId
        original_image_b64 = "base64_encoded_original_image_here"
        generated_image_b64 = "base64_encoded_generated_image_here"
        detected_objects = @("bed", "curtains", "chair")
        budget = "medium"
        design_tips = "Modern minimalist with warm tones"
        total_cost_inr = 25000
        metadata = @{
            room_type = "bedroom"
            room_size_sqft = 150
        }
    } | ConvertTo-Json

    try {
        $saveResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/designs/save" -Method Post -Body $saveDesignRequest -ContentType "application/json"
        Write-Host "✓ Success! Design saved" -ForegroundColor Green
        Write-Host "  - Design ID: $($saveResponse.design_id)" -ForegroundColor Gray
        Write-Host "  - Shareable Link: $($saveResponse.shareable_link)" -ForegroundColor Gray
        
        # Store for next test
        $global:designId = $saveResponse.design_id
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

# Test 6: Get User Designs
if ($global:userId) {
    Write-Host "Test 6: Get User Designs" -ForegroundColor Yellow
    Write-Host "Endpoint: GET $GATEWAY_URL/designs/user/$($global:userId)" -ForegroundColor Gray

    try {
        $designsResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/designs/user/$($global:userId)?limit=10&skip=0" -Method Get
        Write-Host "✓ Success! Retrieved designs" -ForegroundColor Green
        Write-Host "  - Total Designs: $($designsResponse.total_count)" -ForegroundColor Gray
        Write-Host "  - Designs in Response: $($designsResponse.designs.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

# Test 7: Share Design
if ($global:designId) {
    Write-Host "Test 7: Generate Share Links" -ForegroundColor Yellow
    Write-Host "Endpoint: POST $GATEWAY_URL/designs/share" -ForegroundColor Gray

    $shareRequest = @{
        design_id = $global:designId
        platform = "whatsapp"
    } | ConvertTo-Json

    try {
        $shareResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/designs/share" -Method Post -Body $shareRequest -ContentType "application/json"
        Write-Host "✓ Success! Share links generated" -ForegroundColor Green
        Write-Host "  - WhatsApp: $($shareResponse.all_share_options.whatsapp.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host "  - Facebook: $($shareResponse.all_share_options.facebook.Substring(0, 50))..." -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

# Test 8: Health Checks
Write-Host "Test 8: Service Health Checks" -ForegroundColor Yellow

$services = @(
    @{name="Gateway"; url="$GATEWAY_URL/health"},
    @{name="Advise"; url="$ADVISE_URL/health"}
)

foreach ($service in $services) {
    try {
        $healthResponse = Invoke-RestMethod -Uri $service.url -Method Get
        Write-Host "  ✓ $($service.name): $($healthResponse.status)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $($service.name): DOWN" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Testing Complete!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Cost Estimation API: Tested" -ForegroundColor Gray
Write-Host "  - DIY Instructions API: Tested" -ForegroundColor Gray
Write-Host "  - User Authentication: Tested" -ForegroundColor Gray
Write-Host "  - Save/Share Designs: Tested" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: MongoDB must be running for auth and design tests to pass." -ForegroundColor Yellow
Write-Host ""
