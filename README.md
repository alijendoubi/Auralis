# Auralis - Mental Health SaaS Platform

A comprehensive SaaS web application for therapists and small mental health clinics.

## Features

- **Therapist Authentication**: Sign up, login, password reset with admin approval
- **Therapist Dashboard**: Overview of appointments, clients, reminders, and metrics
- **Client Management**: Add/edit client info, view history and notes
- **Booking System**: Set availability and manage appointments
- **Automated Reminders**: SMS and email reminders for appointments
- **Intake Form System**: Custom forms for client intake
- **Secure Notes**: SOAP, DAP, and custom note templates with encryption
- **Billing + Payments**: Stripe integration for subscriptions and payments
- **Reviews & Feedback**: Client satisfaction tracking
- **Admin Panel**: Manage therapists and system metrics
- **Mobile Responsive**: Optimized for all devices

## Tech Stack

- **Frontend**: Angular with Material UI
- **Backend**: Firebase Functions (serverless)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Billing**: Stripe
- **Email & SMS**: SendGrid and Twilio

## Prerequisites

- Node.js (v16+)
- npm (v8+)
- Angular CLI (v19+)
- Firebase CLI
- A Firebase project
- Stripe account
- SendGrid account
- Twilio account

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd auralis
```

### 2. Install dependencies and setup

```bash
# Option 1: Manual installation
npm install

# Option 2: Use the setup script (recommended)
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Install dependencies
- Install Angular CLI and Firebase CLI if needed
- Create environment files from templates
- Guide you through Firebase project setup

### 3. Configure Firebase

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Enable Storage
5. Update the Firebase configuration in `src/environments/environment.ts` and `src/environments/environment.prod.ts`

### 4. Configure Stripe

1. Create a Stripe account at [https://stripe.com/](https://stripe.com/)
2. Get your publishable key
3. Update the Stripe configuration in `src/environments/environment.ts` and `src/environments/environment.prod.ts`

### 5. Configure SendGrid and Twilio

1. Create accounts at [https://sendgrid.com/](https://sendgrid.com/) and [https://www.twilio.com/](https://www.twilio.com/)
2. Get your API keys
3. Update the configuration in `src/environments/environment.ts` and `src/environments/environment.prod.ts`

### 6. Set up Firebase Functions

```bash
cd functions
npm install
```

### 7. Run the application locally

```bash
ng serve
```

The application will be available at `http://localhost:4200/`

### 8. Run Firebase emulators (optional)

```bash
# Option 1: Start emulators only
firebase emulators:start

# Option 2: Use the emulators script (recommended)
chmod +x emulators.sh
./emulators.sh
```

The emulators script will:
- Check if Firebase CLI is installed
- Start Firebase emulators in a new terminal
- Start the Angular development server in another terminal
- Provide URLs for accessing both services

### 8.1. Seed the database with sample data (optional)

```bash
chmod +x seed.sh
./seed.sh
```

The seed script will:
- Check if Firebase CLI is installed
- Start Firebase emulators if not already running
- Seed the Firestore database with sample data:
  - Users (admin and therapists)
  - Clients
  - Appointments
  - Notes
  - Forms
  - Payments
  - Reviews
  - Availability
- Provide login credentials for testing

### 9. Deploy to Firebase

```bash
# Option 1: Manual deployment
ng build --configuration production
firebase deploy

# Option 2: Use the deployment script (recommended)
chmod +x deploy.sh
./deploy.sh
```

The deployment script will:
- Check if Firebase CLI is installed
- Build the application with production configuration
- Deploy to Firebase
- Provide feedback on deployment status

## Project Structure

```
auralis/
├── src/
│   ├── app/
│   │   ├── core/                 # Core functionality
│   │   │   ├── auth/             # Authentication services
│   │   │   ├── services/         # Global services
│   │   │   ├── guards/           # Route guards
│   │   │   └── models/           # Data models/interfaces
│   │   ├── shared/               # Shared components
│   │   │   ├── components/       # Reusable UI components
│   │   │   ├── directives/       # Custom directives
│   │   │   └── pipes/            # Custom pipes
│   │   ├── features/             # Feature modules
│   │   │   ├── dashboard/        # Dashboard feature
│   │   │   ├── clients/          # Client management
│   │   │   ├── appointments/     # Booking system
│   │   │   ├── forms/            # Intake forms
│   │   │   ├── notes/            # Secure notes
│   │   │   ├── billing/          # Billing & payments
│   │   │   ├── reviews/          # Reviews & feedback
│   │   │   └── admin/            # Admin panel
│   │   ├── layouts/              # Layout components
│   │   ├── app-routing.module.ts # Main routing
│   │   ├── app.component.ts      # Root component
│   │   └── app.module.ts         # Root module
│   ├── assets/                   # Static assets
│   ├── environments/             # Environment configs
│   ├── styles/                   # Global styles
│   ├── index.html                # Main HTML
│   └── main.ts                   # Entry point
├── functions/                    # Firebase Functions
│   ├── src/
│   │   ├── auth/                 # Auth triggers
│   │   ├── api/                  # API endpoints
│   │   ├── triggers/             # Firestore triggers
│   │   ├── scheduled/            # Scheduled functions
│   │   ├── integrations/         # Third-party integrations
│   │   └── index.ts              # Functions entry point
├── firestore.rules              # Firestore security rules
├── storage.rules                # Storage security rules
├── firebase.json                # Firebase configuration
└── angular.json                 # Angular configuration
```

## Testing

```bash
# Option 1: Manual testing
ng test                     # Run unit tests in watch mode
ng test --code-coverage     # Run unit tests with coverage
ng e2e                      # Run end-to-end tests
ng lint                     # Run linting

# Option 2: Use the test script (recommended)
chmod +x test.sh
./test.sh
```

The test script provides an interactive menu to:
- Run unit tests with coverage
- Run unit tests in watch mode
- Run end-to-end tests
- Run linting
- Run Firebase Functions tests
- Run all tests

## License

This project is licensed under the MIT License - see the LICENSE file for details.
