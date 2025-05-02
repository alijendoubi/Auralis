import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  confirmPasswordReset,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'therapist' | 'admin';
  isApproved: boolean;
  createdAt: Date;
  stripeCustomerId?: string;
  settings?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    @Inject('FIREBASE_AUTH') private auth: Auth,
    @Inject('FIREBASE_FIRESTORE') private firestore: Firestore,
    private router: Router
  ) {
    // Initialize auth state listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.getUserProfile(user.uid).then(userProfile => {
          if (userProfile) {
            this.currentUserSubject.next(userProfile);
          } else {
            this.currentUserSubject.next(null);
          }
        });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  // Sign up with email/password
  async signUp(email: string, password: string, displayName: string): Promise<UserCredential> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: credential.user.uid,
        email: credential.user.email || email,
        displayName: displayName,
        role: 'therapist',
        isApproved: false, // Requires admin approval
        createdAt: new Date()
      };
      
      await this.createUserProfile(userProfile);
      
      return credential;
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  }
  
  // Register (alias for signUp)
  async register(email: string, password: string, userData: Partial<UserProfile>): Promise<UserCredential> {
    return this.signUp(email, password, userData.displayName || '');
  }

  // Sign in with email/password
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Get user profile from Firestore
      const userProfile = await this.getUserProfile(credential.user.uid);
      
      if (userProfile) {
        this.currentUserSubject.next(userProfile);
      }
      
      return credential;
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      
      // Check if user profile exists
      let userProfile = await this.getUserProfile(credential.user.uid);
      
      if (!userProfile) {
        // Create new user profile
        userProfile = {
          uid: credential.user.uid,
          email: credential.user.email || '',
          displayName: credential.user.displayName || '',
          photoURL: credential.user.photoURL || '',
          role: 'therapist',
          isApproved: false, // Requires admin approval
          createdAt: new Date()
        };
        
        await this.createUserProfile(userProfile);
      }
      
      this.currentUserSubject.next(userProfile);
      
      return credential;
    } catch (error) {
      console.error('Error during Google sign in:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  }
  
  // Send password reset email (alias for resetPassword)
  async sendPasswordResetEmail(email: string): Promise<void> {
    return this.resetPassword(email);
  }
  
  // Confirm password reset
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, code, newPassword);
    } catch (error) {
      console.error('Error during password reset confirmation:', error);
      throw error;
    }
  }

  // Create user profile in Firestore
  private async createUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userProfile.uid}`);
      await setDoc(userRef, userProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile from Firestore
  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userRef, data as any);
      
      // Update current user subject if it's the current user
      const currentUser = this.currentUserSubject.value;
      if (currentUser && currentUser.uid === uid) {
        this.currentUserSubject.next({
          ...currentUser,
          ...data
        });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }

  // Check if user is approved
  isApproved(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.isApproved || false)
    );
  }

  // Check if user is admin
  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.role === 'admin')
    );
  }
}
