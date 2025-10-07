const express = require('express');
const auth = require('../middleware/auth.middleware');
const locationController = require('../controllers/location.controller');

const router = express.Router();
router.use(auth);

router.post('/', locationController.saveLocation);

module.exports = router;
