# F5: compilacion local privada, nunca adjuntar ni distribuir el APK.
# Requiere haber ejecutado una vez scripts/f5-full-local.ps1 (detener servidor con Ctrl+C).
param()
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $here
$woc = Join-Path $projectRoot ".highfly-local\world-of-claudecraft-0447"
$expected = "493c35a108cef6c8aa290e8793107b1cd117886e"
function Need([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name no esta instalado. Revisar docs/F5-ANDROID-LOCAL.md"
  }
}
Need "git"
Need "node"
Need "corepack"
Need "java"
if (-not (Test-Path (Join-Path $woc ".git"))) {
  throw "Primero ejecuta scripts/f5-full-local.ps1; ese paso descarga y prepara el original."
}
if ((& git -C $woc rev-parse HEAD).Trim() -ne $expected) {
  throw "Commit WOC no coincide con 0.44.7 exacto. No construire otro codigo."
}
if (-not (Test-Path (Join-Path $woc "CREDITS.md"))) { throw "CREDITS.md no disponible." }
if (-not ($env:ANDROID_HOME -or $env:ANDROID_SDK_ROOT)) {
  throw "Se requiere Android SDK; configura ANDROID_HOME o ANDROID_SDK_ROOT."
}
Write-Host "F5 EXPERIMENTAL: build privado en ESTE equipo. No compartir APK." -ForegroundColor Yellow
Write-Host "No hay garantia de funcionamiento ni offline completo de todos los subsistemas."
$env:ELECTRON_SKIP_BINARY_DOWNLOAD = "1"
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1"
$env:PUPPETEER_SKIP_DOWNLOAD = "1"
& node (Join-Path $here "f5-install-local-launcher.mjs") $woc
if ($LASTEXITCODE -ne 0) { throw "Fallo el lanzador F5." }
& node (Join-Path $here "f5-wire-native-hud.mjs") $woc
if ($LASTEXITCODE -ne 0) { throw "Fallo el puente HUD sobre WOC." }
& node (Join-Path $here "f5-android-private-config.mjs") $woc
if ($LASTEXITCODE -ne 0) { throw "Fallo el aislamiento APK privado." }
Push-Location $woc
try {
  & corepack pnpm install --frozen-lockfile
  if ($LASTEXITCODE -ne 0) { throw "pnpm install fallo." }
  # Original native build and Capacitor workflow, with native duplicate-media pruning.
  $env:VITE_NATIVE_APP = "1"
  $env:VITE_API_ORIGIN = "https://localhost.invalid"
  & corepack pnpm run build
  if ($LASTEXITCODE -ne 0) { throw "WOC native web build fallo." }
  & node scripts/build_media_manifest.mjs prune
  if ($LASTEXITCODE -ne 0) { throw "Fallo prune de medios." }
  & corepack pnpm exec cap sync android
  if ($LASTEXITCODE -ne 0) { throw "Capacitor Android sync fallo." }
  Push-Location android
  try {
    & .\gradlew.bat :app:assemblePlayDebug --no-daemon
    if ($LASTEXITCODE -ne 0) { throw "Gradle Android APK fallo." }
  } finally { Pop-Location }
  $apk = Join-Path $woc "android\app\build\outputs\apk\play\debug\app-play-debug.apk"
  if (-not (Test-Path $apk)) { throw "No se encontro APK tras compilar: $apk" }
  $dest = Join-Path $projectRoot ".highfly-local\private-test-output"
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  $target = Join-Path $dest "HIGHFLY-F5-PRIVATE-LOCAL-TEST.apk"
  Copy-Item $apk $target -Force
  Write-Host "APK de prueba creado LOCALMENTE: $target" -ForegroundColor Green
  Write-Host "PRIVADO: no redistribuir, ni subir a Releases, Pages o servicios de archivos."
  Write-Host "Seleccionar modo Offline; otros modos pueden depender de servicios originales."
} finally { Pop-Location }
