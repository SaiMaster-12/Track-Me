import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    // signInWithRedirect,
    // getRedirectResult,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
    updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";

// Email/Password Signup
export const signUp = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    await updateProfile(userCredential.user, {
        displayName: name,
    });

    return userCredential.user;
};

// Email/Password Login
export const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    return userCredential.user;
};

// Google Login / Signup
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);

  return userCredential.user;
};

// Password Reset
export const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
};

// Logout
export const logout = async () => {
    await signOut(auth);
};