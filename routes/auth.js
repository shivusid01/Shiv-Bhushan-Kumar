import express from 'express';
import { register, verifyEmail, login, testEmail, getAllUsers } from '../controllers/authController.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'), register);
router.get('/verify/:code', verifyEmail);
router.post('/login', login);
router.get('/test-email', testEmail);
router.get('/all-users', getAllUsers); 

export default router;