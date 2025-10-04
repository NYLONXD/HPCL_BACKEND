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
  if (String(job.assignedTo?._id) !== req.user.id && req.user.role !== 'admin') 
    return res.status(403).json({ message: 'not permitted' });

  const jobObj = job.toObject();
  if (jobObj.otp) delete jobObj.otp.hash;
  res.json(jobObj);
});

// accept job
router.post('/:complaintId/accept', async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (!job) return res.status(404).json({ message: 'job not found' });
  if (String(job.assignedTo) !== req.user.id) return res.status(403).json({ message: 'not assigned to you' });
  job.status = 'in_progress';
  await job.save();
  res.json({ message: 'accepted' });
});


router.post('/:complaintId/')

// // generate OTP (5 minutes expiry)
// router.post('/:complaintId/generate-otp', async (req, res) => {
//   const job = await Job.findOne({ complaintId: req.params.complaintId }).populate('assignedTo', 'username name');
//   if (!job) return res.status(404).json({ message: 'job not found' });
//   if (String(job.assignedTo?._id) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'not permitted' });

//   const otp = generateOtp();
//   const otpHash = await hashOtp(otp);
//   job.otp = {
//     hash: otpHash,
//     expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//     verified: false
//   };
//   await job.save();

//   const vendorContact = req.body.contact || job.assignedTo?.username || 'unknown';
//   await sendOtp(vendorContact, `OTP for ${job.complaintId}: ${otp}`);

//   // For dev convenience, optionally return otp (DO NOT use in production)
//   if (process.env.SHOW_OTP === 'true') return res.json({ message: 'otp_sent', otp });

//   res.json({ message: 'otp_sent' });
// });

// // verify OTP
// router.post('/:complaintId/verify-otp', async (req, res) => {
//   const { otp } = req.body;
//   if (!otp) return res.status(400).json({ message: 'otp required' });

//   const job = await Job.findOne({ complaintId: req.params.complaintId });
//   if (!job || !job.otp?.hash) return res.status(400).json({ message: 'no otp generated' });
//   if (job.otp.expiresAt < new Date()) return res.status(400).json({ message: 'otp expired' });

//   const ok = await verifyOtp(otp, job.otp.hash);
//   if (!ok) return res.status(400).json({ message: 'invalid otp' });

//   job.otp.verified = true;
//   await job.save();
//   res.json({ message: 'otp_verified' });
// });

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
