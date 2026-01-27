# ============================================
# OPTIMIZED ARTISTRY SERVICES STARTUP SCRIPT
# Uses individual venv for each service
# ============================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Artistry Backend Services (Optimized)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Base directory
$BASE_DIR = $PSScriptRoot

# Service configurations
$services = @(
    @{
        Name = "Gateway"
        Port = 8000
        Path = "$BASE_DIR\gateway"
        Venv = "$BASE_DIR\gateway\venv"
        Script = "app.main:app"
        Color = "Green"
    },
    @{
        Name = "Detect"
        Port = 8001
        Path = "$BASE_DIR\detect"
        Venv = "$BASE_DIR\detect\venv"
        Script = "app.main:app"
        Color = "Yellow"
    },
    @{
        Name = "Segment"
        Port = 8002
        Path = "$BASE_DIR\segment"
        Venv = "$BASE_DIR\segment\venv"
        Script = "app.main:app"
        Color = "Magenta"
    },
    @{
        Name = "Generate"
        Port = 8004
        Path = "$BASE_DIR\generate"
        Venv = "$BASE_DIR\generate\venv"
        Script = "app.main:app"
        Color = "Blue"
    }
)

# Function to check if venv exists
function Test-VenvExists {
    param($VenvPath)
    return Test-Path "$VenvPath\Scripts\python.exe"
}

# Function to start a service
function Start-Service {
    param($Service)
    
    Write-Host "`n[$($Service.Name)]" -ForegroundColor $Service.Color -NoNewline
    Write-Host " Starting on port $($Service.Port)..."
    
    # Check if venv exists
    if (-not (Test-VenvExists $Service.Venv)) {
        Write-Host "  ⚠ Virtual environment not found at: $($Service.Venv)" -ForegroundColor Red
        Write-Host "  Please create venv first: python -m venv $($Service.Venv)" -ForegroundColor Red
        return $null
    }
    
    # Activate venv and start uvicorn
    $pythonExe = "$($Service.Venv)\Scripts\python.exe"
    $uvicornCmd = "$($Service.Venv)\Scripts\uvicorn.exe"
    
    # Check if uvicorn is installed
    if (-not (Test-Path $uvicornCmd)) {
        Write-Host "  ⚠ uvicorn not found. Installing..." -ForegroundColor Yellow
        & $pythonExe -m pip install -q uvicorn[standard] fastapi
    }
    
    # Start the service in a new process
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $uvicornCmd
    $startInfo.Arguments = "$($Service.Script) --host 0.0.0.0 --port $($Service.Port) --reload"
    $startInfo.WorkingDirectory = $Service.Path
    $startInfo.UseShellExecute = $true
    $startInfo.CreateNoWindow = $false
    $startInfo.WindowStyle = "Normal"
    
    $process = [System.Diagnostics.Process]::Start($startInfo)
    
    Write-Host "  ✓ Started (PID: $($process.Id))" -ForegroundColor $Service.Color
    
    return $process
}

# Start all services
Write-Host "`nStarting services with optimizations..." -ForegroundColor Cyan
Write-Host "- Connection pooling enabled" -ForegroundColor Gray
Write-Host "- Model caching enabled" -ForegroundColor Gray
Write-Host "- Memory management optimized" -ForegroundColor Gray
Write-Host "- GPU optimizations enabled (if CUDA available)" -ForegroundColor Gray
Write-Host ""

$processes = @()
foreach ($service in $services) {
    $proc = Start-Service -Service $service
    if ($proc) {
        $processes += @{
            Name = $service.Name
            Process = $proc
            Port = $service.Port
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Services Status" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

foreach ($proc in $processes) {
    Write-Host "`n$($proc.Name):" -ForegroundColor Green
    Write-Host "  URL: http://localhost:$($proc.Port)" -ForegroundColor White
    Write-Host "  Health: http://localhost:$($proc.Port)/health" -ForegroundColor Gray
    Write-Host "  Docs: http://localhost:$($proc.Port)/docs" -ForegroundColor Gray
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Gateway Endpoints" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`nMain Gateway: http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "`nKey Endpoints:" -ForegroundColor White
Write-Host "  POST /api/create-room - Full workflow" -ForegroundColor Gray
Write-Host "  POST /api/mvp/detect - Object detection" -ForegroundColor Gray
Write-Host "  POST /api/mvp/redesign - Quick redesign" -ForegroundColor Gray

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# Wait for user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`n`nStopping all services..." -ForegroundColor Yellow
    foreach ($proc in $processes) {
        try {
            if (-not $proc.Process.HasExited) {
                $proc.Process.Kill()
                Write-Host "  ✓ Stopped $($proc.Name)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  ⚠ Failed to stop $($proc.Name): $_" -ForegroundColor Red
        }
    }
    Write-Host "`nAll services stopped." -ForegroundColor Green
}
