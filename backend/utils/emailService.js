import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create a single, reusable transporter object
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,         // smtp.gmail.com
    port: process.env.EMAIL_PORT,         // 587
    secure: false,                         // Use STARTTLS (not SSL) on port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// --- Function to send OTP Email ---
export const sendOtpEmail = async (userEmail, otp) => {
    try {
        const mailOptions = {
            from: `"Comm-Analyz" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Your Comm-Analyz Verification Code',
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Welcome to Comm-Analyz!</h2><p>Please use the following One-Time Password (OTP) to verify your email. This code is valid for 10 minutes.</p><p style="font-size: 24px; font-weight: bold;">${otp}</p><p>Best regards,<br>The Comm-Analyz Team</p></div>`,
        };
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully to:', userEmail);
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};

// --- Function to send Welcome Email ---
export const sendWelcomeEmail = async (userEmail, name) => {
    try {
        const mailOptions = {
            from: `"Comm-Analyz" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Welcome to Comm-Analyz! Your Account is Verified 🎉',
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Hello ${name},</h2><p>Your email has been successfully verified. Welcome to the Comm-Analyz community!</p><p>You can now log in and start practicing with our AI-powered interview coach.</p><p>Best regards,<br>The Comm-Analyz Team</p></div>`,
        };
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', userEmail);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

// --- Function to send Newsletter Subscription Email ---
export const sendSubscriptionEmail = async (userEmail) => {
    try {
        const mailOptions = {
            from: `"Comm-Analyz" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Thank You for Subscribing to Comm-Analyz! 📰',
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Thank you for subscribing!</h2><p>You'll now be among the first to receive updates on new features and expert interview tips.</p><p>Best regards,<br>The Comm-Analyz Team</p></div>`,
        };
        await transporter.sendMail(mailOptions);
        console.log('Subscription email sent successfully to:', userEmail);
    } catch (error) {
        console.error('Error sending subscription email:', error);
    }
};

export const sendContactEmail = async (name, email, subject, message) => {
    try {
        const mailOptions = {
            from: `"${name}" <${email}>`, // Sender's name and email from the form
            to: process.env.EMAIL_USER, // Your support email (your own Gmail account)
            subject: `Contact Form: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>New Contact Form Submission from Comm-Analyz</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <p style="border: 1px solid #eee; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">${message}</p>
                    <br>
                    <p>This email was sent from your Comm-Analyz website's contact form.</p>
                </div>
            `,
            replyTo: email, // Set reply-to so you can directly reply to the user
        };
        await transporter.sendMail(mailOptions);
        console.log('Contact form email sent successfully from:', email);
        return true;
    } catch (error) {
        console.error('Error sending contact form email:', error);
        return false;
    }
};