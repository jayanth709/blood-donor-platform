@echo off
title BloodLink Platform Launcher
echo ======================================================
echo 🩸 Starting BloodLink Emergency Response Platform...
echo ======================================================

start "BloodLink Backend (Port 5000)" cmd /k "cd /d %~dp0server && node server.js"
start "BloodLink Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Both Backend (http://localhost:5000) and Frontend (http://localhost:5173) are running!
echo You can minimize this window.
