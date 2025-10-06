const express = require('express');
const Job = require('../models/Job');
const Location = require('../models/Location');
const auth = require('../middleware/auth');
const { generateOtp, hashOtp, verifyOtp } = require('../utils/otp');
const sendOtp = require('../utils/sendOtp');

const router = express.Router();
router.use(auth);

// list jobs assigned to logged-in vendor (optionally filter by status)
router.get('/', async (req, res) => {
  const { status } = req.query;
  const query = { assignedTo: req.user.id };
  if (status) query.status = status;
  const jobs = await Job.find(query).select('-otp.hash').populate('assignedTo', 'username name');
  res.json(jobs);
});

// job detail by complaintId
router.get('/:complaintId', async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId }).populate('assignedTo', 'username name');
  if (!job)
     return res.status(404).json({ message: 'job not found' });

  const jobObj = job.toObject();
  if (jobObj.otp) delete jobObj.otp.hash;
  res.json(jobObj);
});

router.post('/:complaintId/accept', async (req, res) => {
  const { otp } = req.body;
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (!job) return res.status(404).json({ message: 'job not found' });
  if (!job.otp?.hash) return res.status(400).json({ message: 'otp not requested' });

  const valid = await verifyOtp(otp, job.otp.hash);
  if (!valid) return res.status(400).json({ message: 'invalid otp' });
  
  job.assignedTo = req.user.id;
  job.status = 'in_progress';
  job.otp = undefined;
  await job.save();

  res.json({ message: 'accepted' });
});

router.post('/:complaintId/request-otp', async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (!job) return res.status(404).json({ message: 'job not found' });

  const otp = generateOtp(6);
  const hash = await hashOtp(otp);

  job.otp = { hash, ts: Date.now() };
  await job.save();

  await sendOtp(req.user.phone, otp);
  res.json({ message: 'otp_sent' });
});

// submit safety checklist
router.post('/:complaintId/checklist', async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (!job) return res.status(404).json({ message: 'job not found' });
  if (String(job.assignedTo) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'not permitted' });

  job.checklist = {
    ppeWorn: !!req.body.ppeWorn,
    powerSwitchedOff: !!req.body.powerSwitchedOff,
    areaClear: !!req.body.areaClear
  };
  await job.save();
  res.json({ message: 'checklist_saved' });
});

// navigation link (Google Maps)
router.get('/:complaintId/navigation-link', async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (!job || !job.location?.lat) return res.status(404).json({ message: 'no location' });
  const { lat, lng } = job.location;
  const link = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  res.json({ link });
});

// quick meet link (Jitsi)
router.get('/:complaintId/meet-link', async (req, res) => {
  const room = `vendor-${req.params.complaintId}-${Date.now().toString(36)}`;
  const meetLink = `https://meet.jit.si/${room}`;
  await Job.updateOne({ complaintId: req.params.complaintId }, { meetLink });
  res.json({ meetLink });
});

// get latest saved location for job
router.get('/:complaintId/location', async (req, res) => {
  // preference: return Job.lastLocation if exists
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (job?.lastLocation?.ts) return res.json(job.lastLocation);

  // fallback to Location collection
  const latest = await Location.findOne({ complaintId: req.params.complaintId }).sort({ ts: -1 });
  if (!latest) return res.status(404).json({ message: 'no location yet' });
  res.json({ lat: latest.lat, lng: latest.lng, ts: latest.ts });
});

module.exports = router;
