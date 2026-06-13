import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDAExd4tqQbOiPUR9eGy9fQ7enR76B_ZVI",
  authDomain: "bodybvilder-app.firebaseapp.com",
  projectId: "bodybvilder-app",
  storageBucket: "bodybvilder-app.firebasestorage.app",
  messagingSenderId: "628583195399",
  appId: "1:628583195399:web:524efd58acda9fd7a95ba2",
  measurementId: "G-YPHL01CTCZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
