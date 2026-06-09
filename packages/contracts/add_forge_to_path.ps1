# Agregar Foundry permanentemente al PATH del sistema Windows

$foundryBin = "$env:USERPROFILE\.foundry\bin"

# Verificar si el directorio existe
if (-not (Test-Path $foundryBin)) {
    Write-Host "ERROR: Foundry no encontrado en $foundryBin" -ForegroundColor Red
    Write-Host "Por favor, instala Foundry primero" -ForegroundColor Yellow
    exit 1
}

Write-Host "Agregando Foundry al PATH del sistema..." -ForegroundColor Green
Write-Host "Ruta: $foundryBin" -ForegroundColor Cyan

# Obtener el PATH actual del sistema
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

# Verificar si ya está en el PATH
if ($currentPath -like "*$foundryBin*") {
    Write-Host "Foundry ya está en el PATH del sistema" -ForegroundColor Yellow
    exit 0
}

# Agregar al PATH (requiere permisos de administrador)
try {
    $newPath = "$foundryBin;$currentPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
    Write-Host "✓ Agregado exitosamente al PATH del sistema" -ForegroundColor Green
    Write-Host "`nAhora debes:" -ForegroundColor Yellow
    Write-Host "  1. Cerrar PowerShell/Terminal completamente" -ForegroundColor White
    Write-Host "  2. Abrir una nueva terminal" -ForegroundColor White
    Write-Host "  3. Ejecutar: forge --version" -ForegroundColor White
}
catch {
    Write-Host "ERROR: No se pudo modificar el PATH" -ForegroundColor Red
    Write-Host "Necesitas ejecutar PowerShell como ADMINISTRADOR" -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
