# Foundry Installation Script
$url = "https://github.com/foundry-rs/foundry/releases/download/nightly-87f8556c4fe89fb82f1b66c1b65d0787e1e26a09/foundry_windows_amd64.zip"
$zipFile = "$env:TEMP\foundry.zip"
$extractDir = "$env:TEMP\foundry_extract"
$installDir = "$env:USERPROFILE\.foundry\bin"

Write-Host "Downloading Foundry..." -ForegroundColor Green
try {
    Invoke-WebRequest -Uri $url -OutFile $zipFile -ErrorAction Stop
    Write-Host "Download successful" -ForegroundColor Green
}
catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Extracting..." -ForegroundColor Green
Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force

Write-Host "Creating installation directory..." -ForegroundColor Green
New-Item -ItemType Directory -Path $installDir -Force | Out-Null

Write-Host "Moving binaries..." -ForegroundColor Green
Copy-Item -Path "$extractDir\*" -Destination $installDir -Force -Recurse

Write-Host "Cleaning up temporary files..." -ForegroundColor Green
Remove-Item -Path $zipFile, $extractDir -Force -Recurse

Write-Host "`nFoundry installed to: $installDir" -ForegroundColor Green

# Update current session PATH
$env:Path = "$installDir;$env:Path"

Write-Host "Testing installation..." -ForegroundColor Green
& "$installDir\forge.exe" --version

Write-Host "`nTo permanently add Foundry to your PATH, run:" -ForegroundColor Yellow
Write-Host "[Environment]::SetEnvironmentVariable('Path', `"$installDir`";`$[Environment]::GetEnvironmentVariable('Path','User'), 'User')" -ForegroundColor Yellow
Write-Host "`nOr add the following to your PowerShell profile:" -ForegroundColor Yellow
Write-Host "`$env:Path = `"$installDir;`$env:Path`"" -ForegroundColor Yellow
