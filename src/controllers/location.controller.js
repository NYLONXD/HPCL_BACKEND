const Location = require('../models/location.model');
const Job = require('../models/complaint.model');

/**
 * Save vendor location and update job.lastLocation
 */
exports.saveLocation = async (req, res) => {
  try {
    const { lat, lng, complaintId } = req.body;

    // Validate input
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'lat & lng required as numbers' });
    }

    // Save location
    const location = await Location.create({
      vendor: req.user.id,
      complaintId,
      lat,
      lng,
    });

    // Update Job.lastLocation if complaintId exists
    if (complaintId) {
      await Job.updateOne(
        { complaintId },
        { $set: { lastLocation: { lat, lng, ts: new Date() } } }
      );
    }

    // TODO: emit via Socket.IO to admin UI
    // Example:
    // req.app.get('io').emit('location_update', { complaintId, lat, lng });

    res.json({ message: 'location_saved', id: location._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error', error: err.message });
  }
};
