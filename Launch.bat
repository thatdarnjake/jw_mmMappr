@echo off
title mmMAPPR - Faherty Family Birthday Chronicle
echo.
echo  ==========================================
echo   mmMAPPR v1
echo   The Faherty Family Birthday Chronicle
echo  ==========================================
echo.
echo  Starting server... (keep this window open)
echo  Browser will open automatically.
echo.

cd /d "%~dp0mmMAPPR"

start "" "http://localhost:5070"
dotnet run --urls "http://localhost:5070"
