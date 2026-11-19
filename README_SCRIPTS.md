# TechBlog Application Launcher Scripts

Professional startup scripts to run the TechBlog application with both backend and frontend servers.

## 📋 Available Scripts

### 1. **Python Script** (`start.py`)
Cross-platform Python script with advanced features.

**Requirements:**
- Python 3.6+
- Node.js and npm installed

**Usage:**
```bash
# Start both servers
python start.py

# Start backend only
python start.py --backend

# Start frontend only
python start.py --frontend

# Show help
python start.py --help
```

**Features:**
- ✅ Cross-platform (Windows, Linux, macOS)
- ✅ Colored output for better readability
- ✅ Automatic dependency checking
- ✅ Interactive dependency installation
- ✅ Graceful shutdown with Ctrl+C
- ✅ Process monitoring
- ✅ Comprehensive error handling

---

### 2. **Shell Script** (`start.sh`)
Bash script for Unix-based systems (Linux/macOS).

**Requirements:**
- Bash shell
- Node.js and npm installed

**Setup:**
```bash
# Make script executable (first time only)
chmod +x start.sh
```

**Usage:**
```bash
# Start both servers
./start.sh

# Start backend only
./start.sh backend

# Start frontend only
./start.sh frontend

# Show help
./start.sh --help
```

**Features:**
- ✅ Native Unix/Linux/macOS support
- ✅ Colored terminal output
- ✅ Automatic dependency checking
- ✅ Process monitoring with PIDs
- ✅ Clean shutdown with signal handling
- ✅ Interactive dependency installation

---

### 3. **Batch Script** (`start.bat`)
Windows batch file for Windows systems.

**Requirements:**
- Windows OS
- Node.js and npm installed

**Usage:**
```batch
REM Start both servers (opens 2 new windows)
start.bat

REM Start backend only
start.bat backend

REM Start frontend only
start.bat frontend

REM Show help
start.bat help
```

**Features:**
- ✅ Native Windows support
- ✅ Colored console output (ANSI colors)
- ✅ Automatic port cleanup (kills existing processes)
- ✅ Opens separate windows for backend and frontend
- ✅ Interactive dependency installation
- ✅ Comprehensive error handling

---

## 🚀 Quick Start

### Windows Users:
```batch
start.bat
```

### Linux/macOS Users:
```bash
chmod +x start.sh  # First time only
./start.sh
```

### Python Users (All Platforms):
```bash
python start.py
```

---

## 🔧 What the Scripts Do

1. **Check Dependencies**
   - Verify Node.js and npm are installed
   - Check if backend and frontend directories exist

2. **Install Missing Packages**
   - Detect if `node_modules` are missing
   - Offer to install dependencies automatically

3. **Start Servers**
   - **Backend**: Node.js server on `http://localhost:5000`
   - **Frontend**: React development server on `http://localhost:3000`

4. **Monitor Processes**
   - Keep both servers running
   - Handle graceful shutdown on Ctrl+C
   - Clean up processes properly

---

## 📂 Project Structure

```
TechBlog/
├── backend/              # Backend Node.js server
│   ├── server.js        # Entry point
│   ├── package.json     # Backend dependencies
│   └── ...
├── frontend/            # Frontend React app
│   ├── package.json    # Frontend dependencies
│   ├── src/            # React source files
│   └── ...
├── start.py            # Python launcher script
├── start.sh            # Shell launcher script (Linux/macOS)
├── start.bat           # Batch launcher script (Windows)
└── README_SCRIPTS.md   # This file
```

---

## 🌐 Application URLs

Once started, access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🛑 Stopping the Application

### Python Script:
Press `Ctrl+C` in the terminal - the script will gracefully shut down both servers.

### Shell Script:
Press `Ctrl+C` in the terminal - the script will stop both processes and clean up.

### Batch Script:
- **If running in separate windows**: Close each window or press `Ctrl+C` in each.
- **If running in single window**: Press `Ctrl+C`.

---

## ⚠️ Troubleshooting

### Port Already in Use

**Problem**: Error message about port 3000 or 5000 already in use.

**Solution (Windows)**:
```batch
netstat -ano | findstr :5000
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>
```

**Solution (Linux/macOS)**:
```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**Solution (Using Scripts)**:
The `start.bat` script automatically kills processes on ports. Python and Shell scripts will notify you of the conflict.

---

### Missing Dependencies

**Problem**: `node_modules` not found.

**Solution**: The scripts will prompt you to install them automatically. If you prefer manual installation:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

### Node.js Not Found

**Problem**: Scripts report Node.js is not installed.

**Solution**: Install Node.js from [https://nodejs.org/](https://nodejs.org/)

After installation, restart your terminal and try again.

---

## 🎨 Script Features Comparison

| Feature | Python | Shell | Batch |
|---------|--------|-------|-------|
| Windows Support | ✅ | ❌ | ✅ |
| Linux Support | ✅ | ✅ | ❌ |
| macOS Support | ✅ | ✅ | ❌ |
| Colored Output | ✅ | ✅ | ✅ |
| Auto Dependency Check | ✅ | ✅ | ✅ |
| Interactive Install | ✅ | ✅ | ✅ |
| Graceful Shutdown | ✅ | ✅ | ⚠️ |
| Process Monitoring | ✅ | ✅ | ⚠️ |
| Command Line Args | ✅ | ✅ | ✅ |
| Separate Windows | ❌ | ❌ | ✅ |

**Legend:**
- ✅ Full support
- ⚠️ Partial support
- ❌ Not supported

---

## 💡 Recommended Script by Platform

- **Windows**: Use `start.bat` for native experience (separate windows)
- **Linux**: Use `start.sh` for optimal performance
- **macOS**: Use `start.sh` or `start.py`
- **Cross-platform development**: Use `start.py` for consistency

---

## 📝 Notes

1. **First Run**: Scripts will check for dependencies and offer to install them.
2. **Environment Variables**: The frontend's browser auto-open is disabled to prevent multiple tabs.
3. **Background Processes**: Python and Shell scripts run both servers in the same terminal. Batch script opens separate windows.
4. **Error Handling**: All scripts include comprehensive error checking and helpful error messages.

---

## 🔒 Security Notes

- Scripts only run local Node.js processes
- No external network connections required (except npm during install)
- All processes run with your user permissions
- No sudo/admin rights needed

---

## 📞 Support

If you encounter issues:

1. Check that Node.js and npm are installed: `node --version` and `npm --version`
2. Verify you're in the project root directory
3. Ensure `backend/` and `frontend/` directories exist
4. Try manual installation: `cd backend && npm install && cd ../frontend && npm install`

---

## 🎉 Enjoy Your TechBlog Application!

Your application is now ready to run with professional launcher scripts. Choose the one that best fits your platform and workflow!

