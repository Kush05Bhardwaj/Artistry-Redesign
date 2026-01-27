# ============================================
# OPTIMIZATION VERIFICATION SCRIPT
# Tests that all optimizations are active
# ============================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Artistry Backend - Optimization Checker" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$BASE_DIR = $PSScriptRoot
$results = @()

# Test if service is running and optimized
function Test-ServiceOptimization {
    param($Name, $Port, $Path)
    
    Write-Host "Testing $Name..." -ForegroundColor Cyan
    
    $result = @{
        Name = $Name
        Port = $Port
        Running = $false
        Optimized = $false
        VenvExists = $false
        Issues = @()
    }
    
    # Check venv
    $venvPath = Join-Path $Path "venv"
    if (Test-Path "$venvPath\Scripts\python.exe") {
        $result.VenvExists = $true
        Write-Host "  ✓ Virtual environment exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Virtual environment missing" -ForegroundColor Red
        $result.Issues += "No venv found"
    }
    
    # Check if service is running
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/health" -TimeoutSec 5
        $result.Running = $true
        Write-Host "  ✓ Service is running" -ForegroundColor Green
        
        # Check if optimized version
        if ($response.service -like "*Optimized*") {
            $result.Optimized = $true
            Write-Host "  ✓ Optimized version detected" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Running non-optimized version" -ForegroundColor Yellow
            $result.Issues += "Not using optimized code"
        }
        
        # Show device info if available
        if ($response.device) {
            $deviceColor = if ($response.device -eq "cuda") { "Green" } else { "Yellow" }
            Write-Host "  Device: $($response.device)" -ForegroundColor $deviceColor
        }
        
    } catch {
        Write-Host "  ✗ Service not responding" -ForegroundColor Red
        $result.Issues += "Service not running"
    }
    
    return $result
}

# Services to test
$services = @(
    @{Name = "Gateway"; Port = 8000; Path = "$BASE_DIR\gateway"},
    @{Name = "Detect"; Port = 8001; Path = "$BASE_DIR\detect"},
    @{Name = "Segment"; Port = 8002; Path = "$BASE_DIR\segment"},
    @{Name = "Generate"; Port = 8004; Path = "$BASE_DIR\generate"}
)

# Test each service
foreach ($service in $services) {
    $result = Test-ServiceOptimization -Name $service.Name -Port $service.Port -Path $service.Path
    $results += $result
    Write-Host ""
}

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$totalServices = $results.Count
$runningServices = ($results | Where-Object { $_.Running }).Count
$optimizedServices = ($results | Where-Object { $_.Optimized }).Count
$venvServices = ($results | Where-Object { $_.VenvExists }).Count

Write-Host "Services Status:" -ForegroundColor White
Write-Host "  Total Services: $totalServices" -ForegroundColor Gray
Write-Host "  Running: $runningServices / $totalServices" -ForegroundColor $(if ($runningServices -eq $totalServices) { "Green" } else { "Yellow" })
Write-Host "  Optimized: $optimizedServices / $totalServices" -ForegroundColor $(if ($optimizedServices -eq $totalServices) { "Green" } else { "Yellow" })
Write-Host "  With Venv: $venvServices / $totalServices" -ForegroundColor $(if ($venvServices -eq $totalServices) { "Green" } else { "Yellow" })
Write-Host ""

# Detailed issues
$issuesFound = $results | Where-Object { $_.Issues.Count -gt 0 }
if ($issuesFound) {
    Write-Host "Issues Found:" -ForegroundColor Yellow
    foreach ($result in $issuesFound) {
        Write-Host "`n  $($result.Name):" -ForegroundColor Red
        foreach ($issue in $result.Issues) {
            Write-Host "    - $issue" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# Recommendations
Write-Host "Recommendations:" -ForegroundColor Cyan
if ($venvServices -lt $totalServices) {
    Write-Host "  1. Create missing virtual environments:" -ForegroundColor Yellow
    Write-Host "     .\manage-dependencies.ps1 -Install" -ForegroundColor White
}
if ($runningServices -lt $totalServices) {
    Write-Host "  2. Start all services:" -ForegroundColor Yellow
    Write-Host "     .\start-optimized-services.ps1" -ForegroundColor White
}
if ($optimizedServices -lt $runningServices) {
    Write-Host "  3. Update to optimized code (already done in files)" -ForegroundColor Yellow
    Write-Host "     Restart services to apply changes" -ForegroundColor White
}

# Check optimization features
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Optimization Features Check" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Check-CodeFeature {
    param($File, $Pattern, $Feature)
    
    if (Test-Path $File) {
        $content = Get-Content $File -Raw
        if ($content -match $Pattern) {
            Write-Host "  ✓ $Feature" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ✗ $Feature" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  ⚠ File not found: $File" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "Detect Service:" -ForegroundColor Cyan
Check-CodeFeature "$BASE_DIR\detect\app\main.py" "lru_cache" "Image caching"
Check-CodeFeature "$BASE_DIR\detect\app\main.py" "get_model\(\)" "Lazy model loading"
Check-CodeFeature "$BASE_DIR\detect\app\main.py" "torch.cuda.empty_cache" "Memory cleanup"

Write-Host "`nSegment Service:" -ForegroundColor Cyan
Check-CodeFeature "$BASE_DIR\segment\app\main.py" "get_sam_predictor" "Lazy predictor loading"
Check-CodeFeature "$BASE_DIR\segment\app\main.py" "enable_edge_refinement" "Configurable refinement"

Write-Host "`nGenerate Service:" -ForegroundColor Cyan
Check-CodeFeature "$BASE_DIR\generate\app\main.py" "enable_attention_slicing" "Attention slicing"
Check-CodeFeature "$BASE_DIR\generate\app\main.py" "enable_vae_slicing" "VAE slicing"
Check-CodeFeature "$BASE_DIR\generate\app\main.py" "xformers" "xformers support"

Write-Host "`nGateway Service:" -ForegroundColor Cyan
Check-CodeFeature "$BASE_DIR\gateway\app\main.py" "AsyncClient" "Connection pooling"
Check-CodeFeature "$BASE_DIR\gateway\app\main.py" "max_keepalive_connections" "Keep-alive connections"

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Optimization Check Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($optimizedServices -eq $totalServices -and $runningServices -eq $totalServices) {
    Write-Host "✓ All services are running with optimizations!" -ForegroundColor Green
} else {
    Write-Host "⚠ Some optimizations are not active. See recommendations above." -ForegroundColor Yellow
}
Write-Host ""
