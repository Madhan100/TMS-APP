const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const complaintController = require('../controllers/complaintController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  },
});

const upload = multer({ storage });

/* REPORT ROUTE FIRST */
router.get('/report', auth, complaintController.generateReport);

/* CREATE COMPLAINT */
router.post('/', auth, upload.single('attachment'), complaintController.createComplaint);

/* STATS */
router.get('/stats', auth, complaintController.getStats);

/* LIST COMPLAINTS */
router.get('/', auth, complaintController.listComplaints);

/* GET SINGLE COMPLAINT */
router.get('/:id', auth, complaintController.getComplaintById);

/* ASSIGN */
router.patch('/:id/assign', auth, complaintController.assignComplaint);

/* UPDATE STATUS */
router.patch('/:id/status', auth, complaintController.updateStatus);

module.exports = router;