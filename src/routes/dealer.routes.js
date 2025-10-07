const express = require("express")
const dealerfunc = require("../controllers/dealer.controller")
const auth = require('../middleware/auth.middleware');

const router = express.Router()
router.use(auth);

router.post("/createComplaint", dealerfunc.createComplaint);
router.get("/getComplaints", dealerfunc.getComplaints);
router.get("/getComplaintById/:id", dealerfunc.getComplaintById);
router.put("/updateComplaint/:id", dealerfunc.updateComplaint);
router.delete("/deleteComplaint/:id", dealerfunc.deleteComplaint);

module.exports = router