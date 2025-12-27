const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/domains', adminController.addDomain);
router.get('/domains', adminController.getDomains);

router.post('/batches', adminController.addBatch);
router.post('/students', adminController.addStudent);


router.get('/batches', adminController.getBatches);
router.get('/students', adminController.getStudents);
module.exports = router;
