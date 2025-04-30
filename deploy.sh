#!/bin/bash

# MED Clinic Deployment Script

echo "Starting MED Clinic deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in to Firebase
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please log in to Firebase:"
    firebase login
fi

# Build the Angular application
echo "Building Angular application..."
ng build --configuration production

# Deploy to Firebase
echo "Deploying to Firebase..."
firebase deploy

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
    echo "Your application is now live."
else
    echo "Deployment failed. Please check the logs above for errors."
    exit 1
fi

# Optional: Open the deployed application in a browser
read -p "Would you like to open the deployed application? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase hosting:open
fi

echo "Deployment process completed."
