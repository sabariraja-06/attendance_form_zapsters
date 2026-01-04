const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin
// In production, use service account credentials from environment variables or a file
// Initialize Firebase Admin
// In production, use service account credentials from environment variables or a file
// Check if apps are already initialized to prevent hot-reload errors
if (!admin.apps.length) {
    try {
        const fs = require('fs');
        const path = require('path');

        // Check for service account file in common locations
        const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
            });
            console.log("Firebase Admin initialized with ENV credentials");
        } else if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin initialized with serviceAccountKey.json");
        } else {
            // Fallback: Try to initialize with Google Application Credentials (if set in env) or default
            // This is required for verifyIdToken to work even without full DB access
            console.log("Firebase Admin initialized (Default/Mock Mode)");
            admin.initializeApp({
                projectId: 'zapsters-attendance-panel'
            });
            process.env.USE_MOCK_DB = 'true';
        }
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}

// Use Mock Firestore for local development if real connection fails or is not desired
// IMPLEMENTATION STRATEGY:
// 1. Try to use Real Firestore if credentials exist.
// 2. Fallback to Mock Firestore if no credentials.
let db;
try {
    // Check if we have credentials to use real DB
    // Simple check: if we initialized with a credential, app.options.credential will be set
    // AND we didn't explicitly set USE_MOCK_DB
    if (admin.app().options.credential && process.env.USE_MOCK_DB !== 'true') {
        db = admin.firestore();
        console.log("✅ Using Real Firestore");
    } else {
        throw new Error("No credentials or Mock requested");
    }
} catch (e) {
    console.log("⚠️  Using Mock Firestore (No Service Account found)");
    db = require('./mockFirestore');
}
// const db = require('./mockFirestore'); // Force Mock for now if stable
// const db = admin.firestore(); // TODO: Uncomment when using real Firebase
const auth = admin.auth();

module.exports = { admin, db, auth };
