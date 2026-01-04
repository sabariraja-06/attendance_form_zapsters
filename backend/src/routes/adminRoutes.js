const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply authentication and admin role check to all routes
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Domain routes
router.post('/domains', adminController.addDomain);
router.get('/domains', adminController.getDomains);
router.delete('/domains/:id', adminController.deleteDomain);

// Batch routes
router.post('/batches', adminController.addBatch);
router.get('/batches', adminController.getBatches);
router.delete('/batches/:id', adminController.deleteBatch);

// Tutor routes
router.post('/tutors', adminController.addTutor);
router.get('/tutors', adminController.getTutors);
router.delete('/tutors/:id', adminController.deleteTutor);

// Student routes
router.post('/students', adminController.addStudent);
router.get('/students', adminController.getStudents);
router.delete('/students/:id', adminController.deleteStudent);

// Dashboard stats
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;
