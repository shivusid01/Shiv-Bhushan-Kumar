import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,          
        pass: process.env.EMAIL_PASS,          
    },
});


export const sendVerificationEmail = async (email, code) => {
    try {
        const verificationUrl = `${process.env.BASE_URL}/verify/${code}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your account',
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your account.</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;  
    }
};
