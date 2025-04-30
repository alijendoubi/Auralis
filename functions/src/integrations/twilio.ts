import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as twilio from 'twilio';
import { format } from 'date-fns';

// Initialize Twilio with the credentials from environment variables
const twilioClient = twilio(
  functions.config().twilio.account_sid,
  functions.config().twilio.auth_token
);

// Create Express router
export const twilioRoutes = express.Router();

// SMS templates
const SMS_TEMPLATES = {
  APPOINTMENT_REMINDER_24H: 'Your appointment with {therapistName} is tomorrow at {time}. Reply CONFIRM to confirm or CANCEL to cancel.',
  APPOINTMENT_REMINDER_1H: 'Reminder: Your appointment with {therapistName} is in 1 hour at {time}.',
  APPOINTMENT_CONFIRMATION: 'Your appointment with {therapistName} on {date} at {time} has been confirmed.',
  APPOINTMENT_CANCELLED: 'Your appointment with {therapistName} on {date} at {time} has been cancelled.',
  APPOINTMENT_RESCHEDULED: 'Your appointment with {therapistName} has been rescheduled from {oldDate} at {oldTime} to {newDate} at {newTime}.'
};

// Send SMS reminder
export async function sendSmsReminder(reminderData: any): Promise<void> {
  try {
    const { to, appointmentDate, clientName, therapistName, reminderType } = reminderData;
    
    const formattedTime = format(appointmentDate, 'h:mm a');
    
    let messageTemplate;
    if (reminderType === '24h') {
      messageTemplate = SMS_TEMPLATES.APPOINTMENT_REMINDER_24H;
    } else {
      messageTemplate = SMS_TEMPLATES.APPOINTMENT_REMINDER_1H;
    }
    
    const message = messageTemplate
      .replace('{therapistName}', therapistName)
      .replace('{time}', formattedTime);
    
    await twilioClient.messages.create({
      body: message,
      from: functions.config().twilio.phone_number,
      to
    });
    
    console.log(`SMS reminder sent to ${to}`);
  } catch (error) {
    console.error('Error sending SMS reminder:', error);
    throw error;
  }
}

// Send appointment confirmation SMS
export async function sendAppointmentConfirmationSms(appointmentData: any): Promise<void> {
  try {
    const { clientPhone, therapistName, startTime } = appointmentData;
    
    if (!clientPhone) {
      console.log('No phone number provided for SMS confirmation');
      return;
    }
    
    const formattedDate = format(startTime.toDate(), 'MMM d');
    const formattedTime = format(startTime.toDate(), 'h:mm a');
    
    const message = SMS_TEMPLATES.APPOINTMENT_CONFIRMATION
      .replace('{therapistName}', therapistName)
      .replace('{date}', formattedDate)
      .replace('{time}', formattedTime);
    
    await twilioClient.messages.create({
      body: message,
      from: functions.config().twilio.phone_number,
      to: clientPhone
    });
    
    console.log(`Appointment confirmation SMS sent to ${clientPhone}`);
  } catch (error) {
    console.error('Error sending appointment confirmation SMS:', error);
    throw error;
  }
}

// Send appointment cancelled SMS
export async function sendAppointmentCancelledSms(appointmentData: any): Promise<void> {
  try {
    const { clientPhone, therapistName, startTime } = appointmentData;
    
    if (!clientPhone) {
      console.log('No phone number provided for SMS cancellation');
      return;
    }
    
    const formattedDate = format(startTime.toDate(), 'MMM d');
    const formattedTime = format(startTime.toDate(), 'h:mm a');
    
    const message = SMS_TEMPLATES.APPOINTMENT_CANCELLED
      .replace('{therapistName}', therapistName)
      .replace('{date}', formattedDate)
      .replace('{time}', formattedTime);
    
    await twilioClient.messages.create({
      body: message,
      from: functions.config().twilio.phone_number,
      to: clientPhone
    });
    
    console.log(`Appointment cancellation SMS sent to ${clientPhone}`);
  } catch (error) {
    console.error('Error sending appointment cancellation SMS:', error);
    throw error;
  }
}

// Send appointment rescheduled SMS
export async function sendAppointmentRescheduledSms(appointmentData: any): Promise<void> {
  try {
    const { clientPhone, therapistName, startTime, oldStartTime } = appointmentData;
    
    if (!clientPhone) {
      console.log('No phone number provided for SMS rescheduling');
      return;
    }
    
    const formattedNewDate = format(startTime.toDate(), 'MMM d');
    const formattedNewTime = format(startTime.toDate(), 'h:mm a');
    const formattedOldDate = format(oldStartTime.toDate(), 'MMM d');
    const formattedOldTime = format(oldStartTime.toDate(), 'h:mm a');
    
    const message = SMS_TEMPLATES.APPOINTMENT_RESCHEDULED
      .replace('{therapistName}', therapistName)
      .replace('{oldDate}', formattedOldDate)
      .replace('{oldTime}', formattedOldTime)
      .replace('{newDate}', formattedNewDate)
      .replace('{newTime}', formattedNewTime);
    
    await twilioClient.messages.create({
      body: message,
      from: functions.config().twilio.phone_number,
      to: clientPhone
    });
    
    console.log(`Appointment rescheduled SMS sent to ${clientPhone}`);
  } catch (error) {
    console.error('Error sending appointment rescheduled SMS:', error);
    throw error;
  }
}

// API endpoint to send a custom SMS
twilioRoutes.post('/send-sms', async (req, res) => {
  try {
    const { to, body } = req.body;
    
    if (!to || !body) {
      return res.status(400).json({ error: 'Phone number and message body are required' });
    }
    
    // Validate phone number format
    if (!to.match(/^\+[1-9]\d{1,14}$/)) {
      return res.status(400).json({ error: 'Phone number must be in E.164 format (e.g., +12125551234)' });
    }
    
    // Send SMS
    const message = await twilioClient.messages.create({
      body,
      from: functions.config().twilio.phone_number,
      to
    });
    
    return res.status(200).json({
      success: true,
      messageId: message.sid
    });
  } catch (error) {
    console.error('Error sending custom SMS:', error);
    return res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// API endpoint to verify phone number
twilioRoutes.post('/verify-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Validate phone number format
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      return res.status(400).json({ error: 'Phone number must be in E.164 format (e.g., +12125551234)' });
    }
    
    // Check if Twilio Verify is configured
    if (!functions.config().twilio.verify_service_sid) {
      // Fall back to sending a test SMS
      await twilioClient.messages.create({
        body: 'This is a test message to verify your phone number for MED Clinic.',
        from: functions.config().twilio.phone_number,
        to: phoneNumber
      });
      
      return res.status(200).json({
        success: true,
        method: 'test_sms'
      });
    }
    
    // Use Twilio Verify if available
    const verification = await twilioClient.verify.v2
      .services(functions.config().twilio.verify_service_sid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms'
      });
    
    return res.status(200).json({
      success: true,
      method: 'verify',
      status: verification.status
    });
  } catch (error) {
    console.error('Error verifying phone number:', error);
    return res.status(500).json({ error: 'Failed to verify phone number' });
  }
});

// API endpoint to check verification code
twilioRoutes.post('/check-verification', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and verification code are required' });
    }
    
    // Check if Twilio Verify is configured
    if (!functions.config().twilio.verify_service_sid) {
      return res.status(400).json({ error: 'Verification service not configured' });
    }
    
    // Check verification code
    const verification = await twilioClient.verify.v2
      .services(functions.config().twilio.verify_service_sid)
      .verificationChecks.create({
        to: phoneNumber,
        code
      });
    
    if (verification.status === 'approved') {
      return res.status(200).json({
        success: true,
        verified: true
      });
    } else {
      return res.status(200).json({
        success: true,
        verified: false,
        status: verification.status
      });
    }
  } catch (error) {
    console.error('Error checking verification code:', error);
    return res.status(500).json({ error: 'Failed to check verification code' });
  }
});

// Webhook handler for incoming SMS
export const smsWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Validate that the request is coming from Twilio
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = functions.config().app.url + req.path;
    
    const isValidRequest = twilio.validateRequest(
      functions.config().twilio.auth_token,
      twilioSignature as string,
      url,
      req.body
    );
    
    if (!isValidRequest) {
      console.error('Invalid Twilio signature');
      return res.status(403).send('Invalid signature');
    }
    
    // Process the incoming SMS
    const from = req.body.From;
    const body = req.body.Body.trim().toUpperCase();
    
    // Find client by phone number
    const clientsSnapshot = await admin.firestore()
      .collection('clients')
      .where('phone', '==', from)
      .limit(1)
      .get();
    
    if (clientsSnapshot.empty) {
      console.log(`No client found with phone number ${from}`);
      return res.status(200).send();
    }
    
    const client = clientsSnapshot.docs[0].data();
    const clientId = clientsSnapshot.docs[0].id;
    
    // Find upcoming appointments for this client
    const now = admin.firestore.Timestamp.now();
    const appointmentsSnapshot = await admin.firestore()
      .collection('appointments')
      .where('clientId', '==', clientId)
      .where('startTime', '>', now)
      .orderBy('startTime')
      .limit(1)
      .get();
    
    if (appointmentsSnapshot.empty) {
      // No upcoming appointments
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message('You have no upcoming appointments.');
      return res.status(200).type('text/xml').send(twiml.toString());
    }
    
    const appointment = appointmentsSnapshot.docs[0].data();
    const appointmentId = appointmentsSnapshot.docs[0].id;
    
    // Handle client response
    if (body === 'CONFIRM') {
      // Confirm appointment
      await admin.firestore().collection('appointments').doc(appointmentId).update({
        status: 'confirmed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message('Your appointment has been confirmed. Thank you!');
      return res.status(200).type('text/xml').send(twiml.toString());
    } else if (body === 'CANCEL') {
      // Cancel appointment
      await admin.firestore().collection('appointments').doc(appointmentId).update({
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message('Your appointment has been cancelled. Please contact us to reschedule.');
      return res.status(200).type('text/xml').send(twiml.toString());
    } else {
      // Unknown command
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message('Please reply with CONFIRM to confirm your appointment or CANCEL to cancel it.');
      return res.status(200).type('text/xml').send(twiml.toString());
    }
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    return res.status(500).send('Error processing SMS');
  }
});
