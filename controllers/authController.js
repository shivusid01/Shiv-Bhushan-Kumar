import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import cloudinary from '../config/cloudinaryConfig.js';
import { sendVerificationEmail } from '../utils/emailService.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body; 
        const file = req.file;

        const existingUser = await User.findOne({ email });
        if (existingUser) 
            return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Optional profile image
        let profileImageUrl;
        if (file) {
            const uploadedImage = await cloudinary.uploader.upload(file.path, { folder: "profiles" });
            profileImageUrl = uploadedImage.secure_url;
        }

        const verificationCode = crypto.randomBytes(20).toString('hex');

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage: profileImageUrl || null,
            verificationCode,
            isVerified: false
        });

        await sendVerificationEmail(email, verificationCode);

        res.status(201).json({ message: "User registered. Check your email to verify account." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { code } = req.params;
        const user = await User.findOne({ verificationCode: code });

        if (!user) 
            return res.status(400).json({ message: "Invalid verification code" });

        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        res.json({ message: "Email verified successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) 
            return res.status(400).json({ message: "User not found" });

        if (!user.isVerified) 
            return res.status(403).json({ message: "Please verify your email first" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) 
            return res.status(400).json({ message: "Invalid credentials" });

        res.json({ message: `Hello ${user.name}`, userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
