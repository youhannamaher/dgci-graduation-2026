@echo off
echo ==========================================
echo 🚀 DGCI 2026 - DEPLOYMENT UTILITY
echo ==========================================
echo.
set /p msg="Enter commit description (default: 'Site update'): "
if "%msg%"=="" set msg=Site update

echo.
echo 📦 Staging changes...
git add .

echo.
echo 💾 Committing: "%msg%"...
git commit -m "%msg%"

echo.
echo 📡 Pushing to GitHub (triggers Vercel redeployment)...
git push

echo.
echo ==========================================
echo 🎉 Done! Vercel is now building your site.
echo ==========================================
pause
