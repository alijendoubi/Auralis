import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { environment } from '../environments/environment';

// Initialize Firebase for server-side rendering
export function initializeFirebaseServer() {
  const app = initializeApp(environment.firebase, 'server');
  
  // Initialize Firebase services
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const functions = getFunctions(app);
  const storage = getStorage(app);
  
  return {
    app,
    auth,
    firestore,
    functions,
    storage
  };
}
