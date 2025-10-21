import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFcrgT_hwmTSZqbh1b1AUuEZHmK_j_41k",
  authDomain: "al-madina-masjid-app.firebaseapp.com",
  projectId: "al-madina-masjid-app",
  storageBucket: "al-madina-masjid-app.firebasestorage.app",
  messagingSenderId: "677907945511",
  appId: "1:677907945511:web:22b20d135b00451ca41602"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Initialize Functions for Australia region
const functions: Functions = getFunctions(app, 'australia-southeast1');

// Uncomment this line if you're using Firebase emulator for local development
// import { connectFunctionsEmulator } from 'firebase/functions';
// connectFunctionsEmulator(functions, 'localhost', 5001);

export { app, auth, db, functions };
