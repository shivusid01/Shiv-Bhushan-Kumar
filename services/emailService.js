import transporter from "../config/email.js";

export const sendWelcomeEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,   
      to: email,                      
      subject: "Welcome to Our App 🎉",
      html: `<h1>Hello ${userName},</h1>
             <p>Welcome to our application! We're excited to have you on board.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw error;
  }
};
