import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// User creation trigger
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    console.log(`New user created: ${user.uid}`);
    
    // Check if user document already exists
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      // Create default user document if it doesn't exist
      const userData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'therapist',
        isApproved: false, // Requires admin approval
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await admin.firestore().collection('users').doc(user.uid).set(userData);
      console.log(`Created user document for ${user.uid}`);
    }
  } catch (error) {
    console.error('Error in onUserCreate:', error);
  }
});

// User deletion trigger
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    console.log(`User deleted: ${user.uid}`);
    
    // Delete user document
    await admin.firestore().collection('users').doc(user.uid).delete();
    console.log(`Deleted user document for ${user.uid}`);
    
    // TODO: Clean up user data (appointments, clients, etc.)
  } catch (error) {
    console.error('Error in onUserDelete:', error);
  }
});

// Admin approval function
export const approveUser = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  try {
    const adminUid = context.auth.uid;
    const adminDoc = await admin.firestore().collection('users').doc(adminUid).get();
    
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
    }
    
    const { userId, approve } = data;
    
    if (!userId) {
      throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
    }
    
    // Update user approval status
    await admin.firestore().collection('users').doc(userId).update({
      isApproved: approve === true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error in approveUser:', error);
    throw new functions.https.HttpsError('internal', 'Error approving user');
  }
});
