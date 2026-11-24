@echo off
title Smart Dukaan - 1-Click Launcher
color 0b

echo ===================================================
echo              SMART DUKAAN LAUNCHER
echo    Digital Kirana POS & Free WhatsApp Billing
echo ===================================================
echo.
echo [1/3] Starting Backend Server (Port 5000)...
start "Smart Dukaan - Backend" cmd /k "cd /d ""%~dp0server"" && npm run dev"

echo [2/3] Starting Frontend Client (Port 5173)...
start "Smart Dukaan - Frontend" cmd /k "cd /d ""%~dp0client"" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul 2>&1

echo.
echo Launching Smart Dukaan in your default browser...
start http://localhost:5173

echo.
echo ===================================================
echo  Smart Dukaan is now up and running!
echo  - Frontend Web UI : http://localhost:5173
echo  - Backend API     : http://localhost:5000
echo  - Demo Login      : 9999988888 / test1234
echo ===================================================
echo.
echo NOTE: Keep the two server terminal windows open.
echo Press any key to close this launcher...
pause >nul
