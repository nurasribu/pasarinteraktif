@echo off
rem Build Windows .exe (run on the Windows venue machine).
rem Output: dist\PasarInteraktif.exe
cd /d "%~dp0"

if not exist .venv-win python -m venv .venv-win
call .venv-win\Scripts\activate.bat

python -m pip install --upgrade pip
pip install -r requirements.txt pyinstaller

pyinstaller --noconfirm --onefile --windowed ^
  --name PasarInteraktif ^
  --add-data "assets;assets" ^
  main.py

echo.
echo DONE: dist\PasarInteraktif.exe
pause
