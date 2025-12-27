const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin
// In production, use service account credentials from environment variables or a file
// For now, we'll check if apps are already initialized to prevent hot-reload errors
if (!admin.apps.length) {
    try {
        // NOTE: User must provide FIREBASE_SERVICE_ACCOUNT in .env or proper setup
        // admin.initializeApp({
        //   credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
        // });

        // Fallback for development/mocking if no credentials yet
        console.log("Firebase Admin initialized (Mock/Placeholder)");
        admin.initializeApp();
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}

// Use Mock Firestore for local development/testing without keys
const db = require('./mockFirestore');
// const db = admin.firestore(); // TODO: Uncomment when using real Firebase
const auth = admin.auth();

module.exports = { admin, db, auth };
