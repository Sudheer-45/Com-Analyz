import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail, sendWelcomeEmail } from '../utils/emailService.js'; // Import new email functions

// --- THIS IS THE NEW, UPDATED register FUNCTION ---
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }
        
        // If user exists but is not verified, we can overwrite them to allow re-registration
        if (existingUser && !existingUser.isVerified) {
            await User.deleteOne({ email });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set OTP expiration to 10 minutes from now
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
        });

        await newUser.save();
        
        // Send the OTP email in the background
        sendOtpEmail(email, otp);

        res.status(201).json({ message: "Registration successful! Please check your email for an OTP to verify your account." });

    } catch (error) {
        console.error("Error in register controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// --- THIS IS THE NEW verifyOtp FUNCTION ---
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }

        const user = await User.findOne({ email }).select('+otp +otpExpires');
        if (!user) {
            return res.status(400).json({ message: "User not found. Please register first." });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "This account is already verified." });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP. Please try registering again." });
        }

        // --- Verification Successful ---
        user.isVerified = true;
        user.otp = undefined; // Clear the OTP fields
        user.otpExpires = undefined;
        await user.save();

        // Send a welcome email in the background
        sendWelcomeEmail(email, user.name);

        // Automatically log the user in by creating a JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: "Email verified successfully! You are now logged in.",
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (error) {
        console.error("Error in verifyOtp controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// --- UPDATE THE login FUNCTION ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        // --- ADD THIS CHECK ---
        // Prevent unverified users from logging in
        if (!user.isVerified) {
            return res.status(403).json({ error: "Your account is not verified. Please check your email for an OTP or register again." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("Error in login controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};