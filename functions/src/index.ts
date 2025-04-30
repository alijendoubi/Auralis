import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import * as authFunctions from './auth';
import * as apiFunctions from './api';
import * as triggerFunctions from './triggers';
import * as scheduledFunctions from './scheduled';

// Export all functions
export const auth = authFunctions;
export const api = apiFunctions;
export const triggers = triggerFunctions;
export const scheduled = scheduledFunctions;

// Health check endpoint
export const healthCheck = functions.https.onRequest((request, response) => {
  response.status(200).send({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
