#!/usr/bin/env python3
"""
TechBlog Application Launcher
==============================
Professional script to start both backend and frontend servers concurrently.

Usage:
    python start.py              # Start both servers
    python start.py --backend    # Start backend only
    python start.py --frontend   # Start frontend only
    python start.py --help       # Show help

Requirements:
    - Node.js installed
    - npm packages installed in backend and frontend directories
"""

import subprocess
import sys
import os
import time
import argparse
from pathlib import Path
import signal
import platform

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class AppLauncher:
    def __init__(self):
        self.root_dir = Path(__file__).parent.absolute()
        self.backend_dir = self.root_dir / 'backend'
        self.frontend_dir = self.root_dir / 'frontend'
        self.processes = []

    def print_banner(self):
        """Print application banner"""
        banner = f"""
{Colors.CYAN}{'='*60}
{Colors.BOLD}  TechBlog Application Launcher{Colors.ENDC}
{Colors.CYAN}{'='*60}{Colors.ENDC}
{Colors.BLUE}📂 Root Directory:{Colors.ENDC} {self.root_dir}
{Colors.BLUE}🔧 Backend:{Colors.ENDC} http://localhost:5000
{Colors.BLUE}🌐 Frontend:{Colors.ENDC} http://localhost:3000
{Colors.CYAN}{'='*60}{Colors.ENDC}
"""
        print(banner)

    def check_directories(self):
        """Verify required directories exist"""
        if not self.backend_dir.exists():
            print(f"{Colors.RED} Error: 'backend' directory not found!{Colors.ENDC}")
            sys.exit(1)
        
        if not self.frontend_dir.exists():
            print(f"{Colors.RED} Error: 'frontend' directory not found!{Colors.ENDC}")
            sys.exit(1)
        
        print(f"{Colors.GREEN}✅ Directories verified{Colors.ENDC}")

    def check_dependencies(self):
        """Check if node_modules exist"""
        backend_modules = self.backend_dir / 'node_modules'
        frontend_modules = self.frontend_dir / 'node_modules'
        
        missing = []
        if not backend_modules.exists():
            missing.append('backend')
        if not frontend_modules.exists():
            missing.append('frontend')
        
        if missing:
            print(f"{Colors.YELLOW}⚠️  Warning: Missing node_modules in: {', '.join(missing)}{Colors.ENDC}")
            response = input(f"{Colors.BOLD}Install dependencies now? (y/n): {Colors.ENDC}").lower()
            if response == 'y':
                self.install_dependencies(missing)
            else:
                print(f"{Colors.RED} Cannot start without dependencies{Colors.ENDC}")
                sys.exit(1)
        else:
            print(f"{Colors.GREEN}✅ Dependencies verified{Colors.ENDC}")

    def install_dependencies(self, targets):
        """Install npm dependencies"""
        for target in targets:
            target_dir = self.backend_dir if target == 'backend' else self.frontend_dir
            print(f"{Colors.CYAN}📦 Installing {target} dependencies...{Colors.ENDC}")
            
            try:
                subprocess.run(
                    ['npm', 'install'],
                    cwd=target_dir,
                    check=True,
                    shell=platform.system() == 'Windows'
                )
                print(f"{Colors.GREEN}✅ {target.capitalize()} dependencies installed{Colors.ENDC}")
            except subprocess.CalledProcessError as e:
                print(f"{Colors.RED} Failed to install {target} dependencies{Colors.ENDC}")
                sys.exit(1)

    def start_backend(self):
        """Start the backend server"""
        print(f"\n{Colors.CYAN}🚀 Starting backend server...{Colors.ENDC}")
        try:
            process = subprocess.Popen(
                ['node', 'server.js'],
                cwd=self.backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=platform.system() == 'Windows',
                text=True
            )
            self.processes.append(('backend', process))
            print(f"{Colors.GREEN}✅ Backend server starting on http://localhost:5000{Colors.ENDC}")
            return process
        except Exception as e:
            print(f"{Colors.RED} Failed to start backend: {e}{Colors.ENDC}")
            return None

    def start_frontend(self):
        """Start the frontend server"""
        print(f"\n{Colors.CYAN}🚀 Starting frontend server...{Colors.ENDC}")
        try:
            # Set environment variable to avoid browser auto-open
            env = os.environ.copy()
            env['BROWSER'] = 'none'
            
            process = subprocess.Popen(
                ['npm', 'start'],
                cwd=self.frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=platform.system() == 'Windows',
                env=env,
                text=True
            )
            self.processes.append(('frontend', process))
            print(f"{Colors.GREEN}✅ Frontend server starting on http://localhost:3000{Colors.ENDC}")
            return process
        except Exception as e:
            print(f"{Colors.RED} Failed to start frontend: {e}{Colors.ENDC}")
            return None

    def monitor_processes(self):
        """Monitor running processes and handle output"""
        print(f"\n{Colors.YELLOW}{'='*60}{Colors.ENDC}")
        print(f"{Colors.GREEN}✨ Application is running!{Colors.ENDC}")
        print(f"{Colors.BLUE}🔗 Open http://localhost:3000 in your browser{Colors.ENDC}")
        print(f"{Colors.YELLOW}Press Ctrl+C to stop all servers{Colors.ENDC}")
        print(f"{Colors.YELLOW}{'='*60}{Colors.ENDC}\n")

        try:
            while True:
                # Check if any process has died
                for name, process in self.processes:
                    if process.poll() is not None:
                        print(f"{Colors.RED} {name.capitalize()} process terminated unexpectedly{Colors.ENDC}")
                        self.cleanup()
                        sys.exit(1)
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}🛑 Shutting down servers...{Colors.ENDC}")
            self.cleanup()

    def cleanup(self):
        """Clean up running processes"""
        for name, process in self.processes:
            if process.poll() is None:
                print(f"{Colors.CYAN}🔄 Stopping {name}...{Colors.ENDC}")
                process.terminate()
                try:
                    process.wait(timeout=5)
                    print(f"{Colors.GREEN}✅ {name.capitalize()} stopped{Colors.ENDC}")
                except subprocess.TimeoutExpired:
                    print(f"{Colors.YELLOW}⚠️  Force killing {name}...{Colors.ENDC}")
                    process.kill()
        
        print(f"\n{Colors.GREEN}👋 Application stopped successfully{Colors.ENDC}")

    def run(self, backend_only=False, frontend_only=False):
        """Main run method"""
        self.print_banner()
        self.check_directories()
        self.check_dependencies()

        if backend_only:
            self.start_backend()
        elif frontend_only:
            self.start_frontend()
        else:
            self.start_backend()
            time.sleep(2)  # Give backend time to start
            self.start_frontend()

        self.monitor_processes()

def main():
    """Entry point"""
    parser = argparse.ArgumentParser(
        description='TechBlog Application Launcher',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python start.py              Start both backend and frontend
  python start.py --backend    Start backend only
  python start.py --frontend   Start frontend only
        """
    )
    
    parser.add_argument(
        '--backend',
        action='store_true',
        help='Start backend server only'
    )
    
    parser.add_argument(
        '--frontend',
        action='store_true',
        help='Start frontend server only'
    )

    args = parser.parse_args()

    # Handle signal interrupts gracefully
    launcher = AppLauncher()
    
    def signal_handler(sig, frame):
        launcher.cleanup()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    if platform.system() != 'Windows':
        signal.signal(signal.SIGTERM, signal_handler)

    launcher.run(
        backend_only=args.backend,
        frontend_only=args.frontend
    )

if __name__ == '__main__':
    main()

