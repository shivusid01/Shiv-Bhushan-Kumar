import express from 'express';
import { register, verifyEmail, login } from '../controllers/authController.js';
import upload from '../config/multer.js'; // Multer config

const router = express.Router();

// Profile image optional
router.post('/register', upload.single('profileImage'), register);
router.get('/verify/:code', verifyEmail);
router.post('/login', login);

export default router;
