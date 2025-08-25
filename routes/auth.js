import express from 'express';
import { register, login, verifyEmail } from '../controllers/authController.js';
import upload from '../middlewares/upload.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.post('/register', (req, res, next) => {
  upload.single('profileImage')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: 'Image upload failed', error: err.message });
    }
    next(); 
  });
}, register);


router.get('/verify/:code', verifyEmail);


router.post('/login', login);


router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;
