import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true, // Prevents duplicate email subscriptions
        trim: true,
        lowercase: true,
        // Basic email format validation
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address.'],
    },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;