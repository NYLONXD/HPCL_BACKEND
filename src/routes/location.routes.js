const express = require('express');
const Location = require('../models/location.model');
const Job = require('../models/complaint.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();
router.use(auth);

router.post('/', async (req, res) => {
  const { lat, lng, complaintId } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ message: 'lat & lng required as numbers' });

  const loc = await Location.create({ vendor: req.user.id, complaintId, lat, lng });

  // update job.lastLocation for fast fetch
  if (complaintId) {
    await Job.updateOne({ complaintId }, { $set: { lastLocation: { lat, lng, ts: new Date() } } });
  }

  // TODO: emit via Socket.IO to admin UI
  res.json({ message: 'location_saved', id: loc._id });
});

module.exports = router;
