@echo off
cd /d "%~dp0"
echo Cerrando un servidor anterior en el puerto 8765, si habia uno...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":8765 .*LISTENING"') do (
  echo  PID %%p
  taskkill /PID %%p /F >nul 2>&1
)
echo.
python serve.py
pause
