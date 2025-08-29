import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import cloudinary from '../config/cloudinaryConfig.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import nodemailer from 'nodemailer';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body; 
        const file = req.file;

        console.log(' Registration attempt for:', email);

        if (!name || !email || !password) {
            console.log(' Missing name, email or password');
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(' Email already exists:', email);
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        console.log(' Password hashed successfully');

        let profileImageUrl;
        if (file) {
            try {
                console.log(' Uploading profile image...');
                const uploadedImage = await cloudinary.uploader.upload(file.path, { folder: "profiles" });
                profileImageUrl = uploadedImage.secure_url;
                console.log(' Profile image uploaded:', profileImageUrl);
            } catch (uploadError) {
                console.error(' Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: "Error uploading profile image" });
            }
        }

        const verificationCode = crypto.randomBytes(20).toString('hex');
        console.log('🔑 Generated verification code:', verificationCode);

       
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage: profileImageUrl || null,
            verificationCode,
            isVerified: false
        });

        console.log(' User created in database:', newUser.email);

        
        let emailSent = false;
        try {
            console.log(' Attempting to send verification email...');
            await sendVerificationEmail(email, verificationCode);
            emailSent = true;
            console.log(' Verification email sent successfully');
        } catch (emailError) {
            console.error(' Email sending failed:', emailError);
          
            const verificationUrl = `${process.env.BASE_URL}/api/auth/verify/${verificationCode}`;
            console.log(' DEVELOPMENT MODE: Verification URL:', verificationUrl);
        }

        res.status(201).json({ 
            message: emailSent 
                ? "User registered successfully. Please check your email to verify your account."
                : "User registered successfully. Email verification could not be sent.",
            userId: newUser._id,
      
            verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        });
    } catch (error) {
        console.error(' Registration error:', error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { code } = req.params;
        console.log(' Verification attempt with code:', code);
        
        const user = await User.findOne({ verificationCode: code });
        console.log(' User found:', user ? user.email : 'None');

        if (!user) {
            console.log(' Invalid verification code');
            return res.status(400).json({ message: "Invalid verification code" });
        }

        console.log(' User verification status before:', user.isVerified);
        
        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        console.log(' Email verified successfully for:', user.email);
        console.log(' User verification status after: true');
        
        res.json({ message: "Email verified successfully! You can now login." });
    } catch (error) {
        console.error(' Verification error:', error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(' Login attempt for email:', email);

        
        if (!email || !password) {
            console.log(' Missing email or password');
            return res.status(400).json({ message: "Email and password are required" });
        }

       
        const user = await User.findOne({ email });
        console.log(' User found:', user ? user.email : 'None');
        
        if (!user) {
            console.log(' User not found');
            return res.status(400).json({ message: "Invalid email or password" });
        }

        
        console.log(' User verification status:', user.isVerified);
        if (!user.isVerified) {
            console.log(' Email not verified');
            return res.status(403).json({ message: "Please verify your email first" });
        }

      
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔑 Password match:', isMatch);
        
        if (!isMatch) {
            console.log(' Password does not match');
            return res.status(400).json({ message: "Invalid email or password" });
        }

        console.log(' Login successful for:', user.email);
        
        res.json({ 
            message: `Login successful! Welcome ${user.name}`,
            userId: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error(' Login error:', error);
        res.status(500).json({ message: "Server Error" });
    }
};


export const testEmail = async (req, res) => {
    try {
        const testTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const info = await testTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email',
            text: 'This is a test email from your application'
        });
        
        res.json({ message: 'Test email sent successfully', response: info.response });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ message: 'Test email failed', error: error.message });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        console.log(' All users in database:');
        users.forEach(user => {
            console.log(`- ${user.email} (Verified: ${user.isVerified})`);
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};