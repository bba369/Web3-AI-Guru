
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// IMPORTANT: Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAsPlaceholder_ReplaceWithRealKey",
  authDomain: "tech-guru-app.firebaseapp.com",
  projectId: "tech-guru-app",
  storageBucket: "tech-guru-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Immediately check if Firebase is valid to avoid async timeouts
export const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes("Placeholder") && 
  firebaseConfig.projectId !== "tech-guru-app";

let dbInstance: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export const db = dbInstance;
