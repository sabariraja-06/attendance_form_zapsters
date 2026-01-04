// Firebase Configuration
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDWvmVC9N9xWVZTMrzhkN55VUbLX93lC50",
    authDomain: "zapsters-attendance-panel.firebaseapp.com",
    projectId: "zapsters-attendance-panel",
    storageBucket: "zapsters-attendance-panel.firebasestorage.app",
    messagingSenderId: "1030988311284",
    appId: "1:1030988311284:web:c0f13f77a2d5ed64880ca1",
    measurementId: "G-J8MXC42L5Z"
};

// Initialize Firebase
// Check if app is already initialized to avoid errors during hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Custom parameters for Google Login
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Analytics (Client-side only)
let analytics: any = null;
if (typeof window !== 'undefined') {
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    }).catch(console.error);
}

// Log success to console
console.log('✅ Connected to Real Firebase: zapsters-attendance-panel');

export { auth, db, googleProvider, analytics, loginWithGoogle };

async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Logged in user:", result.user);
        // ✅ redirect after login
        window.location.href = "/dashboard";
    } catch (error) {
        console.error("Google login error:", error);
    }
}
export default app;
