@echo off
title Super Mario World
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Instale o Node.js para abrir este site localmente: https://nodejs.org/
  pause
  exit /b 1
)
node server.mjs --open
if errorlevel 1 pause
