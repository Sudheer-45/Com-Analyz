import axios from 'axios';

// --- FALLBACK CACHE ---
// If the AI fails, we will use these questions instead of showing an error.
const fallbackQuestions = {
    Python: [
        { question: "Explain the difference between a list and a tuple in Python.", keyPoints: ["Mutability", "Performance", "Use Cases"], modelAnswer: "Lists are mutable, meaning their contents can be changed, while tuples are immutable. Tuples are generally faster and can be used as dictionary keys." },
        { question: "What are Python decorators?", keyPoints: ["Functions as arguments", "@ syntax", "Modifying behavior"], modelAnswer: "Decorators are functions that take another function as an argument, add some functionality to it, and then return the modified function. They are used to extend behavior without changing the original function's code." },
        { question: "What is a virtual environment and why is it important?", keyPoints: ["Isolated environment", "Dependency management", "Version conflict"], modelAnswer: "A virtual environment is a self-contained directory that holds a specific Python interpreter and its own set of installed packages. It's crucial for managing project-specific dependencies and avoiding version conflicts between different projects on the same machine." },
        { question: "Explain the difference between == and is in Python.", keyPoints: ["Value equality", "Object identity", "Memory location"], modelAnswer: "The '==' operator compares the values of two objects to see if they are equal. The 'is' operator checks if two variables point to the exact same object in memory." },
        { question: "What are list comprehensions?", keyPoints: ["Concise syntax", "Creating lists", "Readability"], modelAnswer: "List comprehensions provide a concise and often more readable way to create lists. For example, `[x*x for x in range(5)]` creates a list of squares more cleanly than a traditional for loop." },
        { question: "What does the `__init__` method do in a Python class?", keyPoints: ["Constructor", "Initialize attributes", "Called on instantiation"], modelAnswer: "The `__init__` method is the constructor for a Python class. It's automatically called when a new object (instance) of the class is created, and its primary role is to initialize the instance's attributes." },
        { question: "What are *args and **kwargs in Python function definitions?", keyPoints: ["Variable-length arguments", "Non-keyword arguments", "Keyword arguments", "Tuple and Dictionary"], modelAnswer: "`*args` allows a function to accept any number of non-keyword arguments, which are collected into a tuple. `**kwargs` allows a function to accept any number of keyword arguments, which are collected into a dictionary." },
        { question: "Briefly describe the GIL (Global Interpreter Lock) in Python.", keyPoints: ["Mutex", "Allows one thread at a time", "Impacts multithreading", "Not an issue for multiprocessing"], modelAnswer: "The Global Interpreter Lock, or GIL, is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecode at the same time. This means that even on a multi-core processor, only one thread can be executing Python code at once, which can be a bottleneck for CPU-bound, multi-threaded programs." },
    ]
    // You can add more domains here, like 'Java', 'React', etc.
};

// Helper function to add a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const generateCuratedQuestions = async (req, res) => {
    try {
        const { domain, difficulty } = req.body;
        if (!domain || !difficulty) {
            return res.status(400).json({ error: 'Domain and difficulty are required.' });
        }

        const constructedPrompt = `Generate a standard, 8-question interview for a candidate practicing for a "${domain}" role at a "${difficulty}" difficulty level.`;

        const pythonApiUrl = 'http://127.0.0.1:5001/generate-questions';
        let response;
        let attempts = 0;
        const maxAttempts = 2;

        // --- RETRY LOGIC ---
        while (attempts < maxAttempts) {
            try {
                console.log(`Attempt ${attempts + 1}: Forwarding curated request to Python...`);
                response = await axios.post(pythonApiUrl, { prompt: constructedPrompt });
                // If the request is successful, break the loop
                if (response.data && response.data.length > 0) {
                    console.log("AI generated questions successfully.");
                    return res.status(200).json(response.data);
                }
            } catch (error) {
                console.warn(`Attempt ${attempts + 1} failed.`, error.response?.data || error.message);
                attempts++;
                if (attempts < maxAttempts) {
                    await delay(1000); // Wait 1 second before retrying
                }
            }
        }

        // --- FALLBACK LOGIC ---
        // If all AI attempts fail, use our hardcoded questions.
        console.log("AI generation failed after multiple attempts. Using fallback questions.");
        if (fallbackQuestions[domain]) {
            return res.status(200).json(fallbackQuestions[domain]);
        } else {
            // If we don't even have a fallback for that domain, send an error.
            return res.status(500).json({ error: "Failed to generate interview questions and no fallback is available." });
        }

    } catch (error) {
        // This catches errors in the controller itself, not from the axios call.
        console.error("Critical error in generateCuratedQuestions controller:", error.message);
        res.status(500).json({ error: "An internal server error occurred." });
    }
};