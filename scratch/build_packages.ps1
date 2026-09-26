$ErrorActionPreference = 'Stop'
Write-Host "Building deployment packages..."

# 1. Modified files only package
$modDir = "temp_modified_deploy"
if (Test-Path $modDir) { Remove-Item -Recurse -Force $modDir }
New-Item -ItemType Directory -Path $modDir | Out-Null

$modFiles = @(
  "public/exercise.html",
  "public/assets/app.css",
  "netlify/functions/payment-checkout.js",
  "public/plans.html",
  "public/index.html",
  "public/admin/students.html",
  "public/profile.html",
  "public/dashboard.html",
  "netlify/functions/_lib/db.js",
  "netlify/functions/_lib/guard.js",
  "netlify/functions/me.js",
  "netlify/functions/admin-students.js"
)

foreach ($f in $modFiles) {
  $dest = Join-Path $modDir $f
  $destParent = Split-Path $dest -Parent
  if (!(Test-Path $destParent)) { New-Item -ItemType Directory -Path $destParent -Force | Out-Null }
  Copy-Item $f $dest -Force
}

$modZip = "telcvoll_modified_files_only.zip"
if (Test-Path $modZip) { Remove-Item -Force $modZip }
Compress-Archive -Path "$modDir/*" -DestinationPath $modZip -Force
Remove-Item -Recurse -Force $modDir
Write-Host "Modified files zip built: $modZip ($((Get-Item $modZip).Length) bytes)"

# 2. Full deploy zip
$fullDir = "temp_full_deploy"
if (Test-Path $fullDir) { Remove-Item -Recurse -Force $fullDir }
New-Item -ItemType Directory -Path $fullDir | Out-Null

Copy-Item -Path "public" -Destination $fullDir -Recurse -Force
Copy-Item -Path "netlify" -Destination $fullDir -Recurse -Force
if (Test-Path "package.json") { Copy-Item "package.json" $fullDir -Force }
if (Test-Path "netlify.toml") { Copy-Item "netlify.toml" $fullDir -Force }

$fullZip = "telcvoll_deploy.zip"
if (Test-Path $fullZip) { Remove-Item -Force $fullZip }
Compress-Archive -Path "$fullDir/*" -DestinationPath $fullZip -Force
Remove-Item -Recurse -Force $fullDir
Write-Host "Full deploy zip built: $fullZip ($((Get-Item $fullZip).Length) bytes)"
