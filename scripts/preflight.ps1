Param(
  [string]$BaseUrl = $(If ($env:API_URL) { $env:API_URL } Else { "http://localhost:5000" }),
  [string]$AdminEmail = $(If ($env:ADMIN_EMAIL) { $env:ADMIN_EMAIL } Else { "taskigo.khadamati@gmail.com" }),
  [string]$AdminKey = $(If ($env:ADMIN_DIRECT_KEY) { $env:ADMIN_DIRECT_KEY } Else { "" })
)

function Show-Section($title) {
  Write-Host "`n=== $title ==="
}

function Test-Json($name, $resp, $status) {
  if (-not $resp) { Write-Host "[$name] FAIL: no response" -ForegroundColor Red; return }
  try { $json = $resp | ConvertFrom-Json } catch { Write-Host "[$name] FAIL: invalid JSON"; return }
  if ($status -ge 200 -and $status -lt 300) {
    Write-Host "[$name] PASS ($status)" -ForegroundColor Green
  } else {
    Write-Host "[$name] FAIL ($status)" -ForegroundColor Red
  }
  $json | ConvertTo-Json -Depth 6
}

Write-Host "Preflight script starting..." -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"

# Optional: direct admin login to avoid manual Bearer tokens
if (-not $AdminKey -or $AdminKey.Trim() -eq "") {
  Write-Host "ADMIN_DIRECT_KEY not set. Skipping cookie-based admin login (dev helper)." -ForegroundColor Yellow
  Write-Host "To enable: set ADMIN_DIRECT_KEY env var, or pass -AdminKey 'your-key'."
} else {
  Show-Section "Direct admin login (sets cookie)"
  $loginBody = @{ email = $AdminEmail; adminKey = $AdminKey } | ConvertTo-Json
  try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $resp = Invoke-WebRequest -Uri "$BaseUrl/api/auth/direct-admin-login" -Method POST -ContentType "application/json" -Body $loginBody -WebSession $session -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
      Write-Host "Admin cookie set in session" -ForegroundColor Green
    } else {
      Write-Host "Admin login returned status $($resp.StatusCode)" -ForegroundColor Yellow
    }
    $Global:__Session = $session
  } catch {
    Write-Host "Admin login failed: $_" -ForegroundColor Red
  }
}

Show-Section "Diagnostics: /api/diagnostics/preflight"
try {
  if ($Global:__Session) {
    $raw = Invoke-WebRequest -Uri "$BaseUrl/api/diagnostics/preflight" -WebSession $Global:__Session -UseBasicParsing
  } else {
    $raw = Invoke-WebRequest -Uri "$BaseUrl/api/diagnostics/preflight" -UseBasicParsing
  }
  Test-Json "preflight" $raw.Content $raw.StatusCode
} catch {
  Write-Host "preflight call failed: $_" -ForegroundColor Red
}

Show-Section "Health: /readyz"
try {
  $raw = Invoke-WebRequest -Uri "$BaseUrl/readyz" -UseBasicParsing
  Test-Json "readyz" $raw.Content $raw.StatusCode
} catch { Write-Host "readyz failed: $_" -ForegroundColor Red }

Show-Section "Services: /api/services"
try {
  if ($Global:__Session) {
    $raw = Invoke-WebRequest -Uri "$BaseUrl/api/services?limit=5" -WebSession $Global:__Session -UseBasicParsing
  } else {
    $raw = Invoke-WebRequest -Uri "$BaseUrl/api/services?limit=5" -UseBasicParsing
  }
  Test-Json "services" $raw.Content $raw.StatusCode
} catch { Write-Host "services failed: $_" -ForegroundColor Red }

Show-Section "Notifications (auth required): /api/notifications"
try {
  if ($Global:__Session) {
    $raw = Invoke-WebRequest -Uri "$BaseUrl/api/notifications" -WebSession $Global:__Session -UseBasicParsing
    Test-Json "notifications" $raw.Content $raw.StatusCode
  } else {
    Write-Host "Skipping notifications: no admin cookie session. Set ADMIN_DIRECT_KEY to enable." -ForegroundColor Yellow
  }
} catch { Write-Host "notifications failed: $_" -ForegroundColor Red }

Show-Section "Done"

