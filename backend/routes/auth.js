const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || 'File upload failed' });
  }
  next();
};

router.post('/register', upload.single('image'), handleUploadError, register);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;