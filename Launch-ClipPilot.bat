@echo off
title ClipPilot Creator Studio
cd /d "%~dp0"

echo ============================================================
echo   ClipPilot - Personal Video & Social Media Studio
echo ============================================================
echo.

:: Check if server is responding on port 3000
curl -s -o nul http://localhost:3000
if %errorlevel% neq 0 (
    echo Starting ClipPilot local server in background...
    start /min "" cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"
    timeout /t 3 /nobreak > nul
)

:: Try opening in Microsoft Edge standalone app window
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching ClipPilot in Standalone Desktop Window Mode...
    start "" msedge --app=http://localhost:3000
    exit /b 0
)

:: Try opening in Google Chrome standalone app window
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching ClipPilot in Standalone Desktop Window Mode...
    start "" chrome --app=http://localhost:3000
    exit /b 0
)

:: Fallback to default browser
echo Opening in default browser...
start http://localhost:3000
exit /b 0
