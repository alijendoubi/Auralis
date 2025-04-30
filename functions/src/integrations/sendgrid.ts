import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as sgMail from '@sendgrid/mail';
import { format } from 'date-fns';

// Initialize SendGrid with the API key from environment variables
sgMail.setApiKey(functions.config().sendgrid.api_key);

// Create Express router
export const sendgridRoutes = express.Router();

// Email templates
const EMAIL_TEMPLATES = {
  APPOINTMENT_CONFIRMATION: 'd-appointment-confirmation-template-id',
  APPOINTMENT_REMINDER: 'd-appointment-reminder-template-id',
  APPOINTMENT_CANCELLED: 'd-appointment-cancelled-template-id',
  APPOINTMENT_RESCHEDULED: 'd-appointment-rescheduled-template-id',
  WELCOME_EMAIL: 'd-welcome-email-template-id',
  PASSWORD_RESET: 'd-password-reset-template-id',
  ACCOUNT_APPROVED: 'd-account-approved-template-id',
  PAYMENT_RECEIPT: 'd-payment-receipt-template-id',
  FORM_SUBMISSION: 'd-form-submission-template-id'
};

// Send welcome email to new users
export async function sendWelcomeEmail(userData: any): Promise<void> {
  try {
    const msg = {
      to: userData.email,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.WELCOME_EMAIL,
      dynamicTemplateData: {
        name: userData.displayName || 'Therapist',
        loginUrl: `${functions.config().app.url}/auth/login`
      }
    };
    
    await sgMail.send(msg);
    console.log(`Welcome email sent to ${userData.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

// Send account approved email
export async function sendAccountApprovedEmail(userData: any): Promise<void> {
  try {
    const msg = {
      to: userData.email,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.ACCOUNT_APPROVED,
      dynamicTemplateData: {
        name: userData.displayName || 'Therapist',
        loginUrl: `${functions.config().app.url}/auth/login`
      }
    };
    
    await sgMail.send(msg);
    console.log(`Account approved email sent to ${userData.email}`);
  } catch (error) {
    console.error('Error sending account approved email:', error);
    throw error;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
  try {
    const msg = {
      to: email,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.PASSWORD_RESET,
      dynamicTemplateData: {
        resetLink
      }
    };
    
    await sgMail.send(msg);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Send appointment confirmation email
export async function sendAppointmentConfirmation(appointmentData: any): Promise<void> {
  try {
    const { clientEmail, clientName, therapistName, startTime, endTime, location } = appointmentData;
    
    const formattedDate = format(startTime.toDate(), 'EEEE, MMMM d, yyyy');
    const formattedStartTime = format(startTime.toDate(), 'h:mm a');
    const formattedEndTime = format(endTime.toDate(), 'h:mm a');
    
    const msg = {
      to: clientEmail,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.APPOINTMENT_CONFIRMATION,
      dynamicTemplateData: {
        clientName,
        therapistName,
        appointmentDate: formattedDate,
        appointmentTime: `${formattedStartTime} - ${formattedEndTime}`,
        location: location || 'Online Session',
        cancelUrl: `${functions.config().app.url}/client/appointments`
      }
    };
    
    await sgMail.send(msg);
    console.log(`Appointment confirmation email sent to ${clientEmail}`);
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
}

// Send appointment reminder email
export async function sendAppointmentReminder(reminderData: any): Promise<void> {
  try {
    const { to, appointmentDate, clientName, therapistName, reminderType } = reminderData;
    
    const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
    const formattedTime = format(appointmentDate, 'h:mm a');
    
    const msg = {
      to,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.APPOINTMENT_REMINDER,
      dynamicTemplateData: {
        clientName,
        therapistName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        reminderType: reminderType === '24h' ? '24 hours' : '1 hour',
        rescheduleUrl: `${functions.config().app.url}/client/appointments`
      }
    };
    
    await sgMail.send(msg);
    console.log(`Appointment reminder email sent to ${to}`);
  } catch (error) {
    console.error('Error sending appointment reminder email:', error);
    throw error;
  }
}

// Send appointment cancelled email
export async function sendAppointmentCancelled(appointmentData: any): Promise<void> {
  try {
    const { clientEmail, clientName, therapistName, startTime } = appointmentData;
    
    const formattedDate = format(startTime.toDate(), 'EEEE, MMMM d, yyyy');
    const formattedTime = format(startTime.toDate(), 'h:mm a');
    
    const msg = {
      to: clientEmail,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.APPOINTMENT_CANCELLED,
      dynamicTemplateData: {
        clientName,
        therapistName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        rescheduleUrl: `${functions.config().app.url}/client/appointments`
      }
    };
    
    await sgMail.send(msg);
    console.log(`Appointment cancelled email sent to ${clientEmail}`);
  } catch (error) {
    console.error('Error sending appointment cancelled email:', error);
    throw error;
  }
}

// Send appointment rescheduled email
export async function sendAppointmentRescheduled(appointmentData: any): Promise<void> {
  try {
    const { clientEmail, clientName, therapistName, startTime, endTime, oldStartTime } = appointmentData;
    
    const formattedDate = format(startTime.toDate(), 'EEEE, MMMM d, yyyy');
    const formattedStartTime = format(startTime.toDate(), 'h:mm a');
    const formattedEndTime = format(endTime.toDate(), 'h:mm a');
    const formattedOldDate = format(oldStartTime.toDate(), 'EEEE, MMMM d, yyyy');
    const formattedOldTime = format(oldStartTime.toDate(), 'h:mm a');
    
    const msg = {
      to: clientEmail,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.APPOINTMENT_RESCHEDULED,
      dynamicTemplateData: {
        clientName,
        therapistName,
        oldAppointmentDate: formattedOldDate,
        oldAppointmentTime: formattedOldTime,
        newAppointmentDate: formattedDate,
        newAppointmentTime: `${formattedStartTime} - ${formattedEndTime}`,
        cancelUrl: `${functions.config().app.url}/client/appointments`
      }
    };
    
    await sgMail.send(msg);
    console.log(`Appointment rescheduled email sent to ${clientEmail}`);
  } catch (error) {
    console.error('Error sending appointment rescheduled email:', error);
    throw error;
  }
}

// Send payment receipt email
export async function sendPaymentReceipt(paymentData: any): Promise<void> {
  try {
    const { clientEmail, clientName, therapistName, amount, currency, description, paymentDate, invoiceNumber } = paymentData;
    
    const formattedDate = format(paymentDate.toDate(), 'MMMM d, yyyy');
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
    
    const msg = {
      to: clientEmail,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.PAYMENT_RECEIPT,
      dynamicTemplateData: {
        clientName,
        therapistName,
        amount: formattedAmount,
        description,
        paymentDate: formattedDate,
        invoiceNumber,
        downloadUrl: `${functions.config().app.url}/client/payments/${invoiceNumber}`
      }
    };
    
    await sgMail.send(msg);
    console.log(`Payment receipt email sent to ${clientEmail}`);
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    throw error;
  }
}

// Send form submission notification
export async function sendFormSubmissionNotification(formData: any): Promise<void> {
  try {
    const { therapistEmail, therapistName, clientName, formName } = formData;
    
    const msg = {
      to: therapistEmail,
      from: functions.config().sendgrid.from_email,
      templateId: EMAIL_TEMPLATES.FORM_SUBMISSION,
      dynamicTemplateData: {
        therapistName,
        clientName,
        formName,
        viewUrl: `${functions.config().app.url}/forms/responses/${formData.responseId}`
      }
    };
    
    await sgMail.send(msg);
    console.log(`Form submission notification email sent to ${therapistEmail}`);
  } catch (error) {
    console.error('Error sending form submission notification email:', error);
    throw error;
  }
}

// API endpoint to send a custom email
sendgridRoutes.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html, templateId, dynamicTemplateData } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }
    
    if (!templateId && !subject) {
      return res.status(400).json({ error: 'Either template ID or subject is required' });
    }
    
    const msg: any = {
      to,
      from: functions.config().sendgrid.from_email
    };
    
    if (templateId) {
      msg.templateId = templateId;
      msg.dynamicTemplateData = dynamicTemplateData || {};
    } else {
      msg.subject = subject;
      
      if (html) {
        msg.html = html;
      } else if (text) {
        msg.text = text;
      } else {
        return res.status(400).json({ error: 'Either HTML or text content is required' });
      }
    }
    
    await sgMail.send(msg);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending custom email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

// API endpoint to verify email template
sendgridRoutes.post('/verify-template', async (req, res) => {
  try {
    const { templateId, testData } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    // Send a test email to the authenticated user
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found' });
    }
    
    const msg = {
      to: userEmail,
      from: functions.config().sendgrid.from_email,
      templateId,
      dynamicTemplateData: testData || {}
    };
    
    await sgMail.send(msg);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error verifying email template:', error);
    return res.status(500).json({ error: 'Failed to verify template' });
  }
});
