const ComplaintModel =  require("../models/complaint.model")

async function createComplaint(req, res) {
  try {
    console.log(req.body)
    const complaint = await ComplaintModel.create(req.body);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({"something went worng": err});
  }
}

async function getComplaints(req, res) {
  try {
    const complaints = await ComplaintModel.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getComplaintById(req, res) {
  try {
    const complaint = await ComplaintModel.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateComplaint(req, res) {
  try {
    const updated = await ComplaintModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Complaint not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteComplaint(req, res) {
  try {
    await ComplaintModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports =  {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
};
