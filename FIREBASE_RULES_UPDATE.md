# Firebase Security Rules Update Required

To make the new "Instant Dashboard" work, you **MUST** update your Firestore Security Rules in the Firebase Console.
Go to **Firebase Console -> Firestore Database -> Rules** and paste this:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Check if user is logged in
    function isAuthenticated() {
      return request.auth != null;
    }

    // 1. DOMAINS & BATCHES: Read-only for everyone (or just logged in users)
    match /domains/{domainId} {
      allow read: if true;
      allow write: if false; // Writes must go through Backend API
    }
    match /batches/{batchId} {
      allow read: if true; 
      allow write: if false;
    }

    // 2. USERS: Read your own profile
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId);
      allow write: if false;
    }

    // 3. SESSIONS: Read-only for students (to see schedule)
    match /sessions/{sessionId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    // 4. ATTENDANCE: Read your own history
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid);
      allow write: if false; // Marking attendance MUST go through Backend API
    }
  }
}
```

## Why this is safe:
1.  **Writes are blocked (`allow write: if false`)**: No one can hack your database from the browser console. They can't delete users or add fake sessions.
2.  **Reads are scoped**: Students can only see *their* attendance.
3.  **Backend Privileges**: Your Render backend uses the `firebase-admin` SDK, which bypasses these rules. So your API still works perfectly for creating sessions and marking attendance.
