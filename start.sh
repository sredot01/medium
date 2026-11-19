#!/bin/bash

################################################################################
# TechBlog Application Launcher (Shell Script)
# 
# Professional startup script for Unix-based systems (Linux/macOS)
# 
# Usage:
#   ./start.sh              # Start both servers
#   ./start.sh backend      # Start backend only
#   ./start.sh frontend     # Start frontend only
#   ./start.sh --help       # Show help
#
# Requirements:
#   - Node.js and npm installed
#   - Dependencies installed (npm install in backend/ and frontend/)
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# PID files
BACKEND_PID=""
FRONTEND_PID=""

################################################################################
# Functions
################################################################################

print_banner() {
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${BOLD}  TechBlog Application Launcher${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${BLUE}📂 Root Directory:${NC} $SCRIPT_DIR"
    echo -e "${BLUE}🔧 Backend:${NC} http://localhost:5000"
    echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:3000"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
}

print_help() {
    echo "Usage: ./start.sh [option]"
    echo ""
    echo "Options:"
    echo "  (none)      Start both backend and frontend servers"
    echo "  backend     Start backend server only"
    echo "  frontend    Start frontend server only"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh              # Start everything"
    echo "  ./start.sh backend      # Backend only"
    echo "  ./start.sh frontend     # Frontend only"
    echo ""
}

check_dependencies() {
    echo -e "${CYAN}🔍 Checking dependencies...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED} Error: Node.js is not installed!${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED} Error: npm is not installed!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"
    echo -e "${GREEN}✅ npm $(npm --version) found${NC}"
}

check_directories() {
    echo -e "${CYAN}🔍 Verifying directories...${NC}"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED} Error: backend directory not found!${NC}"
        exit 1
    fi
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED} Error: frontend directory not found!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Directories verified${NC}"
}

check_node_modules() {
    local missing=()
    
    if [ ! -d "$BACKEND_DIR/node_modules" ]; then
        missing+=("backend")
    fi
    
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        missing+=("frontend")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Warning: Missing node_modules in: ${missing[*]}${NC}"
        echo -n "Install dependencies now? (y/n): "
        read -r response
        
        if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
            for dir in "${missing[@]}"; do
                install_dependencies "$dir"
            done
        else
            echo -e "${RED} Cannot start without dependencies${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Dependencies verified${NC}"
    fi
}

install_dependencies() {
    local target=$1
    local target_dir="$SCRIPT_DIR/$target"
    
    echo -e "${CYAN}📦 Installing $target dependencies...${NC}"
    cd "$target_dir"
    
    if npm install; then
        echo -e "${GREEN}✅ $target dependencies installed${NC}"
    else
        echo -e "${RED} Failed to install $target dependencies${NC}"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
}

start_backend() {
    echo -e "\n${CYAN}🚀 Starting backend server...${NC}"
    cd "$BACKEND_DIR"
    
    # Start backend in background
    node server.js &
    BACKEND_PID=$!
    
    echo -e "${GREEN}✅ Backend server starting on http://localhost:5000 (PID: $BACKEND_PID)${NC}"
    cd "$SCRIPT_DIR"
}

start_frontend() {
    echo -e "\n${CYAN}🚀 Starting frontend server...${NC}"
    cd "$FRONTEND_DIR"
    
    # Set environment to prevent browser auto-open
    export BROWSER=none
    
    # Start frontend in background
    npm start &
    FRONTEND_PID=$!
    
    echo -e "${GREEN}✅ Frontend server starting on http://localhost:3000 (PID: $FRONTEND_PID)${NC}"
    cd "$SCRIPT_DIR"
}

cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    
    if [ -n "$BACKEND_PID" ] && ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${CYAN}🔄 Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    if [ -n "$FRONTEND_PID" ] && ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${CYAN}🔄 Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    
    echo -e "\n${GREEN}👋 Application stopped successfully${NC}"
    exit 0
}

monitor_processes() {
    echo -e "\n${YELLOW}============================================================${NC}"
    echo -e "${GREEN}✨ Application is running!${NC}"
    echo -e "${BLUE}🔗 Open http://localhost:3000 in your browser${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
    echo -e "${YELLOW}============================================================${NC}\n"
    
    # Wait for processes
    wait
}

################################################################################
# Main Script
################################################################################

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Parse arguments
MODE="${1:-all}"

case "$MODE" in
    --help|-h|help)
        print_help
        exit 0
        ;;
    backend)
        print_banner
        check_dependencies
        check_directories
        check_node_modules
        start_backend
        monitor_processes
        ;;
    frontend)
        print_banner
        check_dependencies
        check_directories
        check_node_modules
        start_frontend
        monitor_processes
        ;;
    all|"")
        print_banner
        check_dependencies
        check_directories
        check_node_modules
        start_backend
        sleep 2  # Give backend time to start
        start_frontend
        monitor_processes
        ;;
    *)
        echo -e "${RED} Error: Unknown option '$MODE'${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac

