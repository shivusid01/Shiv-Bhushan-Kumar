import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


export const sendVerificationEmail = async (email, code) => {
    try {
        
        const verificationUrl = `${process.env.BASE_URL}/api/auth/verify/${code}`;
        
        const mailOptions = {
            from: {
                name: 'Your App Name',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Verify Your Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <p>Thank you for registering! Please click the button below to verify your email address:</p>
                    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
                        Verify Email
                    </a>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all;">${verificationUrl}</p>
                    <p><strong>If the button doesn't work</strong>, please copy the entire link above and paste it into your browser's address bar.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        console.log('Verification URL:', verificationUrl);
        
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};