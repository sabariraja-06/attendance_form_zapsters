
### 5. Backend Persistence & Logic Fixes (2026-01-03)
- ✅ **Fixed Data Persistence**: Implemented file-based persistence for Mock Firestore (`backend/data/mockDb.json`). Data now survives server restarts.
- ✅ **Fixed Student Code Verification**:
  - Removed hardcoded mock responses in `attendanceController.js`.
  - Verification now runs against the persistent database.
  - Students can now successfully enter codes provided by admins.
- ✅ **Fixed Attendance Stats**:
  - `getAttendanceStats` now calculates real percentage from the database instead of returning static dummy data.
  - Added `domainName` to stats response for correct Certificate generation.
- ✅ **Server Stability**: Added `backend/nodemon.json` to ignore data file changes, preventing server restarts during database operations.
