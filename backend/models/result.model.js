import mongoose from 'mongoose';

const questionAnalysisSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    transcribedText: { type: String, required: true },
    dominantEmotion: { type: String },
    wordsPerMinute: { type: Number },
    answerScore: { type: Number },
    sentimentScore: { type: Number, default: 0 }, // <-- ADD THIS FIELD
    keyPoints: [String],
    modelAnswer: { type: String },
    fillerWords: {
        count: { type: Number, default: 0},
        words: [String],
    },
    relevance: { type: String },
    clarity: { type: String },
    feedback: { type: String },
    answerScore: { type: Number },
    keyPoints: [String],
    modelAnswer: { type: String },
});

const resultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    interviewTopic: { type: String, required: true },
    interviewType: { type: String, required: true, enum: ['virtual', 'voice'] },
    overallScore: { type: Number, required: true },
    summary: { type: String },
    questionAnalyses: [questionAnalysisSchema],
}, { timestamps: true });

const Result = mongoose.model('Result', resultSchema);
export default Result;