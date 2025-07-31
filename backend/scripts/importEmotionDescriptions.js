    // node_backend/scripts/importEmotionDescriptions.js
    import mongoose from 'mongoose';
    import dotenv from 'dotenv';
    import fs from 'fs';
    import EmotionDescription from '../models/emotionDescription.model.js'; // Adjust path if needed

    dotenv.config({ path: '../.env' }); // Load .env from parent directory (node_backend/.env)

    const emotionsFilePath = './data/emotionDescriptions.json'; // Path to your JSON data file

    async function importData() {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI not found in .env. Please set it.");
            process.exit(1);
        }

        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("MongoDB connected successfully for emotion data import.");

            // Clear existing data (optional, for fresh import)
            console.log("Clearing existing emotion descriptions...");
            await EmotionDescription.deleteMany({});
            console.log("Existing emotion descriptions cleared.");

            // Read JSON data
            const rawData = fs.readFileSync(emotionsFilePath, 'utf-8');
            const emotions = JSON.parse(rawData);

            // Insert data
            console.log(`Importing ${emotions.length} emotion descriptions...`);
            await EmotionDescription.insertMany(emotions);
            console.log("Emotion descriptions imported successfully!");

        } catch (error) {
            console.error("Error importing emotion data:", error);
            if (error.code === 11000) { // Duplicate key error
                console.error("Possible duplicate emotion found. Ensure 'emotion' field is unique.");
            }
        } finally {
            mongoose.disconnect();
            console.log("MongoDB disconnected.");
            process.exit();
        }
    }

    importData();
    