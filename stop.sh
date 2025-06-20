#!/bin/bash

# AI-Powered Learning Platform Stop Script
echo "🛑 Stopping AI-Powered Learning Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop backend server
stop_backend() {
    if [ -f backend.pid ]; then
        BACKEND_PID=$(cat backend.pid)
        print_status "Stopping backend server (PID: $BACKEND_PID)..."
        
        if kill $BACKEND_PID 2>/dev/null; then
            print_success "Backend server stopped successfully"
        else
            print_warning "Backend server was not running or already stopped"
        fi
        
        rm -f backend.pid
    else
        print_warning "Backend PID file not found"
    fi
    
    # Also try to kill any Java processes running Spring Boot
    pkill -f "spring-boot:run" 2>/dev/null && print_status "Killed any remaining Spring Boot processes"
}

# Stop frontend server
stop_frontend() {
    if [ -f frontend.pid ]; then
        FRONTEND_PID=$(cat frontend.pid)
        print_status "Stopping frontend server (PID: $FRONTEND_PID)..."
        
        if kill $FRONTEND_PID 2>/dev/null; then
            print_success "Frontend server stopped successfully"
        else
            print_warning "Frontend server was not running or already stopped"
        fi
        
        rm -f frontend.pid
    else
        print_warning "Frontend PID file not found"
    fi
    
    # Also try to kill any Node.js processes running React
    pkill -f "react-scripts start" 2>/dev/null && print_status "Killed any remaining React processes"
}

# Kill processes by port
kill_by_port() {
    # Kill process on port 8080 (backend)
    BACKEND_PROCESS=$(lsof -ti:8080 2>/dev/null)
    if [ ! -z "$BACKEND_PROCESS" ]; then
        print_status "Killing process on port 8080..."
        kill -9 $BACKEND_PROCESS 2>/dev/null
        print_success "Process on port 8080 killed"
    fi
    
    # Kill process on port 3000 (frontend)
    FRONTEND_PROCESS=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$FRONTEND_PROCESS" ]; then
        print_status "Killing process on port 3000..."
        kill -9 $FRONTEND_PROCESS 2>/dev/null
        print_success "Process on port 3000 killed"
    fi
}

# Main execution
main() {
    print_status "Shutting down AI-Powered Learning Platform..."
    
    # Stop servers using PID files
    stop_backend
    stop_frontend
    
    # Wait a moment
    sleep 2
    
    # Force kill by port if needed
    print_status "Checking for remaining processes..."
    kill_by_port
    
    # Clean up any remaining files
    rm -f backend.pid frontend.pid
    
    print_success "All servers stopped successfully!"
    echo ""
    echo "💡 To start the application again, run: ./start.sh"
    echo ""
}

# Run main function
main
