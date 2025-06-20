#!/bin/bash

# AI-Powered Learning Platform Startup Script
echo "🎓 Starting AI-Powered Learning Platform..."

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

# Check if Java is installed
check_java() {
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
        print_success "Java found: $JAVA_VERSION"
        return 0
    else
        print_error "Java not found. Please install Java 17 or higher."
        return 1
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        return 0
    else
        print_error "Node.js not found. Please install Node.js 16 or higher."
        return 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
        return 0
    else
        print_error "npm not found. Please install npm."
        return 1
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p data
    mkdir -p uploads/courses
    print_success "Directories created successfully"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    if ./mvnw clean install -DskipTests; then
        print_success "Backend dependencies installed successfully"
        return 0
    else
        print_error "Failed to install backend dependencies"
        return 1
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend
    if npm install; then
        print_success "Frontend dependencies installed successfully"
        cd ..
        return 0
    else
        print_error "Failed to install frontend dependencies"
        cd ..
        return 1
    fi
}

# Start backend server
start_backend() {
    print_status "Starting Spring Boot backend server..."
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    print_success "Backend server started with PID: $BACKEND_PID"
    print_status "Backend server will be available at: http://localhost:8080"
}

# Start frontend server
start_frontend() {
    print_status "Starting React frontend server..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    cd ..
    print_success "Frontend server started with PID: $FRONTEND_PID"
    print_status "Frontend server will be available at: http://localhost:3000"
}

# Wait for servers to start
wait_for_servers() {
    print_status "Waiting for servers to start..."
    sleep 10
    
    # Check if backend is running
    if curl -s http://localhost:8080/api/auth/validate > /dev/null 2>&1; then
        print_success "Backend server is running"
    else
        print_warning "Backend server might still be starting..."
    fi
    
    # Check if frontend is running
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend server is running"
    else
        print_warning "Frontend server might still be starting..."
    fi
}

# Display startup information
show_startup_info() {
    echo ""
    echo "🎉 AI-Powered Learning Platform is starting up!"
    echo ""
    echo "📚 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8080/api"
    echo ""
    echo "👥 Demo Accounts:"
    echo "   Admin:      username: admin      password: admin123"
    echo "   Instructor: username: instructor password: instructor123"
    echo "   Student:    username: student    password: student123"
    echo ""
    echo "🤖 AI Features:"
    echo "   • AI Quiz Generator"
    echo "   • Course Summarizer"
    echo "   • IQ Assessment Tool"
    echo "   • Smart Recommendations"
    echo ""
    echo "📁 Data Storage:"
    echo "   • User data: ./data/users.json"
    echo "   • Course data: ./data/courses.json"
    echo "   • Progress data: ./data/progress.json"
    echo "   • Uploads: ./uploads/"
    echo ""
    echo "🛑 To stop the servers, run: ./stop.sh"
    echo ""
}

# Main execution
main() {
    echo "🚀 AI-Powered Learning Platform Setup"
    echo "======================================"
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    if ! check_java || ! check_node || ! check_npm; then
        print_error "Prerequisites not met. Please install the required software."
        exit 1
    fi
    
    # Create directories
    create_directories
    
    # Install dependencies
    print_status "Installing dependencies..."
    if ! install_backend_deps; then
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    if ! install_frontend_deps; then
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    # Start servers
    print_status "Starting servers..."
    start_backend
    sleep 5  # Give backend time to start
    start_frontend
    
    # Wait and check
    wait_for_servers
    
    # Show information
    show_startup_info
    
    print_success "Setup complete! The application should be accessible in your browser."
    print_status "Press Ctrl+C to stop the servers, or run ./stop.sh"
    
    # Keep script running
    wait
}

# Handle Ctrl+C
trap 'echo ""; print_status "Shutting down servers..."; ./stop.sh; exit 0' INT

# Run main function
main
