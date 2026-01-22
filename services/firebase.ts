
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// NOTE: Replace these with actual config from your Firebase Console (Project Settings).
const firebaseConfig = {
  apiKey: "AIzaSyAsPlaceholder_ReplaceWithRealKey",
  authDomain: "web3-guru-app.firebaseapp.com",
  projectId: "web3-guru-app",
  storageBucket: "web3-guru-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Check if the API key is the default placeholder.
export const isFirebaseConfigured = !firebaseConfig.apiKey.includes("Placeholder");

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
