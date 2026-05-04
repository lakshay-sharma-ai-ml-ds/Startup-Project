@echo off
echo.
echo   ======================================
echo     AI Sheriff -- Audit. Comply. Trust.
echo   ======================================
echo.

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Install from python.org
    pause & exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from nodejs.org
    pause & exit /b 1
)

if "%ANTHROPIC_API_KEY%"=="" (
    echo WARNING: ANTHROPIC_API_KEY is not set.
    echo   Set it with: set ANTHROPIC_API_KEY=sk-ant-...
    echo   Audit engine will use simulated results without it.
    echo.
)

echo [1/4] Setting up Python virtual environment...
cd backend
if not exist venv python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt -q
echo       Done.

echo [2/4] Starting backend server...
start "AI Sheriff Backend" cmd /c "call venv\Scripts\activate.bat && python main.py"
echo       Backend starting at http://localhost:8000

echo [3/4] Installing frontend dependencies...
cd ..\frontend
call npm install --silent
echo       Done.

echo [4/4] Starting frontend...
echo.
echo   App:      http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
echo   Press Ctrl+C to stop the frontend.
echo   Close the backend window separately.
echo.
call npm run dev

pause