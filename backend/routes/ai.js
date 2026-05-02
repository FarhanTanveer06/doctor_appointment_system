const express = require('express');
const router = express.Router();
const { assistant } = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

router.post('/assistant', assistant); // Removed auth for public access

module.exports = router;