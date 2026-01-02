param (
    [string]$BinaryName
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinariesDir = Join-Path $ScriptDir "..\binaries"
if (-not (Test-Path $BinariesDir)) {
    New-Item -ItemType Directory -Force -Path $BinariesDir | Out-Null
}

$Repo = $env:CLIPROXYAPI_REPO
if ([string]::IsNullOrEmpty($Repo)) {
    $Repo = "maozdemir/CLIProxyAPI"
}
$ApiUrl = $env:CLIPROXYAPI_API_URL
if ([string]::IsNullOrEmpty($ApiUrl)) {
    $ApiUrl = "https://api.github.com"
}

if ([string]::IsNullOrEmpty($BinaryName)) {
    $Targets = @(
        "cliproxyapi-aarch64-apple-darwin",
        "cliproxyapi-x86_64-apple-darwin",
        "cliproxyapi-x86_64-unknown-linux-gnu",
        "cliproxyapi-x86_64-pc-windows-msvc.exe"
    )
    foreach ($target in $Targets) {
        & $MyInvocation.MyCommand.Path -BinaryName $target
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Warning: Failed to download $target"
        }
    }
    exit 0
}

$Headers = @{"Accept" = "application/vnd.github+json"}
if ($env:GH_TOKEN) {
    $Headers["Authorization"] = "Bearer $($env:GH_TOKEN)"
} elseif ($env:GITHUB_TOKEN) {
    $Headers["Authorization"] = "Bearer $($env:GITHUB_TOKEN)"
}

try {
    $Release = Invoke-RestMethod -Uri "$ApiUrl/repos/$Repo/releases/latest" -Headers $Headers
} catch {
    Write-Error "Failed to fetch latest release from ${Repo}: $($_)"
    exit 1
}

$Tag = $Release.tag_name
if ([string]::IsNullOrEmpty($Tag)) {
    Write-Error "Latest release tag not found for $Repo"
    exit 1
}
$Version = $Tag -replace "^v", ""

$AssetName = ""
if ($BinaryName -match "x86_64-pc-windows-msvc") {
    $AssetName = "CLIProxyAPI_${Version}_windows_amd64.zip"
} elseif ($BinaryName -match "aarch64-pc-windows-msvc") {
    $AssetName = "CLIProxyAPI_${Version}_windows_arm64.zip"
} else {
    Write-Warning "Unsupported target for PowerShell downloader: $BinaryName"
    exit 1
}

$Url = "https://github.com/$Repo/releases/download/$Tag/$AssetName"
Write-Host "Downloading $AssetName for $BinaryName..."

$TempDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

try {
    $ZipPath = Join-Path $TempDir $AssetName
    Invoke-WebRequest -Uri $Url -Headers $Headers -OutFile $ZipPath

    $UnpackedDir = Join-Path $TempDir "unpacked"
    Expand-Archive -Path $ZipPath -DestinationPath $UnpackedDir -Force

    $Candidates = @(
        "CLIProxyAPI.exe",
        "cli-proxy-api.exe",
        "CLIProxyAPI",
        "cli-proxy-api"
    )

    $SourcePath = $null
    foreach ($candidate in $Candidates) {
        $found = Get-ChildItem -Path $UnpackedDir -Recurse -File -Filter $candidate -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $SourcePath = $found.FullName
            break
        }
    }

    if (-not $SourcePath) {
        Write-Error "Binary not found in archive"
        Get-ChildItem -Path $UnpackedDir -Recurse -File | Select-Object FullName
        exit 1
    }

    $DestPath = Join-Path $BinariesDir $BinaryName
    Copy-Item -Path $SourcePath -Destination $DestPath -Force
    Write-Host "Downloaded to $DestPath"
} catch {
    Write-Error "Failed to download or extract: $($_)"
    exit 1
} finally {
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}
