#!/bin/bash

# MED Clinic Setup Script

echo "Starting MED Clinic setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js before continuing."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm not found. Please install npm before continuing."
    exit 1
fi

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "Angular CLI not found. Installing..."
    npm install -g @angular/cli
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if environment files exist
if [ ! -f "src/environments/environment.ts" ]; then
    echo "Creating environment.ts file..."
    cp src/environments/environment.example.ts src/environments/environment.ts
    echo "Please update src/environments/environment.ts with your configuration."
fi

if [ ! -f "src/environments/environment.prod.ts" ]; then
    echo "Creating environment.prod.ts file..."
    cp src/environments/environment.example.ts src/environments/environment.prod.ts
    sed -i 's/production: false/production: true/g' src/environments/environment.prod.ts
    echo "Please update src/environments/environment.prod.ts with your production configuration."
fi

# Setup Firebase project
echo "Do you want to set up a new Firebase project? (y/n)"
read -r setup_firebase

if [[ $setup_firebase =~ ^[Yy]$ ]]; then
    # Check if user is logged in to Firebase
    firebase projects:list > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Please log in to Firebase:"
        firebase login
    fi
    
    echo "Creating a new Firebase project..."
    echo "Please enter a project name (e.g., med-clinic):"
    read -r project_name
    
    firebase projects:create $project_name
    
    echo "Initializing Firebase features..."
    firebase init --project $project_name hosting firestore storage functions
    
    echo "Firebase project setup complete!"
fi

# Setup Firebase Functions
echo "Setting up Firebase Functions..."
cd functions && npm install && cd ..

echo "Setup complete!"
echo "You can now run the application with: ng serve"
echo "To deploy the application, run: ./deploy.sh"
