const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/sessions', attendanceController.createSession); // Usually admin only
router.post('/mark', attendanceController.markAttendance);
router.get('/stats/:userId', attendanceController.getAttendanceStats);

module.exports = router;
