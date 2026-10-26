@echo off
title TMS Mobile Expo (iPhone Tunnel Mode)
echo ====================================================
echo Starting TMS Mobile App with Expo Tunnel for iPhone!
echo Once the QR code appears:
echo 1. Open iPhone normal Camera app (do NOT scan inside Expo Go)
echo 2. Scan QR code and tap yellow 'Open in Expo Go' popup
echo ====================================================
cd /d "d:\3rd_Sem\TMS-APP\mobile"
npx expo start --tunnel
pause
