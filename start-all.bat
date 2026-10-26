@echo off
title Start TMS Entire Project
echo ====================================================
echo Starting TMS System (MongoDB, Backend, and Mobile Expo)...
echo ====================================================
start "MongoDB Server" cmd /k "d:\3rd_Sem\TMS-APP\start-mongodb.bat"
timeout /t 3 /nobreak >nul
start "TMS Backend Server" cmd /k "d:\3rd_Sem\TMS-APP\start-backend.bat"
timeout /t 3 /nobreak >nul
start "TMS Mobile App" cmd /k "d:\3rd_Sem\TMS-APP\start-mobile-iphone.bat"
echo All 3 services started in separate windows!
