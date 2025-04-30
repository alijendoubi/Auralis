#!/bin/bash

# MED Clinic Firebase Emulators Script

echo "Starting MED Clinic with Firebase Emulators..."

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

# Start the emulators in one terminal
echo "Starting Firebase emulators..."
gnome-terminal -- bash -c "firebase emulators:start; read -p 'Press Enter to close...'" 2>/dev/null || \
xterm -e "firebase emulators:start; read -p 'Press Enter to close...'" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$PWD' && firebase emulators:start"' 2>/dev/null || \
start cmd /k "firebase emulators:start" 2>/dev/null || \
firebase emulators:start

# Start the Angular development server in another terminal
echo "Starting Angular development server..."
gnome-terminal -- bash -c "ng serve; read -p 'Press Enter to close...'" 2>/dev/null || \
xterm -e "ng serve; read -p 'Press Enter to close...'" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$PWD' && ng serve"' 2>/dev/null || \
start cmd /k "ng serve" 2>/dev/null || \
ng serve

echo "Development environment started!"
echo "Firebase Emulators UI: http://localhost:4000"
echo "Angular Application: http://localhost:4200"
