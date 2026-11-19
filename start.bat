@echo off
REM ============================================================================
REM TechBlog Application Launcher (Windows Batch Script)
REM 
REM Professional startup script for Windows systems
REM 
REM Usage:
REM   start.bat              - Start both servers
REM   start.bat backend      - Start backend only
REM   start.bat frontend     - Start frontend only
REM   start.bat help         - Show help
REM
REM Requirements:
REM   - Node.js and npm installed
REM   - Dependencies installed (npm install in backend\ and frontend\)
REM ============================================================================

setlocal enabledelayedexpansion

REM Script directory
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"

REM Parse arguments
set "MODE=%~1"
if "%MODE%"=="" set "MODE=all"

if /I "%MODE%"=="help" goto :show_help
if /I "%MODE%"=="--help" goto :show_help
if /I "%MODE%"=="-h" goto :show_help
if /I "%MODE%"=="backend" goto :backend_only
if /I "%MODE%"=="frontend" goto :frontend_only
if /I "%MODE%"=="all" goto :start_all

REM Invalid argument
echo [91mError: Unknown option '%MODE%'[0m
echo.
goto :show_help

:show_help
echo ============================================================
echo   TechBlog Application Launcher
echo ============================================================
echo.
echo Usage: start.bat [option]
echo.
echo Options:
echo   (none)      Start both backend and frontend servers
echo   backend     Start backend server only
echo   frontend    Start frontend server only
echo   help        Show this help message
echo.
echo Examples:
echo   start.bat              - Start everything
echo   start.bat backend      - Backend only
echo   start.bat frontend     - Frontend only
echo.
exit /b 0

:start_all
call :print_banner
call :check_dependencies
call :check_directories
call :check_node_modules

REM Kill any existing Node processes on ports
echo [93mChecking for processes on ports 3000 and 5000...[0m
call :kill_port_process 5000
call :kill_port_process 3000

REM Start both servers
echo.
echo [96m============================================================[0m
echo [92mStarting TechBlog Application...[0m
echo [96m============================================================[0m
echo.

REM Create a new window for backend
start "TechBlog Backend" /D "%BACKEND_DIR%" cmd /k "echo [96mTechBlog Backend Server[0m && echo [92mStarting on http://localhost:5000[0m && echo. && node server.js"

REM Wait a bit for backend to start
echo [93mWaiting for backend to initialize...[0m
timeout /t 3 /nobreak >nul

REM Create a new window for frontend
start "TechBlog Frontend" /D "%FRONTEND_DIR%" cmd /k "echo [96mTechBlog Frontend Server[0m && echo [92mStarting on http://localhost:3000[0m && echo. && set BROWSER=none && npm start"

echo.
echo [92m============================================================[0m
echo [92m  Application Started Successfully![0m
echo [92m============================================================[0m
echo.
echo [96mBackend:[0m  http://localhost:5000
echo [96mFrontend:[0m http://localhost:3000
echo.
echo [93mOpen http://localhost:3000 in your browser[0m
echo.
echo [93mTwo new windows have been opened:[0m
echo   1. TechBlog Backend  - Backend server
echo   2. TechBlog Frontend - Frontend server
echo.
echo [93mTo stop the servers, close both windows or press Ctrl+C in each.[0m
echo [92m============================================================[0m
echo.

pause
exit /b 0

:backend_only
call :print_banner
call :check_dependencies
call :check_directories
call :check_node_modules

echo.
echo [96mStarting Backend Server Only...[0m
echo.

cd /d "%BACKEND_DIR%"
call :kill_port_process 5000

echo [92mStarting backend on http://localhost:5000[0m
echo [93mPress Ctrl+C to stop[0m
echo.

node server.js
exit /b 0

:frontend_only
call :print_banner
call :check_dependencies
call :check_directories
call :check_node_modules

echo.
echo [96mStarting Frontend Server Only...[0m
echo.

cd /d "%FRONTEND_DIR%"
call :kill_port_process 3000

echo [92mStarting frontend on http://localhost:3000[0m
echo [93mPress Ctrl+C to stop[0m
echo.

set BROWSER=none
npm start
exit /b 0

:print_banner
cls
echo [96m============================================================[0m
echo [1m  TechBlog Application Launcher[0m
echo [96m============================================================[0m
echo [94mRoot Directory:[0m %SCRIPT_DIR%
echo [94mBackend:[0m        http://localhost:5000
echo [94mFrontend:[0m       http://localhost:3000
echo [96m============================================================[0m
echo.
exit /b 0

:check_dependencies
echo [96mChecking dependencies...[0m

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [91mError: Node.js is not installed![0m
    echo [93mPlease install Node.js from https://nodejs.org/[0m
    pause
    exit /b 1
)

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [91mError: npm is not installed![0m
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo [92mNode.js %NODE_VERSION% found[0m
echo [92mnpm %NPM_VERSION% found[0m
exit /b 0

:check_directories
echo [96mVerifying directories...[0m

if not exist "%BACKEND_DIR%" (
    echo [91mError: backend directory not found![0m
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo [91mError: frontend directory not found![0m
    pause
    exit /b 1
)

echo [92mDirectories verified[0m
exit /b 0

:check_node_modules
set "MISSING="

if not exist "%BACKEND_DIR%\node_modules" (
    set "MISSING=!MISSING! backend"
)

if not exist "%FRONTEND_DIR%\node_modules" (
    set "MISSING=!MISSING! frontend"
)

if not "!MISSING!"=="" (
    echo [93mWarning: Missing node_modules in:!MISSING![0m
    echo.
    set /p "INSTALL=Install dependencies now? (y/n): "
    
    if /I "!INSTALL!"=="y" (
        call :install_dependencies
    ) else (
        echo [91mCannot start without dependencies[0m
        pause
        exit /b 1
    )
) else (
    echo [92mDependencies verified[0m
)
exit /b 0

:install_dependencies
if not exist "%BACKEND_DIR%\node_modules" (
    echo [96mInstalling backend dependencies...[0m
    cd /d "%BACKEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo [91mFailed to install backend dependencies[0m
        pause
        exit /b 1
    )
    echo [92mBackend dependencies installed[0m
)

if not exist "%FRONTEND_DIR%\node_modules" (
    echo [96mInstalling frontend dependencies...[0m
    cd /d "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo [91mFailed to install frontend dependencies[0m
        pause
        exit /b 1
    )
    echo [92mFrontend dependencies installed[0m
)

cd /d "%SCRIPT_DIR%"
exit /b 0

:kill_port_process
set "PORT=%~1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    if not "!PID!"=="" (
        echo [93mKilling process on port %PORT% (PID: !PID!)...[0m
        taskkill /F /PID !PID! >nul 2>nul
    )
)
exit /b 0

