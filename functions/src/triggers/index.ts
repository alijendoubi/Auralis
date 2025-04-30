import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Appointment triggers
export const onAppointmentCreate = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snapshot, context) => {
    try {
      const appointmentData = snapshot.data();
      const appointmentId = context.params.appointmentId;
      
      console.log(`New appointment created: ${appointmentId}`);
      
      // Schedule reminders
      await scheduleReminders(appointmentId, appointmentData);
      
      // Update therapist's availability
      await updateTherapistAvailability(appointmentData);
      
      return true;
    } catch (error) {
      console.error('Error in onAppointmentCreate:', error);
      return false;
    }
  });

export const onAppointmentUpdate = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const appointmentId = context.params.appointmentId;
      
      console.log(`Appointment updated: ${appointmentId}`);
      
      // If status changed to cancelled, update availability
      if (before.status !== 'cancelled' && after.status === 'cancelled') {
        await freeTherapistAvailability(after);
      }
      
      // If time changed, update reminders and availability
      if (before.startTime.toMillis() !== after.startTime.toMillis() ||
          before.endTime.toMillis() !== after.endTime.toMillis()) {
        // Cancel old reminders
        await cancelReminders(appointmentId);
        
        // Schedule new reminders
        await scheduleReminders(appointmentId, after);
        
        // Update therapist's availability
        if (before.status !== 'cancelled') {
          await freeTherapistAvailability(before);
        }
        
        if (after.status !== 'cancelled') {
          await updateTherapistAvailability(after);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in onAppointmentUpdate:', error);
      return false;
    }
  });

export const onAppointmentDelete = functions.firestore
  .document('appointments/{appointmentId}')
  .onDelete(async (snapshot, context) => {
    try {
      const appointmentData = snapshot.data();
      const appointmentId = context.params.appointmentId;
      
      console.log(`Appointment deleted: ${appointmentId}`);
      
      // Cancel reminders
      await cancelReminders(appointmentId);
      
      // Free up therapist's availability if not cancelled
      if (appointmentData.status !== 'cancelled') {
        await freeTherapistAvailability(appointmentData);
      }
      
      return true;
    } catch (error) {
      console.error('Error in onAppointmentDelete:', error);
      return false;
    }
  });

// Helper functions
async function scheduleReminders(appointmentId: string, appointmentData: any): Promise<void> {
  try {
    // Create reminder documents
    const reminderData = {
      appointmentId,
      therapistId: appointmentData.therapistId,
      clientId: appointmentData.clientId,
      appointmentTime: appointmentData.startTime,
      status: 'scheduled',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // 24-hour reminder
    const reminder24h = {
      ...reminderData,
      type: '24h',
      scheduledFor: new Date(appointmentData.startTime.toMillis() - 24 * 60 * 60 * 1000)
    };
    
    // 1-hour reminder
    const reminder1h = {
      ...reminderData,
      type: '1h',
      scheduledFor: new Date(appointmentData.startTime.toMillis() - 60 * 60 * 1000)
    };
    
    await admin.firestore().collection('reminders').add(reminder24h);
    await admin.firestore().collection('reminders').add(reminder1h);
    
    console.log(`Scheduled reminders for appointment: ${appointmentId}`);
  } catch (error) {
    console.error('Error scheduling reminders:', error);
    throw error;
  }
}

async function cancelReminders(appointmentId: string): Promise<void> {
  try {
    const remindersSnapshot = await admin.firestore()
      .collection('reminders')
      .where('appointmentId', '==', appointmentId)
      .where('status', '==', 'scheduled')
      .get();
    
    const batch = admin.firestore().batch();
    
    remindersSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'cancelled' });
    });
    
    await batch.commit();
    console.log(`Cancelled reminders for appointment: ${appointmentId}`);
  } catch (error) {
    console.error('Error cancelling reminders:', error);
    throw error;
  }
}

async function updateTherapistAvailability(appointmentData: any): Promise<void> {
  try {
    // Mark the time slot as unavailable
    const startDate = new Date(appointmentData.startTime.toMillis());
    const endDate = new Date(appointmentData.endTime.toMillis());
    
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const day = startDate.getDate();
    
    const availabilityRef = admin.firestore()
      .collection('availability')
      .doc(`${appointmentData.therapistId}_${year}_${month}_${day}`);
    
    await admin.firestore().runTransaction(async transaction => {
      const availabilityDoc = await transaction.get(availabilityRef);
      
      let availability = availabilityDoc.exists ? availabilityDoc.data()!.slots : {};
      
      // Mark slots as unavailable
      for (let time = startDate.getTime(); time < endDate.getTime(); time += 15 * 60 * 1000) {
        const timeKey = new Date(time).toISOString();
        availability[timeKey] = {
          available: false,
          appointmentId: appointmentData.id
        };
      }
      
      transaction.set(availabilityRef, {
        therapistId: appointmentData.therapistId,
        date: admin.firestore.Timestamp.fromDate(startDate),
        slots: availability,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    
    console.log(`Updated availability for therapist: ${appointmentData.therapistId}`);
  } catch (error) {
    console.error('Error updating therapist availability:', error);
    throw error;
  }
}

async function freeTherapistAvailability(appointmentData: any): Promise<void> {
  try {
    // Mark the time slot as available again
    const startDate = new Date(appointmentData.startTime.toMillis());
    const endDate = new Date(appointmentData.endTime.toMillis());
    
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const day = startDate.getDate();
    
    const availabilityRef = admin.firestore()
      .collection('availability')
      .doc(`${appointmentData.therapistId}_${year}_${month}_${day}`);
    
    await admin.firestore().runTransaction(async transaction => {
      const availabilityDoc = await transaction.get(availabilityRef);
      
      if (!availabilityDoc.exists) return;
      
      let availability = availabilityDoc.data()!.slots;
      
      // Mark slots as available
      for (let time = startDate.getTime(); time < endDate.getTime(); time += 15 * 60 * 1000) {
        const timeKey = new Date(time).toISOString();
        if (availability[timeKey] && availability[timeKey].appointmentId === appointmentData.id) {
          availability[timeKey] = {
            available: true
          };
        }
      }
      
      transaction.update(availabilityRef, {
        slots: availability,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    console.log(`Freed availability for therapist: ${appointmentData.therapistId}`);
  } catch (error) {
    console.error('Error freeing therapist availability:', error);
    throw error;
  }
}
