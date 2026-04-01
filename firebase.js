// Firebase SDKs ko internet (CDN) se import karna
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// ⚠️ YAHAN APNI FIREBASE CONFIG DETAILS DAALEIN (Firebase Console se copy karke) ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyDvbxlADzCtM_IENn0mEoq7kFQT17uRnxI",
  authDomain: "frame-studio-435b7.firebaseapp.com",
  projectId: "frame-studio-435b7",
  storageBucket: "frame-studio-435b7.firebasestorage.app",
  messagingSenderId: "591710211415",
  appId: "1:591710211415:web:5cd3cea6d70607b8224212"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Database aur Auth ko aage use karne ke liye export kar rahe hain
export const db = getFirestore(app);
export const auth = getAuth(app);