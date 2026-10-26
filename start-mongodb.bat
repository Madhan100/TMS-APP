@echo off
title MongoDB Server
echo ====================================================
echo Starting MongoDB Local Server (Port 27017)...
echo Keep this window open while using TMS App!
echo ====================================================
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "d:\3rd_Sem\TMS-APP\.mongo_data"
pause
