'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in. This is now a blocking call. */
export async function signInAnonymously(authInstance: Auth) {
  return await firebaseSignInAnonymously(authInstance);
}

/** Initiate email/password sign-up. This is now a blocking call. */
export async function createUserWithEmailAndPassword(authInstance: Auth, email: string, password: string) {
  return await firebaseCreateUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. This is now a blocking call. */
export async function signInWithEmailAndPassword(authInstance: Auth, email: string, password: string) {
  return await firebaseSignInWithEmailAndPassword(authInstance, email, password);
}
