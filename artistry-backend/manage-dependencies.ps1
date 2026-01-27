# ============================================
# DEPENDENCY CHECK AND OPTIMIZATION SCRIPT
# Checks and optimizes dependencies in all service venvs
# ============================================

param(
    [switch]$Install,
    [switch]$Update,
    [switch]$Clean
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Artistry Backend - Dependency Manager" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$BASE_DIR = $PSScriptRoot

# Service directories with venv
$services = @(
    @{Name = "Gateway"; Path = "$BASE_DIR\gateway"},
    @{Name = "Detect"; Path = "$BASE_DIR\detect"},
    @{Name = "Segment"; Path = "$BASE_DIR\segment"},
    @{Name = "Generate"; Path = "$BASE_DIR\generate"},
    @{Name = "Advise"; Path = "$BASE_DIR\advise"},
    @{Name = "Commerce"; Path = "$BASE_DIR\commerce"}
)

function Test-VenvExists {
    param($ServicePath)
    $venvPath = Join-Path $ServicePath "venv"
    return Test-Path "$venvPath\Scripts\python.exe"
}

function Create-Venv {
    param($ServicePath, $ServiceName)
    
    Write-Host "  Creating virtual environment..." -ForegroundColor Yellow
    $venvPath = Join-Path $ServicePath "venv"
    
    try {
        python -m venv $venvPath
        Write-Host "  ✓ Virtual environment created" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ✗ Failed to create venv: $_" -ForegroundColor Red
        return $false
    }
}

function Install-Requirements {
    param($ServicePath, $ServiceName)
    
    $venvPath = Join-Path $ServicePath "venv"
    $pythonExe = "$venvPath\Scripts\python.exe"
    $pipExe = "$venvPath\Scripts\pip.exe"
    $reqFile = Join-Path $ServicePath "requirements.txt"
    
    if (-not (Test-Path $reqFile)) {
        Write-Host "  ⚠ No requirements.txt found" -ForegroundColor Yellow
        return
    }
    
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    
    # Upgrade pip first
    & $pythonExe -m pip install --upgrade pip setuptools wheel -q
    
    # Install requirements
    & $pipExe install -r $reqFile -q
    
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
}

function Show-InstalledPackages {
    param($ServicePath, $ServiceName)
    
    $venvPath = Join-Path $ServicePath "venv"
    $pipExe = "$venvPath\Scripts\pip.exe"
    
    Write-Host "  Installed packages:" -ForegroundColor Cyan
    & $pipExe list --format=columns
}

function Clean-Cache {
    param($ServicePath)
    
    $venvPath = Join-Path $ServicePath "venv"
    $pythonExe = "$venvPath\Scripts\python.exe"
    
    Write-Host "  Cleaning pip cache..." -ForegroundColor Yellow
    & $pythonExe -m pip cache purge
    Write-Host "  ✓ Cache cleaned" -ForegroundColor Green
}

# Main logic
foreach ($service in $services) {
    Write-Host "`n[$($service.Name)]" -ForegroundColor Cyan
    Write-Host "Path: $($service.Path)" -ForegroundColor Gray
    
    # Check if service directory exists
    if (-not (Test-Path $service.Path)) {
        Write-Host "  ⚠ Service directory not found" -ForegroundColor Yellow
        continue
    }
    
    # Check if venv exists
    $venvExists = Test-VenvExists -ServicePath $service.Path
    
    if (-not $venvExists) {
        Write-Host "  ⚠ Virtual environment not found" -ForegroundColor Yellow
        
        if ($Install) {
            if (Create-Venv -ServicePath $service.Path -ServiceName $service.Name) {
                Install-Requirements -ServicePath $service.Path -ServiceName $service.Name
            }
        } else {
            Write-Host "  Use -Install flag to create venv and install dependencies" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✓ Virtual environment exists" -ForegroundColor Green
        
        if ($Install) {
            Install-Requirements -ServicePath $service.Path -ServiceName $service.Name
        }
        
        if ($Update) {
            Write-Host "  Updating dependencies..." -ForegroundColor Yellow
            Install-Requirements -ServicePath $service.Path -ServiceName $service.Name
        }
        
        if ($Clean) {
            Clean-Cache -ServicePath $service.Path
        }
        
        if (-not ($Install -or $Update -or $Clean)) {
            $venvPath = Join-Path $service.Path "venv"
            $pythonExe = "$venvPath\Scripts\python.exe"
            $pythonVersion = & $pythonExe --version
            Write-Host "  Python: $pythonVersion" -ForegroundColor Gray
        }
    }
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (-not ($Install -or $Update -or $Clean)) {
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\manage-dependencies.ps1 -Install  # Create venvs and install dependencies" -ForegroundColor Gray
    Write-Host "  .\manage-dependencies.ps1 -Update   # Update existing dependencies" -ForegroundColor Gray
    Write-Host "  .\manage-dependencies.ps1 -Clean    # Clean pip caches" -ForegroundColor Gray
} else {
    Write-Host "Done! You can now start the services:" -ForegroundColor Green
    Write-Host "  .\start-optimized-services.ps1" -ForegroundColor White
}

Write-Host ""
