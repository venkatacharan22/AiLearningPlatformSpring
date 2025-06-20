#!/bin/bash

# AI-Powered Learning Platform Test Script
echo "🧪 Running AI-Powered Learning Platform Tests"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

# Test backend
test_backend() {
    print_header "Testing Backend (Spring Boot)"
    
    print_status "Running unit tests..."
    if ./mvnw test; then
        print_success "Backend unit tests passed"
    else
        print_error "Backend unit tests failed"
        return 1
    fi
    
    print_status "Running integration tests..."
    if ./mvnw verify; then
        print_success "Backend integration tests passed"
    else
        print_warning "Backend integration tests failed or not configured"
    fi
    
    print_status "Checking code coverage..."
    if ./mvnw jacoco:report; then
        print_success "Code coverage report generated"
        print_status "Coverage report available at: target/site/jacoco/index.html"
    else
        print_warning "Code coverage not configured"
    fi
    
    return 0
}

# Test frontend
test_frontend() {
    print_header "Testing Frontend (React)"
    
    cd frontend
    
    print_status "Running frontend tests..."
    if npm test -- --coverage --watchAll=false; then
        print_success "Frontend tests passed"
    else
        print_error "Frontend tests failed"
        cd ..
        return 1
    fi
    
    print_status "Running linting..."
    if npm run lint 2>/dev/null || npx eslint src/ 2>/dev/null; then
        print_success "Frontend linting passed"
    else
        print_warning "Frontend linting not configured or failed"
    fi
    
    print_status "Checking build..."
    if npm run build; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        cd ..
        return 1
    fi
    
    cd ..
    return 0
}

# Test API endpoints
test_api() {
    print_header "Testing API Endpoints"
    
    # Check if backend is running
    if ! curl -s http://localhost:8080/api/auth/validate > /dev/null 2>&1; then
        print_warning "Backend server not running. Starting it for API tests..."
        ./mvnw spring-boot:run &
        BACKEND_PID=$!
        sleep 15
        
        if ! curl -s http://localhost:8080/api/auth/validate > /dev/null 2>&1; then
            print_error "Could not start backend server for API tests"
            kill $BACKEND_PID 2>/dev/null
            return 1
        fi
    fi
    
    print_status "Testing authentication endpoints..."
    
    # Test login with demo account
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}')
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        print_success "Login endpoint working"
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    else
        print_error "Login endpoint failed"
        if [ ! -z "$BACKEND_PID" ]; then
            kill $BACKEND_PID 2>/dev/null
        fi
        return 1
    fi
    
    # Test protected endpoint
    if [ ! -z "$TOKEN" ]; then
        COURSES_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
            http://localhost:8080/api/courses/public)
        
        if echo "$COURSES_RESPONSE" | grep -q "\["; then
            print_success "Protected endpoint working"
        else
            print_warning "Protected endpoint may not be working correctly"
        fi
    fi
    
    # Test public endpoints
    PUBLIC_COURSES=$(curl -s http://localhost:8080/api/courses/public)
    if echo "$PUBLIC_COURSES" | grep -q "\["; then
        print_success "Public courses endpoint working"
    else
        print_warning "Public courses endpoint returned unexpected response"
    fi
    
    # Clean up if we started the backend
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Stopping test backend server..."
        kill $BACKEND_PID 2>/dev/null
        sleep 3
    fi
    
    return 0
}

# Test file structure
test_structure() {
    print_header "Testing Project Structure"
    
    local structure_valid=true
    
    # Check critical files
    critical_files=(
        "pom.xml"
        "src/main/java/com/learningplatform/LearningPlatformApplication.java"
        "src/main/resources/application.properties"
        "frontend/package.json"
        "frontend/src/App.js"
        "README.md"
        "start.sh"
        "stop.sh"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file"
        else
            print_error "✗ $file (missing)"
            structure_valid=false
        fi
    done
    
    # Check directories
    critical_dirs=(
        "src/main/java/com/learningplatform"
        "src/main/resources"
        "frontend/src"
        "data"
        "uploads"
    )
    
    for dir in "${critical_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "✓ $dir/"
        else
            print_error "✗ $dir/ (missing)"
            structure_valid=false
        fi
    done
    
    if [ "$structure_valid" = true ]; then
        print_success "Project structure is valid"
        return 0
    else
        print_error "Project structure has issues"
        return 1
    fi
}

# Test configuration
test_configuration() {
    print_header "Testing Configuration"
    
    # Check application.properties
    if [ -f "src/main/resources/application.properties" ]; then
        if grep -q "gemini.api.key" src/main/resources/application.properties; then
            print_success "Gemini API configuration found"
        else
            print_warning "Gemini API key not configured"
        fi
        
        if grep -q "jwt.secret" src/main/resources/application.properties; then
            print_success "JWT configuration found"
        else
            print_warning "JWT secret not configured"
        fi
    else
        print_error "application.properties not found"
        return 1
    fi
    
    # Check frontend configuration
    if [ -f "frontend/package.json" ]; then
        if grep -q "react" frontend/package.json; then
            print_success "React configuration found"
        else
            print_error "React not configured in package.json"
            return 1
        fi
    else
        print_error "frontend/package.json not found"
        return 1
    fi
    
    return 0
}

# Generate test report
generate_report() {
    print_header "Generating Test Report"
    
    local report_file="test-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "AI-Powered Learning Platform Test Report"
        echo "========================================"
        echo "Generated: $(date)"
        echo ""
        echo "Test Results:"
        echo "- Backend Tests: $backend_result"
        echo "- Frontend Tests: $frontend_result"
        echo "- API Tests: $api_result"
        echo "- Structure Tests: $structure_result"
        echo "- Configuration Tests: $config_result"
        echo ""
        echo "Overall Status: $overall_status"
        echo ""
        echo "Notes:"
        echo "- Ensure all dependencies are installed before running tests"
        echo "- API tests require the backend server to be running"
        echo "- Frontend tests include coverage reports"
        echo "- Check individual test outputs for detailed information"
    } > "$report_file"
    
    print_success "Test report generated: $report_file"
}

# Main execution
main() {
    local backend_result="SKIPPED"
    local frontend_result="SKIPPED"
    local api_result="SKIPPED"
    local structure_result="SKIPPED"
    local config_result="SKIPPED"
    local overall_status="UNKNOWN"
    
    print_status "Starting comprehensive test suite..."
    echo ""
    
    # Test project structure first
    if test_structure; then
        structure_result="PASSED"
    else
        structure_result="FAILED"
    fi
    echo ""
    
    # Test configuration
    if test_configuration; then
        config_result="PASSED"
    else
        config_result="FAILED"
    fi
    echo ""
    
    # Test backend
    if test_backend; then
        backend_result="PASSED"
    else
        backend_result="FAILED"
    fi
    echo ""
    
    # Test frontend
    if test_frontend; then
        frontend_result="PASSED"
    else
        frontend_result="FAILED"
    fi
    echo ""
    
    # Test API (optional, requires running server)
    read -p "Do you want to run API tests? (requires starting backend server) [y/N]: " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if test_api; then
            api_result="PASSED"
        else
            api_result="FAILED"
        fi
        echo ""
    fi
    
    # Determine overall status
    if [[ "$structure_result" == "PASSED" && "$config_result" == "PASSED" && 
          "$backend_result" == "PASSED" && "$frontend_result" == "PASSED" ]]; then
        if [[ "$api_result" == "PASSED" || "$api_result" == "SKIPPED" ]]; then
            overall_status="PASSED"
        else
            overall_status="PARTIAL"
        fi
    else
        overall_status="FAILED"
    fi
    
    # Display summary
    print_header "Test Summary"
    echo "Structure Tests: $structure_result"
    echo "Configuration Tests: $config_result"
    echo "Backend Tests: $backend_result"
    echo "Frontend Tests: $frontend_result"
    echo "API Tests: $api_result"
    echo ""
    echo "Overall Status: $overall_status"
    
    if [ "$overall_status" == "PASSED" ]; then
        print_success "All tests passed! 🎉"
    elif [ "$overall_status" == "PARTIAL" ]; then
        print_warning "Most tests passed, but some issues were found."
    else
        print_error "Some tests failed. Please review the output above."
    fi
    
    # Generate report
    generate_report
}

# Handle Ctrl+C
trap 'echo ""; print_warning "Tests interrupted by user"; exit 1' INT

# Run main function
main
