#!/bin/bash

# MED Clinic Test Script

echo "Running MED Clinic tests..."

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "Angular CLI not found. Installing..."
    npm install -g @angular/cli
fi

# Function to run tests with coverage
run_tests_with_coverage() {
    echo "Running tests with coverage..."
    ng test --code-coverage --watch=false
    
    # Open coverage report if tests pass
    if [ $? -eq 0 ]; then
        echo "Tests passed! Opening coverage report..."
        
        # Try to open coverage report with the appropriate command based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open coverage/med-clinic/index.html 2>/dev/null || \
            echo "Coverage report available at: $(pwd)/coverage/med-clinic/index.html"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            open coverage/med-clinic/index.html 2>/dev/null || \
            echo "Coverage report available at: $(pwd)/coverage/med-clinic/index.html"
        elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
            start coverage/med-clinic/index.html 2>/dev/null || \
            echo "Coverage report available at: $(pwd)/coverage/med-clinic/index.html"
        else
            echo "Coverage report available at: $(pwd)/coverage/med-clinic/index.html"
        fi
    else
        echo "Tests failed. Please check the output above for details."
    fi
}

# Function to run tests in watch mode
run_tests_watch_mode() {
    echo "Running tests in watch mode..."
    ng test
}

# Function to run end-to-end tests
run_e2e_tests() {
    echo "Running end-to-end tests..."
    ng e2e
}

# Function to run linting
run_lint() {
    echo "Running linting..."
    ng lint
}

# Function to run Firebase Functions tests
run_functions_tests() {
    echo "Running Firebase Functions tests..."
    cd functions && npm test
}

# Main menu
echo "Please select an option:"
echo "1) Run unit tests with coverage"
echo "2) Run unit tests in watch mode"
echo "3) Run end-to-end tests"
echo "4) Run linting"
echo "5) Run Firebase Functions tests"
echo "6) Run all tests"
echo "q) Quit"

read -p "Enter your choice: " choice

case $choice in
    1)
        run_tests_with_coverage
        ;;
    2)
        run_tests_watch_mode
        ;;
    3)
        run_e2e_tests
        ;;
    4)
        run_lint
        ;;
    5)
        run_functions_tests
        ;;
    6)
        run_lint
        run_tests_with_coverage
        run_e2e_tests
        run_functions_tests
        ;;
    q|Q)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option. Exiting..."
        exit 1
        ;;
esac

echo "Test script completed."
