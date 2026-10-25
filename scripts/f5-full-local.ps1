# HIGHFLY F5 FULL LOCAL — Windows 10/11, no redistribution of upstream assets.
# Keep this script in the HIGHFLY-FOUNDATION repository under scripts/.
param()
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $here
$checkout = Join-Path $projectRoot ".highfly-local\world-of-claudecraft-0447"
$upstream = "https://github.com/levy-street/world-of-claudecraft.git"
$expected = "493c35a108cef6c8aa290e8793107b1cd117886e"
function Require-Command([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Necesitas instalar $name para usar F5 local. No se modifico la version publica."
  }
}
Require-Command "git"
Require-Command "node"
Require-Command "corepack"
$nodeVersion = & node -p "Number(process.versions.node.split('.')[0])"
if ([int]$nodeVersion -lt 22) { throw "F5 requiere Node.js 22 o superior." }
Write-Host "HIGHFLY F5 — Preparando el mundo original completo (LOCAL)" -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $checkout ".git"))) {
  if (Test-Path $checkout) { throw "La carpeta destino existe y no es un repositorio Git: $checkout" }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $checkout) | Out-Null
  & git clone --depth 1 --branch v0.44.7 --single-branch $upstream $checkout
  if ($LASTEXITCODE -ne 0) { throw "No se pudo obtener WOC 0.44.7." }
}
$origin = (& git -C $checkout config --get remote.origin.url).Trim()
if ($origin -ne $upstream) { throw "Origen incorrecto: $origin. No se tocara ese repositorio." }
$head = (& git -C $checkout rev-parse HEAD).Trim()
if ($head -ne $expected) { throw "Version distinta de 0.44.7: $head. Para proteger tus archivos no hago reset automatico." }
if (-not (Test-Path (Join-Path $checkout "CREDITS.md"))) { throw "No estan los creditos originales." }
$env:ELECTRON_SKIP_BINARY_DOWNLOAD = "1"
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1"
$env:PUPPETEER_SKIP_DOWNLOAD = "1"
& corepack enable
if ($LASTEXITCODE -ne 0) { throw "No se pudo habilitar Corepack." }
& corepack prepare pnpm@10.34.5 --activate
if ($LASTEXITCODE -ne 0) { throw "No se pudo preparar pnpm." }
Push-Location $checkout
try {
  & corepack pnpm install --frozen-lockfile
  if ($LASTEXITCODE -ne 0) { throw "Fallo pnpm install. Revisa memoria/espacio y registro de errores." }
} finally { Pop-Location }
& node (Join-Path $here "f5-install-local-launcher.mjs") $checkout
if ($LASTEXITCODE -ne 0) { throw "No se pudo crear el lanzador local." }
Write-Host ""
Write-Host "F5 ORIGINAL + editor disponibles EN ESTA COMPUTADORA:" -ForegroundColor Green
Write-Host "PC: http://localhost:5173/highfly-f5-local.html"
try {
  $ips = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop | Where-Object {
    $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)' -and $_.PrefixOrigin -ne "WellKnown"
  } | Select-Object -ExpandProperty IPAddress -Unique)
  foreach ($ip in $ips) { Write-Host "Celular MISMA WIFI: http://${ip}:5173/highfly-f5-local.html" }
} catch { Write-Host "Para el celular, usa la IP local IPv4 de Windows (ipconfig)." }
Write-Host "Entra al mundo original y selecciona OFFLINE."
Write-Host "Windows puede preguntar si permites el acceso por la red privada."
Write-Host "CTRL+C detiene el servidor. No se publica nada en Internet."
Write-Host "ATENCION: el Hunter universal y FURY aun no estan integrados en este modo."
Push-Location $checkout
try {
  & corepack pnpm run dev --host 0.0.0.0 --port 5173 --strictPort
} finally { Pop-Location }
