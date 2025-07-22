import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';

export const authService = {
  // Sign up new user
  async signUp(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        email,
        createdAt: new Date().toISOString(),
        idVerified: false,
        role: userData.role // 'worker' or 'employer'
      });

      return user;
    } catch (error) {
      throw error;
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }
}; 