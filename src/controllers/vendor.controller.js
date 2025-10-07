const Job = require('../models/complaint.model');
const Location = require('../models/location.model');
const { generateOtp, hashOtp, verifyOtp } = require('../utils/otp');
const sendOtp = require('../utils/twilio');

// list jobs assigned to logged-in vendor
exports.listJobs = async (req, res) => {
  const { status } = req.query;
  const query = { assignedTo: req.user.id };
  if (status) query.status = status;
  const jobs = await Job.find(query)
    .select('-otp.hash')
    .populate('assignedTo', 'username name');
  res.json(jobs);
};

// job detail by complaintId
exports.getJobDetail = async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId })
    .populate('assignedTo', 'username name');
  if (!job)
    return res.status(404).json({ message: 'job not found' });

  const jobObj = job.toObject();
  if (jobObj.otp) delete jobObj.otp.hash;
  res.json(jobObj);
};

// accept a job
exports.acceptJob = async (req, res) => {
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
};

// request OTP for a job
exports.requestOtp = async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (!job) return res.status(404).json({ message: 'job not found' });

  const otp = generateOtp(6);
  const hash = await hashOtp(otp);

  job.otp = { hash, ts: Date.now() };
  await job.save();

  await sendOtp(req.user.phone, otp);
  res.json({ message: 'otp_sent' });
};

// submit safety checklist
exports.submitChecklist = async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (!job) return res.status(404).json({ message: 'job not found' });
  if (String(job.assignedTo) !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'not permitted' });

  job.checklist = {
    ppeWorn: !!req.body.ppeWorn,
    powerSwitchedOff: !!req.body.powerSwitchedOff,
    areaClear: !!req.body.areaClear
  };
  await job.save();
  res.json({ message: 'checklist_saved' });
};

// get Google Maps navigation link
exports.getNavigationLink = async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (!job || !job.location?.lat) return res.status(404).json({ message: 'no location' });

  const { lat, lng } = job.location;
  const link = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  res.json({ link });
};

// get Jitsi meet link
exports.getMeetLink = async (req, res) => {
  const room = `vendor-${req.params.complaintId}-${Date.now().toString(36)}`;
  const meetLink = `https://meet.jit.si/${room}`;
  await Job.updateOne({ complaintId: req.params.complaintId }, { meetLink });
  res.json({ meetLink });
};

// get latest saved location
exports.getLocation = async (req, res) => {
  const job = await Job.findOne({ complaintId: req.params.complaintId });
  if (job?.lastLocation?.ts) return res.json(job.lastLocation);

  const latest = await Location.findOne({ complaintId: req.params.complaintId }).sort({ ts: -1 });
  if (!latest) return res.status(404).json({ message: 'no location yet' });
  res.json({ lat: latest.lat, lng: latest.lng, ts: latest.ts });
};
