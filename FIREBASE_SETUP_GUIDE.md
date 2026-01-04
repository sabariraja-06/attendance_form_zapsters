# Firebase Connection & Tutor Code Guide

## 1. How the Tutor Code System Works
The logic is already implemented in your application:
1.  **Tutor Dashboard**:
    *   The Tutor creates a session (selects Batch, Date, Time).
    *   The Backend generates a temporary **6-digit code**.
    *   The code is displayed prominently to the Tutor.
2.  **Student Dashboard**:
    *   The Student logs in and sees a **"Mark Attendance"** card.
    *   They enter the 6-digit code provided by the tutor.
    *   The system verifies the code and marks them as "Present".

## 2. How to Connect Real Firebase
Currently, your app is using **Mock Data**. To connect real Firebase:

### Step A: Get Credentials from Firebase Console
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project (or use existing).
3.  **Frontend Config**:
    *   Go to **Project Settings** -> **General** -> **Your apps**.
    *   Select **Web (</>)**.
    *   Copy the `firebaseConfig` object values (apiKey, authDomain, etc.).
4.  **Backend Config (Service Account)**:
    *   Go to **Project Settings** -> **Service accounts**.
    *   Click **Generate new private key**.
    *   Save this file as `serviceAccountKey.json`.

### Step B: Configure Frontend
1.  Navigate to `frontend/`.
2.  Create or edit `.env.local`.
3.  Add your keys:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

### Step C: Configure Backend
1.  Navigate to `backend/`.
2.  Create a `.env` file.
3.  Add the path to your service account key or the JSON content:
    ```env
    PORT=5001
    # Option 1: Path to file (Recommended for local)
    GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
    ```
4.  **Place the `serviceAccountKey.json` file inside the `backend/` folder.**

### Step D: Update Backend Code to Use Real Database
**Once you have the credentials ready**, let me know, and I will update `backend/src/config/firebase.js` to switch from Mock Data to Real Firebase!
