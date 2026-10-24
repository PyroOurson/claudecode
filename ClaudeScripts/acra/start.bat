@echo off
cd /d "%~dp0"
where python >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ and tick "Add python.exe to PATH". & pause & exit /b 1)
python -c "import mujoco, stable_baselines3, torch, gymnasium" >nul 2>nul || python -m pip install -r requirements.txt
python watch.py %*
pause
