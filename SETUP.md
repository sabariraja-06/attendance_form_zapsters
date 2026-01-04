# Zapsters Attendance System - Setup & Usage Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```
   This will start both the backend (port 5001) and frontend (port 3000) concurrently.

   **OR** start them separately:
   
   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🔐 Login Credentials

### Admin Access
- Email: `admin@zapsters.com`
- Password: (any password - authentication is simulated)

### Student Access
- Email: (any email except admin@zapsters.com)
- Password: (any password - authentication is simulated)

## 📋 System Features

### Admin Panel Features

#### 1. Dashboard
- View total domains, batches, and students
- Monitor students below 75% attendance
- Track average attendance percentage

#### 2. Domain Management
- ✅ Add new domains
- ✅ View all domains
- ✅ Delete domains

#### 3. Batch Management
- ✅ Create batches linked to domains
- ✅ Set start and end dates
- ✅ Filter batches by domain
- ✅ Delete batches

#### 4. Student Management
- ✅ Add students with domain and batch assignment
- ✅ Search students by name or email
- ✅ Filter students by domain and batch
- ✅ Dynamic batch loading based on selected domain
- ✅ Delete students

#### 5. Session Management
- ✅ Create sessions with:
  - Domain and batch selection
  - Date and time
  - Duration (minutes)
  - Google Meet link
  - Auto-generated 6-digit attendance code
- ✅ View all created sessions
- ✅ See session status (Active/Expired)
- ✅ Copy attendance codes

### Student Panel Features

#### 1. Dashboard
- ✅ Mark attendance using 6-digit code
- ✅ View attendance percentage
- ✅ See certificate eligibility status
- ✅ View recent sessions with attendance status
- ✅ Real-time validation of attendance codes

#### 2. Certificates
- ✅ Check certificate eligibility (≥75% attendance required)
- ✅ View attendance progress
- ✅ Download certificate (placeholder for eligible students)

## 🔧 System Architecture

### Backend (Node.js + Express)
- **Port:** 5001
- **Database:** Mock Firestore (in-memory)
- **Authentication:** Simulated (ready for Firebase Auth integration)

### Frontend (Next.js + React)
- **Port:** 3000
- **Framework:** Next.js 16
- **Styling:** Vanilla CSS with Zapsters branding

### Data Hierarchy
```
Domain → Batch → Session → Student → Attendance Record
```

## 📊 Data Flow

### Attendance Marking Process
1. Admin creates a session with auto-generated code
2. Code is valid for specified duration (e.g., 5 minutes)
3. Student enters code during session
4. System validates:
   - Code exists and is not expired
   - Student belongs to correct domain/batch
   - Student hasn't already marked attendance
5. Attendance is recorded
6. Student's attendance percentage is updated

### Attendance Calculation
```
Attendance % = (Sessions Attended / Total Sessions for Batch) × 100
```

### Certificate Eligibility
- Minimum 75% attendance required
- Automatically calculated based on batch sessions

## 🎨 Branding

### Colors
- Primary Red: `#E10600`
- Black: `#000000`
- White: `#FFFFFF`
- Gray shades for UI elements

### Design Principles
- Minimal and professional
- Corporate aesthetic
- Flat UI with subtle rounded corners
- Clear visual hierarchy

## 🔄 API Endpoints

### Admin Routes (`/api/admin`)
- `POST /domains` - Create domain
- `GET /domains` - Get all domains
- `DELETE /domains/:id` - Delete domain
- `POST /batches` - Create batch
- `GET /batches?domainId=xxx` - Get batches (filtered)
- `DELETE /batches/:id` - Delete batch
- `POST /students` - Add student
- `GET /students?domainId=xxx&batchId=xxx` - Get students (filtered)
- `DELETE /students/:id` - Delete student
- `GET /dashboard/stats` - Get dashboard statistics

### Attendance Routes (`/api/attendance`)
- `POST /sessions` - Create session (Admin)
- `GET /sessions` - Get all sessions
- `POST /mark` - Mark attendance
- `GET /stats/:userId` - Get student attendance stats
- `GET /student/:userId/sessions` - Get student's sessions with status

## 🐛 Current Limitations

1. **Mock Database:** Using in-memory storage (data resets on server restart)
2. **Authentication:** Simulated (not using real Firebase Auth)
3. **File Upload:** Certificate download is placeholder
4. **Real-time Updates:** No WebSocket support yet

## 🚀 Production Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `npm start`
5. Add environment variables (when using real Firebase)

### Frontend (Vercel)
1. Import project to Vercel
2. Set root directory to `frontend`
3. Framework preset: Next.js
4. Deploy

### Environment Variables (for production)
```
# Backend
FIREBASE_SERVICE_ACCOUNT=<your-firebase-credentials>
PORT=5001

# Frontend
NEXT_PUBLIC_API_URL=<your-backend-url>
```

## 📝 Next Steps for Production

1. **Integrate Real Firebase:**
   - Set up Firebase project
   - Add service account credentials
   - Replace mock Firestore with real Firestore
   - Implement Firebase Authentication

2. **Add Features:**
   - Email notifications
   - Bulk student import (CSV)
   - Advanced reporting
   - Certificate PDF generation
   - Session analytics

3. **Security:**
   - Add proper authentication middleware
   - Implement role-based access control
   - Add rate limiting
   - Validate all inputs

4. **Testing:**
   - Unit tests
   - Integration tests
   - End-to-end tests

## 🆘 Troubleshooting

### Backend not starting
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend not starting
```bash
cd frontend
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Port already in use
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

## 📞 Support

For issues or questions, please check the code comments or create an issue in the repository.

---

**Built with ❤️ for Zapsters Internship Program**
