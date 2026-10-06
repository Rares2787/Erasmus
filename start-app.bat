@echo off
title LER EduShare — Sistem Didactic
cd /d "%~dp0"
echo ========================================================
echo  LER EduShare — Lansare Server Local React (Vite)
echo ========================================================
echo.
echo Se deschide browserul la http://localhost:3000 ...
timeout /t 2 /nobreak >nul
start http://localhost:3000
npm run dev
pause
