
import { db, isFirebaseConfigured } from "./services/firebase";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { LessonContent } from "./types";

/**
 * FLAG: Tracks if the connection to Firestore has failed due to permissions or configuration.
 * If true, the app will skip Firestore calls for the remainder of the session.
 */
let syncDisabledPermanently = !isFirebaseConfigured;

/**
 * HELPER: Sanitize objects to prevent "Circular Structure" errors.
 * This ensures only plain data is sent to Firestore or stored in LocalStorage.
 */
function sanitize(data: any): any {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.error("Sanitization failed, attempting manual cleaning", e);
    // Fallback: If JSON stringify fails, return a shallow copy or a simplified version
    return typeof data === 'object' ? { ...data } : data;
  }
}

/**
 * GLOBAL CONTENT CACHE
 * Allows one user's generated content to be reused by others.
 */
export async function getGlobalLessonContent(lessonId: string, lang: string): Promise<LessonContent | null> {
  const cacheKey = `global_${lessonId}_${lang}`;
  
  if (!syncDisabledPermanently) {
    try {
      // 1. Try Firestore
      const docRef = doc(db, "global_content", `${lessonId}_${lang}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as LessonContent;
        // Also update local cache for offline speed
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        console.warn("Firestore Permission Denied. Switching to local-only mode for this session. Please check your Firebase rules and API key.");
        syncDisabledPermanently = true;
      } else {
        console.warn("Firestore unavailable, checking local fallback:", e?.message || e);
      }
    }
  }

  // 2. Fallback to LocalStorage
  const local = localStorage.getItem(cacheKey);
  try {
    return local ? JSON.parse(local) : null;
  } catch (e) {
    console.error("Failed to parse local content:", e);
    return null;
  }
}

export async function setGlobalLessonContent(lessonId: string, lang: string, content: LessonContent) {
  const cacheKey = `global_${lessonId}_${lang}`;
  const cleanData = sanitize(content);
  
  // Always update local cache regardless of cloud state
  localStorage.setItem(cacheKey, JSON.stringify(cleanData));

  if (!syncDisabledPermanently) {
    try {
      const docRef = doc(db, "global_content", `${lessonId}_${lang}`);
      await setDoc(docRef, cleanData);
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        syncDisabledPermanently = true;
        console.warn("Firestore Write Permission Denied. Cloud sync disabled.");
      }
      console.warn("Could not sync global content to Firestore:", e?.message || e);
    }
  }
}

/**
 * USER PERSISTENCE
 * Keeps user progress and stats synced to their account.
 */
export async function getUserData(email: string) {
  if (!syncDisabledPermanently) {
    try {
      const docRef = doc(db, "users", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        syncDisabledPermanently = true;
      }
      console.warn("Error fetching user data from Firestore, using local data:", e?.message || e);
    }
  }
  return null;
}

export async function saveUserData(email: string, data: any) {
  const cleanData = sanitize(data);
  if (!syncDisabledPermanently) {
    try {
      const docRef = doc(db, "users", email);
      await setDoc(docRef, cleanData, { merge: true });
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        syncDisabledPermanently = true;
        console.warn("Firestore Permission Denied on save. Reverting to local storage only.");
      } else {
        console.warn("Sync failed. Data saved locally only. Error:", e?.message || e);
      }
    }
  }
}
