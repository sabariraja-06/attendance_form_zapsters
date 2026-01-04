# Deployment Checklist

## 1. Firebase Rules (Critical)
- [ ] Go to [Firebase Console](https://console.firebase.google.com/) > Firestore > Rules.
- [ ] Paste the rules from `FIREBASE_RULES_UPDATE.md`.
- [ ] Click **Publish**.

## 2. Vercel (Frontend) Configuration
When you deploy `frontend` to Vercel:

1.  **Framework Preset:** Next.js
2.  **Root Directory:** `frontend` (Important!)
3.  **Environment Variables:**
    *   `NEXT_PUBLIC_API_URL`: Set this to your Render Backend URL (e.g., `https://api.zapsters.onrender.com`).
    *   *Note: For the first deployment, you can use `http://localhost:5001` just to confirm the build works, but it won't connect to the backend until you update it.*

## 3. Render (Backend) Configuration
When you deploy `backend` to Render:

1.  **Type:** Web Service
2.  **Root Directory:** `backend`
3.  **Build Command:** `npm install`
4.  **Start Command:** `npm start`
5.  **Environment Variables:**
    *   `FIREBASE_SERVICE_ACCOUNT`: (Paste the entire JSON content of your service account key here).
    *   `PORT`: `10000` (Render default).

## 4. Verification Steps
After both are live:
1.  Open the Vercel URL on your phone (disconnected from WiFi to test real "internet" speed).
2.  Login as a student.
3.  **Check:** Does the dashboard load instantly? (It should, thanks to the new `useFirestoreCollection` hook).
4.  **Mark Attendance:** this might take a few seconds (as it wakes up Render), but the rest of the app should be snappy.

## 5. Mobile Optimization Check
- [x] Particles disabled on mobile (Verified).
- [x] Direct Firestore reads implemented.
- [x] LightPillar shader optimized.

**Status:** Ready for Deployment 🚀
