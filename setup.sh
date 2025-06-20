#!/bin/bash

# AI-Powered Learning Platform Setup Script
echo "🎓 AI-Powered Learning Platform Setup"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}$1${NC}"
}

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

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    print_header "Checking System Requirements"
    
    local requirements_met=true
    
    # Check Java
    if command_exists java; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
        print_success "Java found: $JAVA_VERSION"
    else
        print_error "Java not found. Please install Java 17 or higher."
        print_status "Download from: https://adoptium.net/"
        requirements_met=false
    fi
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 16 or higher."
        print_status "Download from: https://nodejs.org/"
        requirements_met=false
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: v$NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        requirements_met=false
    fi
    
    # Check Maven Wrapper
    if [ -f "./mvnw" ]; then
        print_success "Maven Wrapper found"
    else
        print_error "Maven Wrapper not found. Please ensure mvnw is in the project root."
        requirements_met=false
    fi
    
    # Check curl (for API testing)
    if command_exists curl; then
        print_success "curl found"
    else
        print_warning "curl not found. API testing will be limited."
    fi
    
    if [ "$requirements_met" = false ]; then
        print_error "Some requirements are not met. Please install the missing software and run this script again."
        exit 1
    fi
    
    print_success "All requirements met!"
    echo ""
}

# Create project structure
create_structure() {
    print_header "Creating Project Structure"
    
    print_step "Creating data directories..."
    mkdir -p data
    mkdir -p uploads/courses
    mkdir -p logs
    
    print_step "Setting up configuration files..."
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << 'EOF'
# Compiled class files
*.class
target/
*.jar
*.war
*.ear

# IDE files
.idea/
*.iml
.vscode/
.eclipse/

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
data/*.json
uploads/

# Node modules
node_modules/
npm-debug.log*

# Build outputs
build/
dist/

# Environment files
.env
.env.local

# Process IDs
*.pid
EOF
        print_success "Created .gitignore"
    fi
    
    print_success "Project structure created!"
    echo ""
}

# Setup backend
setup_backend() {
    print_header "Setting Up Backend (Spring Boot)"
    
    print_step "Making Maven Wrapper executable..."
    chmod +x mvnw
    
    print_step "Installing backend dependencies..."
    if ./mvnw clean install -DskipTests; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    print_step "Running backend tests..."
    if ./mvnw test; then
        print_success "All backend tests passed"
    else
        print_warning "Some backend tests failed, but continuing setup..."
    fi
    
    print_success "Backend setup complete!"
    echo ""
}

# Setup frontend
setup_frontend() {
    print_header "Setting Up Frontend (React)"
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found"
        exit 1
    fi
    
    cd frontend
    
    print_step "Installing frontend dependencies..."
    if npm install; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        cd ..
        exit 1
    fi
    
    print_step "Building frontend for production..."
    if npm run build; then
        print_success "Frontend built successfully"
    else
        print_warning "Frontend build failed, but continuing setup..."
    fi
    
    cd ..
    print_success "Frontend setup complete!"
    echo ""
}

# Create startup scripts
create_scripts() {
    print_header "Creating Startup Scripts"
    
    # Make scripts executable
    chmod +x start.sh
    chmod +x stop.sh
    
    print_success "Startup scripts are ready!"
    echo ""
}

# Setup environment
setup_environment() {
    print_header "Setting Up Environment"
    
    # Create environment file template
    if [ ! -f ".env.example" ]; then
        cat > .env.example << 'EOF'
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
SERVER_PORT=8080
FRONTEND_PORT=3000

# Data Storage
DATA_PATH=./data
UPLOADS_PATH=./uploads

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
EOF
        print_success "Created .env.example file"
    fi
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_warning "Created .env file from template. Please update with your actual values."
    fi
    
    print_success "Environment setup complete!"
    echo ""
}

# Validate setup
validate_setup() {
    print_header "Validating Setup"
    
    local validation_passed=true
    
    # Check if required files exist
    required_files=(
        "pom.xml"
        "src/main/java/com/learningplatform/LearningPlatformApplication.java"
        "src/main/resources/application.properties"
        "frontend/package.json"
        "frontend/src/App.js"
        "start.sh"
        "stop.sh"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file"
        else
            print_error "✗ $file (missing)"
            validation_passed=false
        fi
    done
    
    # Check directories
    required_dirs=(
        "data"
        "uploads"
        "src/main/java"
        "frontend/src"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "✓ $dir/"
        else
            print_error "✗ $dir/ (missing)"
            validation_passed=false
        fi
    done
    
    if [ "$validation_passed" = true ]; then
        print_success "All validation checks passed!"
    else
        print_error "Some validation checks failed. Please review the missing files/directories."
        exit 1
    fi
    
    echo ""
}

# Display final instructions
show_final_instructions() {
    print_header "Setup Complete! 🎉"
    
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update your Gemini API key in src/main/resources/application.properties"
    echo "2. Review and customize configuration files as needed"
    echo "3. Start the application with: ./start.sh"
    echo ""
    echo "🌐 Application URLs (after starting):"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8080/api"
    echo ""
    echo "👥 Demo Accounts:"
    echo "   Admin:      username: admin      password: admin123"
    echo "   Instructor: username: instructor password: instructor123"
    echo "   Student:    username: student    password: student123"
    echo ""
    echo "🤖 AI Features:"
    echo "   • AI Quiz Generator (requires Gemini API key)"
    echo "   • Course Summarizer"
    echo "   • IQ Assessment Tool"
    echo "   • Smart Course Recommendations"
    echo ""
    echo "📚 Documentation:"
    echo "   • README.md - Comprehensive project documentation"
    echo "   • API endpoints documented in source code"
    echo "   • Frontend components in frontend/src/components/"
    echo ""
    echo "🛠️ Development Commands:"
    echo "   • Start application: ./start.sh"
    echo "   • Stop application: ./stop.sh"
    echo "   • Backend only: ./mvnw spring-boot:run"
    echo "   • Frontend only: cd frontend && npm start"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   • Check logs in the console output"
    echo "   • Ensure ports 3000 and 8080 are available"
    echo "   • Verify Java 17+ and Node.js 16+ are installed"
    echo "   • Check Gemini API key configuration"
    echo ""
    print_success "Happy learning! 🎓"
}

# Main execution
main() {
    echo ""
    print_status "Starting setup process..."
    echo ""
    
    check_requirements
    create_structure
    setup_backend
    setup_frontend
    create_scripts
    setup_environment
    validate_setup
    show_final_instructions
}

# Handle Ctrl+C
trap 'echo ""; print_warning "Setup interrupted by user"; exit 1' INT

# Run main function
main
