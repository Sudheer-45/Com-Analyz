import { sendContactEmail } from '../utils/emailService.js';

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Send the email (doesn't wait for completion)
        sendContactEmail(name, email, subject, message);

        res.status(200).json({ message: 'Your message has been sent successfully!' });

    } catch (error) {
        console.error("Error submitting contact form:", error.message);
        res.status(500).json({ message: "An internal server error occurred." });
    }
};