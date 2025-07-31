import Subscriber from '../models/subscriber.model.js';
import { sendSubscriptionEmail } from '../utils/emailService.js';

export const subscribeToNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email address is required.' });
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) return res.status(409).json({ message: 'This email is already subscribed!' });
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        sendSubscriptionEmail(email);
        res.status(201).json({ message: 'Thank you for subscribing!' });
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        res.status(500).json({ message: "An internal server error occurred." });
    }
};