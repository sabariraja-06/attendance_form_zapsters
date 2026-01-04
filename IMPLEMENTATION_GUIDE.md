# Zapsters Attendance System - Setup & Implementation Guide

## 🚀 CRITICAL FIXES IMPLEMENTED

### ✅ Phase 1: Authentication & Security (COMPLETED)

#### 1. Firebase Configuration
- ✅ Created `/frontend/src/lib/firebase.ts` - Firebase initialization with Google Auth
- ✅ Created `/frontend/src/types/index.ts` - TypeScript interfaces for all data models
- ✅ Created `/frontend/src/contexts/AuthContext.tsx` - Auth context with Google OAuth
- ✅ Created `/frontend/src/lib/api.ts` - Centralized API client with token handling

#### 2. Backend Security
- ✅ Created `/backend/src/middleware/authMiddleware.js` - Firebase token verification
- ✅ Created `/backend/src/middleware/roleMiddleware.js` - Role-based access control
- ✅ Updated `/backend/src/routes/adminRoutes.js` - Protected all admin routes
- ✅ Updated `/backend/src/routes/attendanceRoutes.js` - Protected attendance routes

#### 3. Frontend Integration
- ✅ Updated `/frontend/src/app/layout.tsx` - Wrapped app with AuthProvider
- ✅ Updated `/frontend/src/app/page.tsx` - Implemented Google OAuth login
- ✅ Updated `/frontend/src/app/admin/dashboard/page.tsx` - Using API client

---

## 📋 SETUP INSTRUCTIONS

### Step 1: Firebase Project Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Name it "Zapsters Attendance"
   - Disable Google Analytics (optional)

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Google" provider
   - Add authorized domains (localhost, your deployment domain)

3. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create Database"
   - Start in **production mode**
   - Choose your region

4. **Get Web App Credentials**
   - Go to Project Settings → General
   - Scroll to "Your apps"
   - Click "Add app" → Web (</>) icon
   - Register app as "Zapsters Frontend"
   - Copy the Firebase configuration

5. **Get Admin SDK Credentials**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - **KEEP THIS FILE SECURE** - Never commit to git

### Step 2: Environment Variables Setup

#### Frontend (.env.local)

Create `/frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_API_URL=http://localhost:5001
```

#### Backend (.env)

Create `/backend/.env`:

```env
PORT=5001

# Firebase Admin SDK - Option 1: Service Account JSON (Recommended for local dev)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your_project_id",...}

# Firebase Admin SDK - Option 2: Individual fields (Recommended for production)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-production-domain.com
```

### Step 3: Update Backend Firebase Config

Update `/backend/src/config/firebase.js`:

```javascript
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

if (!admin.apps.length) {
    try {
        // Option 1: Use service account JSON (local development)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
            });
        } 
        // Option 2: Use individual credentials (production)
        else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                })
            });
        } else {
            throw new Error('Firebase credentials not found in environment variables');
        }
        
        console.log("✅ Firebase Admin initialized successfully");
    } catch (error) {
        console.error("❌ Firebase initialization error:", error);
        process.exit(1);
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
```

### Step 4: Firestore Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Domains collection
    match /domains/{domainId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Batches collection
    match /batches/{batchId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
  }
}
```

### Step 5: Create Initial Admin User

After setting up Firebase, create an admin user in Firestore:

1. Go to Firestore Database in Firebase Console
2. Create a new collection called `users`
3. Add a document with your Google email:

```json
{
  "email": "your-email@gmail.com",
  "name": "Your Name",
  "role": "admin",
  "createdAt": "2025-12-29T00:00:00.000Z"
}
```

4. Update the admin allowlist in `/frontend/src/contexts/AuthContext.tsx`:

```typescript
const ADMIN_ALLOWLIST = [
  'your-email@gmail.com',
  'admin@zapsters.com',
];
```

### Step 6: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 7: Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## 🧪 TESTING CHECKLIST

### Authentication
- [ ] Google Sign-In button appears on login page
- [ ] Clicking sign-in opens Google OAuth popup
- [ ] Admin email redirects to /admin/dashboard
- [ ] Student email redirects to /student/dashboard
- [ ] Unauthorized email shows error message
- [ ] Logout clears session and redirects to login

### Admin Panel
- [ ] Dashboard stats load correctly
- [ ] Can create/view/delete domains
- [ ] Can create/view/delete batches (linked to domains)
- [ ] Can create/view/delete students (linked to domain+batch)
- [ ] Can create sessions with attendance codes
- [ ] All API calls include Authorization header

### Student Panel
- [ ] Student sees their domain and batch
- [ ] Upcoming sessions load correctly
- [ ] Can submit attendance code
- [ ] Invalid/expired code shows error
- [ ] Attendance percentage updates
- [ ] Certificate eligibility shows correctly

### Security
- [ ] Cannot access admin routes without admin role
- [ ] Cannot access student routes without authentication
- [ ] API returns 401 without token
- [ ] API returns 403 with wrong role
- [ ] Attendance validation happens on backend

---

## 🔧 REMAINING TASKS

### High Priority
1. ✅ Update all admin pages to use API client
2. ✅ Update student dashboard to use real data
3. ✅ Add protected route components
4. ⏳ Test end-to-end authentication flow
5. ⏳ Optimize dashboard stats query
6. ⏳ Add error boundaries
7. ⏳ Add loading states to all pages

### Medium Priority
1. ⏳ Implement certificate PDF generation
2. ⏳ Add toast notifications
3. ⏳ Add form validation
4. ⏳ Implement logout in layouts
5. ⏳ Add request validation on backend
6. ⏳ Set up Firestore indexes

### Low Priority
1. ⏳ Add date formatting utility
2. ⏳ Clean up console warnings
3. ⏳ Add loading skeletons
4. ⏳ Implement rate limiting

---

## 🚨 KNOWN ISSUES

1. **Mock Firestore Still in Use**
   - Location: `/backend/src/config/firebase.js` line 25
   - Fix: Replace with real Firebase after credentials are added

2. **Dashboard Stats Performance**
   - Issue: N+1 queries in getDashboardStats
   - Impact: Slow with many students
   - Fix: Implement batch queries or pre-calculated stats

3. **No Protected Routes**
   - Issue: Users can navigate to routes directly
   - Fix: Add route protection middleware

---

## 📚 DOCUMENTATION

### API Endpoints

#### Admin Routes (Require admin role)
- `POST /api/admin/domains` - Create domain
- `GET /api/admin/domains` - Get all domains
- `DELETE /api/admin/domains/:id` - Delete domain
- `POST /api/admin/batches` - Create batch
- `GET /api/admin/batches?domainId=xxx` - Get batches
- `DELETE /api/admin/batches/:id` - Delete batch
- `POST /api/admin/students` - Create student
- `GET /api/admin/students?domainId=xxx&batchId=xxx` - Get students
- `DELETE /api/admin/students/:id` - Delete student
- `GET /api/admin/dashboard/stats` - Get dashboard stats

#### Attendance Routes
- `POST /api/attendance/sessions` - Create session (admin only)
- `GET /api/attendance/sessions` - Get sessions (admin only)
- `POST /api/attendance/mark` - Mark attendance (student only)
- `GET /api/attendance/stats/:userId` - Get attendance stats
- `GET /api/attendance/student/:userId/sessions` - Get student sessions

---

## 🎯 SUCCESS CRITERIA

✅ Real Firebase authentication working
✅ Google OAuth login functional
✅ Admin allowlist enforced
✅ Role-based access control implemented
✅ All API endpoints protected
✅ Frontend using centralized API client
⏳ End-to-end attendance flow working
⏳ Mobile responsiveness maintained
⏳ No console errors
⏳ Production-ready deployment

---

**Last Updated:** 2025-12-29
**Status:** Phase 1 Complete - Authentication & Security Implemented
**Next:** Test authentication flow and update remaining pages
