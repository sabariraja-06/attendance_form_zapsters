# Zapsters Attendance System

## Project Overview
A professional, enterprise-grade attendance tracking system for Zapsters internships.
Supports multiple domains, batches, and time-bound secure attendance codes.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Vanilla CSS (Variables/Modules)
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth

## Setup Instructions

### 1. Backend Setup
1. Navigate to `/backend`
2. Install dependencies: `npm install`
3. Configure Firebase:
   - Create a project in Firebase Console.
   - Generate a Service Account Key (JSON).
   - Add credentials to `.env` or `src/config/firebase.js`.
4. Run server: `npm run dev` (Runs on Port 5001)

### 2. Frontend Setup
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Features Implemented
- **Admin Dashboard**: Overview of domains, batches, students.
- **Attendance Logic**: 
  - Time-bound code generation (Backend).
  - Hierarchy validation (Domain -> Batch -> Session).
  - Duplicate check.
- **Student Dashboard**: 
  - Mark attendance interface.
  - View attendance percentage.
  - Certificate eligibility status.
- **Design**: Minimal, corporate red/black/white theme.

## Hierarchy & Rules
- **Strict Hierarchy**: Data is strictly linked: `Domain -> Batch -> Session -> Student`.
- **Attendance**: Students can only mark attendance if:
  - Code is valid & not expired (5 mins).
  - They belong to the Session's Batch & Domain.
  - They haven't marked it yet.
