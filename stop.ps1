$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

$pidFile = Join-Path $PSScriptRoot ".vite-dev.pid"

if (-not (Test-Path $pidFile)) {
    Write-Host "Aucun serveur enregistre a arreter."
    exit 0
}

$rawPid = (Get-Content -Path $pidFile -Raw).Trim()
if ($rawPid -notmatch '^\d+$') {
    Write-Host "PID invalide. Nettoyage du fichier PID."
    Remove-Item -Path $pidFile -ErrorAction SilentlyContinue
    exit 0
}

$targetPid = [int]$rawPid
$proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
if ($null -eq $proc) {
    Write-Host "Le processus $targetPid n'existe plus."
    Remove-Item -Path $pidFile -ErrorAction SilentlyContinue
    exit 0
}

Write-Host "Arret du serveur (PID $targetPid)..."
Stop-Process -Id $targetPid -Force
Remove-Item -Path $pidFile -ErrorAction SilentlyContinue
Write-Host "Services projet arretes."
