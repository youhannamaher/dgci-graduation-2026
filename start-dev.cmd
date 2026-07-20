@echo off
title DGCI Graduation Ceremony 2026
echo ==========================================================
echo   DGCI Graduation Ceremony 2026 - Launching Web Platform
echo ==========================================================
echo.
echo [1/2] Opening your browser to http://localhost:3000...
start http://localhost:3000
echo.
echo [2/2] Starting local Next.js development server...
echo (Please keep this window open while viewing the website)
echo.
npm run dev
pause
