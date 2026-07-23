$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

$pidFile = Join-Path $PSScriptRoot ".vite-dev.pid"
$logFile = Join-Path $PSScriptRoot ".vite-dev.log"
$errLogFile = Join-Path $PSScriptRoot ".vite-dev.err.log"

if (Test-Path $pidFile) {
    $existingPid = (Get-Content -Path $pidFile -Raw).Trim()
    if ($existingPid -match '^\d+$') {
        $running = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue
        if ($null -ne $running) {
            Write-Host "Serveur deja en cours (PID $existingPid)."
            Write-Host "Ouvrir: http://localhost:5173/"
            exit 0
        }
    }
    Remove-Item -Path $pidFile -ErrorAction SilentlyContinue
}

Write-Host "Demarrage du serveur Vite..."

$proc = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList "run dev" `
    -WorkingDirectory $PSScriptRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $logFile `
    -RedirectStandardError $errLogFile `
    -PassThru

Set-Content -Path $pidFile -Value $proc.Id -NoNewline

Write-Host "Serveur lance (PID $($proc.Id))."
Write-Host "URL: http://localhost:5173/"
Write-Host "Utiliser stop.bat pour tout arreter."
