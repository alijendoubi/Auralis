# MED Clinic Firebase Functions

This directory contains the Firebase Cloud Functions for the MED Clinic application.

## Structure

- `src/auth/`: Authentication-related functions
- `src/api/`: API endpoints
- `src/triggers/`: Firestore triggers
- `src/scheduled/`: Scheduled functions
- `src/integrations/`: Third-party integrations (Stripe, SendGrid, Twilio)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up Firebase configuration:

```bash
firebase functions:config:set stripe.secret="YOUR_STRIPE_SECRET_KEY" \
                          stripe.webhook_secret="YOUR_STRIPE_WEBHOOK_SECRET" \
                          stripe.prices.basic="price_XXXXXXXXXXXX" \
                          stripe.prices.professional="price_XXXXXXXXXXXX" \
                          stripe.prices.enterprise="price_XXXXXXXXXXXX" \
                          sendgrid.api_key="YOUR_SENDGRID_API_KEY" \
                          sendgrid.from_email="noreply@example.com" \
                          twilio.account_sid="YOUR_TWILIO_ACCOUNT_SID" \
                          twilio.auth_token="YOUR_TWILIO_AUTH_TOKEN" \
                          twilio.phone_number="+1234567890" \
                          twilio.verify_service_sid="YOUR_TWILIO_VERIFY_SERVICE_SID" \
                          app.url="https://your-app-url.com"
```

3. Build the functions:

```bash
npm run build
```

## Local Development

1. Start the Firebase emulators:

```bash
firebase emulators:start
```

2. Deploy functions to the emulator:

```bash
firebase deploy --only functions --project=demo
```

## Deployment

Deploy to production:

```bash
firebase deploy --only functions
```

## Testing

Run tests:

```bash
npm test
```

## Linting

Lint the code:

```bash
npm run lint
```
