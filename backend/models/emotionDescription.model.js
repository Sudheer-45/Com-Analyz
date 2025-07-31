    // node_backend/models/emotionDescription.model.js
    import mongoose from 'mongoose';

    const EmotionDescriptionSchema = new mongoose.Schema({
        emotion: {
            type: String,
            required: true,
            unique: true, // e.g., "happy", "neutral", "sad"
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true // A general description of the emotion
        },
        interviewContext: {
            type: String,
            required: true,
            trim: true // How this emotion is typically perceived in an interview
        },
        colorCode: {
            type: String, // e.g., "#4CAF50" for happy, for UI styling
            default: "#cccccc"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    });

    const EmotionDescription = mongoose.model('EmotionDescription', EmotionDescriptionSchema);

    export default EmotionDescription;
    