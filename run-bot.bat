@echo off
title RITATION_BOT
cd /d %~dp0

echo --------------------------------------
echo     Menjalankan RITATION BOT...
echo --------------------------------------

:: Install dependencies kalau belum
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: Bikin folder cache lokal
set LOCAL_CACHE_DIR=%cd%\electron-cache
if not exist "%LOCAL_CACHE_DIR%" mkdir "%LOCAL_CACHE_DIR%"

:: Jalankan Electron di background, lalu tutup CMD
start "" node_modules\.bin\electron main.js ^
  --user-data-dir="%LOCAL_CACHE_DIR%" ^
  --disk-cache-dir="%LOCAL_CACHE_DIR%" ^
  --disable-gpu ^
  --disable-gpu-shader-disk-cache

exit
