@echo off
title Bruce Trail Progress Tracker
cd /d "%~dp0"
echo Starting Bruce Trail Progress Tracker...
echo.
echo Opening browser in a few seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
npm run dev
