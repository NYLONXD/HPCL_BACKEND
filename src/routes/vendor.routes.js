const express = require('express');
const auth = require('../middleware/auth.middleware');
const jobController = require('../controllers/vendor.controller');

const router = express.Router();
router.use(auth);

router.get('/', jobController.listJobs);
router.get('/:complaintId', jobController.getJobDetail);
router.post('/:complaintId/accept', jobController.acceptJob);
router.post('/:complaintId/request-otp', jobController.requestOtp);
router.post('/:complaintId/checklist', jobController.submitChecklist);
router.get('/:complaintId/navigation-link', jobController.getNavigationLink);
router.get('/:complaintId/meet-link', jobController.getMeetLink);
router.get('/:complaintId/location', jobController.getLocation);

module.exports = router;
