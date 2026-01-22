# Quick Start - All MVP Services
# Runs all 5 services in separate background jobs

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Starting All MVP Services..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseDir = "f:\Projects\Artistry\Artistry-Redesign\artistry-backend"

# Define services
$services = @(
    @{ Name = "Gateway"; Port = 8000; Path = "gateway" },
    @{ Name = "Detect"; Port = 8001; Path = "detect" },
    @{ Name = "Segment"; Port = 8002; Path = "segment" },
    @{ Name = "Advise"; Port = 8003; Path = "advise" },
    @{ Name = "Generate"; Port = 8004; Path = "generate" }
)

# Start each service
foreach ($service in $services) {
    Write-Host "Starting $($service.Name) on port $($service.Port)..." -NoNewline
    
    $scriptBlock = {
        param($path, $port)
        Set-Location $path
        & ".\venv\Scripts\Activate.ps1"
        uvicorn app.main:app --port $port --reload
    }
    
    $jobName = "Artistry-$($service.Name)"
    
    # Stop existing job if running
    Get-Job -Name $jobName -ErrorAction SilentlyContinue | Stop-Job | Remove-Job
    
    # Start new job
    Start-Job -Name $jobName -ScriptBlock $scriptBlock -ArgumentList "$baseDir\$($service.Path)", $service.Port | Out-Null
    
    Start-Sleep -Seconds 2
    Write-Host " ✅" -ForegroundColor Green
}

Write-Host "`n⏳ Waiting for services to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Health check
Write-Host "`n🏥 Health Check:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "Checking $($service.Name)..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$($service.Port)/health" -Method Get -TimeoutSec 5
        Write-Host " ✅ RUNNING" -ForegroundColor Green
    } catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
    }
}

Write-Host "`n📋 Running Jobs:" -ForegroundColor Cyan
Get-Job | Where-Object { $_.Name -like "Artistry-*" } | Format-Table Name, State

Write-Host "`n💡 Useful Commands:" -ForegroundColor Yellow
Write-Host "  • Get-Job                    - View all jobs" -ForegroundColor Gray
Write-Host "  • Receive-Job -Name <name>  - View job output" -ForegroundColor Gray
Write-Host "  • Stop-Job -Name <name>     - Stop a service" -ForegroundColor Gray
Write-Host "  • Get-Job | Stop-Job        - Stop all services`n" -ForegroundColor Gray
