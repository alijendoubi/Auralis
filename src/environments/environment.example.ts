export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'your-project-id.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID'
  },
  stripe: {
    publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',
    prices: {
      basic: 'price_XXXXXXXXXXXX',
      professional: 'price_XXXXXXXXXXXX',
      enterprise: 'price_XXXXXXXXXXXX'
    }
  },
  sendgrid: {
    apiKey: 'YOUR_SENDGRID_API_KEY'
  },
  twilio: {
    accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
    authToken: 'YOUR_TWILIO_AUTH_TOKEN',
    phoneNumber: 'YOUR_TWILIO_PHONE_NUMBER',
    verifyServiceSid: 'YOUR_TWILIO_VERIFY_SERVICE_SID'
  },
  app: {
    name: 'MED Clinic',
    url: 'http://localhost:4200',
    apiUrl: 'http://localhost:5001/your-project-id/us-central1/api'
  }
};
