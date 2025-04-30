import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { format, addDays } from 'date-fns';
import { sendAppointmentReminder } from '../integrations/sendgrid';
import { sendSmsReminder } from '../integrations/twilio';

// Process reminders every 5 minutes
export const processReminders = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    try {
      console.log('Processing reminders...');
      
      const now = new Date();
      const endTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      
      // Get reminders scheduled for the next 5 minutes
      const remindersSnapshot = await admin.firestore()
        .collection('reminders')
        .where('status', '==', 'scheduled')
        .where('scheduledFor', '>=', now)
        .where('scheduledFor', '<', endTime)
        .get();
      
      console.log(`Found ${remindersSnapshot.size} reminders to process`);
      
      if (remindersSnapshot.empty) {
        return null;
      }
      
      const batch = admin.firestore().batch();
      const processedReminders = [];
      
      for (const doc of remindersSnapshot.docs) {
        const reminder = doc.data();
        processedReminders.push(processReminder(reminder, doc.id, batch));
      }
      
      await Promise.all(processedReminders);
      await batch.commit();
      
      console.log(`Successfully processed ${processedReminders.length} reminders`);
      return null;
    } catch (error) {
      console.error('Error processing reminders:', error);
      return null;
    }
  });

// Generate daily availability for therapists (runs at 1 AM every day)
export const generateDailyAvailability = functions.pubsub
  .schedule('0 1 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      console.log('Generating daily availability...');
      
      // Get all active therapists
      const therapistsSnapshot = await admin.firestore()
        .collection('users')
        .where('role', '==', 'therapist')
        .where('isApproved', '==', true)
        .get();
      
      console.log(`Found ${therapistsSnapshot.size} active therapists`);
      
      if (therapistsSnapshot.empty) {
        return null;
      }
      
      // Generate availability for 30 days in advance
      const today = new Date();
      const targetDate = addDays(today, 30);
      const formattedDate = format(targetDate, 'yyyy-MM-dd');
      
      const batch = admin.firestore().batch();
      const availabilityTasks = [];
      
      for (const doc of therapistsSnapshot.docs) {
        const therapist = doc.data();
        availabilityTasks.push(generateTherapistAvailability(therapist, targetDate, batch));
      }
      
      await Promise.all(availabilityTasks);
      await batch.commit();
      
      console.log(`Successfully generated availability for ${availabilityTasks.length} therapists for ${formattedDate}`);
      return null;
    } catch (error) {
      console.error('Error generating daily availability:', error);
      return null;
    }
  });

// Helper functions
async function processReminder(reminder: any, reminderId: string, batch: admin.firestore.WriteBatch): Promise<void> {
  try {
    // Get appointment details
    const appointmentDoc = await admin.firestore()
      .collection('appointments')
      .doc(reminder.appointmentId)
      .get();
    
    if (!appointmentDoc.exists) {
      // Appointment was deleted, mark reminder as cancelled
      batch.update(admin.firestore().collection('reminders').doc(reminderId), {
        status: 'cancelled',
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }
    
    const appointment = appointmentDoc.data()!;
    
    // Skip if appointment was cancelled
    if (appointment.status === 'cancelled') {
      batch.update(admin.firestore().collection('reminders').doc(reminderId), {
        status: 'cancelled',
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }
    
    // Get client details
    const clientDoc = await admin.firestore()
      .collection('clients')
      .doc(reminder.clientId)
      .get();
    
    if (!clientDoc.exists) {
      // Client was deleted, mark reminder as error
      batch.update(admin.firestore().collection('reminders').doc(reminderId), {
        status: 'error',
        error: 'Client not found',
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }
    
    const client = clientDoc.data()!;
    
    // Get therapist details
    const therapistDoc = await admin.firestore()
      .collection('users')
      .doc(reminder.therapistId)
      .get();
    
    if (!therapistDoc.exists) {
      // Therapist was deleted, mark reminder as error
      batch.update(admin.firestore().collection('reminders').doc(reminderId), {
        status: 'error',
        error: 'Therapist not found',
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }
    
    const therapist = therapistDoc.data()!;
    
    // Send email reminder
    if (client.email) {
      await sendAppointmentReminder({
        to: client.email,
        appointmentDate: appointment.startTime.toDate(),
        clientName: client.name,
        therapistName: therapist.displayName || 'Your therapist',
        reminderType: reminder.type
      });
    }
    
    // Send SMS reminder if client has phone number
    if (client.phone) {
      await sendSmsReminder({
        to: client.phone,
        appointmentDate: appointment.startTime.toDate(),
        clientName: client.name,
        therapistName: therapist.displayName || 'Your therapist',
        reminderType: reminder.type
      });
    }
    
    // Mark reminder as sent
    batch.update(admin.firestore().collection('reminders').doc(reminderId), {
      status: 'sent',
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Processed reminder ${reminderId} for appointment ${reminder.appointmentId}`);
  } catch (error) {
    console.error(`Error processing reminder ${reminderId}:`, error);
    
    // Mark reminder as error
    batch.update(admin.firestore().collection('reminders').doc(reminderId), {
      status: 'error',
      error: error.message || 'Unknown error',
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

async function generateTherapistAvailability(therapist: any, date: Date, batch: admin.firestore.WriteBatch): Promise<void> {
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const availabilityId = `${therapist.uid}_${year}_${month}_${day}`;
    const availabilityRef = admin.firestore().collection('availability').doc(availabilityId);
    
    // Check if availability already exists
    const availabilityDoc = await availabilityRef.get();
    
    if (availabilityDoc.exists) {
      // Already generated, skip
      return;
    }
    
    // Get therapist's working hours
    const settingsDoc = await admin.firestore()
      .collection('settings')
      .doc(therapist.uid)
      .get();
    
    if (!settingsDoc.exists) {
      // No settings, skip
      return;
    }
    
    const settings = settingsDoc.data()!;
    
    if (!settings.workingHours) {
      // No working hours defined, skip
      return;
    }
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    
    // Check if therapist works on this day
    if (!settings.workingHours[dayName] || !settings.workingHours[dayName].enabled) {
      // Not working on this day, skip
      return;
    }
    
    const daySettings = settings.workingHours[dayName];
    const startHour = daySettings.startHour || 9;
    const startMinute = daySettings.startMinute || 0;
    const endHour = daySettings.endHour || 17;
    const endMinute = daySettings.endMinute || 0;
    
    // Generate 15-minute slots
    const slots = {};
    const startTime = new Date(year, month - 1, day, startHour, startMinute);
    const endTime = new Date(year, month - 1, day, endHour, endMinute);
    
    for (let time = startTime.getTime(); time < endTime.getTime(); time += 15 * 60 * 1000) {
      const timeKey = new Date(time).toISOString();
      slots[timeKey] = {
        available: true
      };
    }
    
    // Save availability
    batch.set(availabilityRef, {
      therapistId: therapist.uid,
      date: admin.firestore.Timestamp.fromDate(date),
      slots,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Generated availability for therapist ${therapist.uid} on ${date.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error(`Error generating availability for therapist ${therapist.uid}:`, error);
  }
}
