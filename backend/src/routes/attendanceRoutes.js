const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Session management (Admin only)
router.post('/sessions', authMiddleware, roleMiddleware(['admin']), attendanceController.createSession);
router.get('/sessions', authMiddleware, roleMiddleware(['admin']), attendanceController.getSessions);

// Attendance marking (Students)
router.post('/mark', authMiddleware, roleMiddleware(['student']), attendanceController.markAttendance);

// Stats (Students can view their own, admins can view any)
router.get('/stats/:userId', authMiddleware, attendanceController.getAttendanceStats);

// Student sessions (Students can view their own)
router.get('/student/:userId/sessions', authMiddleware, attendanceController.getStudentSessions);

module.exports = router;
