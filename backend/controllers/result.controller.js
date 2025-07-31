import Result from '../models/result.model.js';

/**
 * @desc    Get all results for the currently logged-in user.
 * @route   GET /api/results/my-results
 * @access  Private (requires authentication)
 */
export const getMyResults = async (req, res) => {
    try {
        // The `protect` middleware has already verified the user and attached
        // their data to `req.user`. We use `req.user._id` to find their results.
        
        // Find all documents in the 'Result' collection where the `userId`
        // matches the ID of the logged-in user.
        // `.sort({ createdAt: -1 })` sorts the results to show the newest ones first.
        const results = await Result.find({ userId: req.user._id }).sort({ createdAt: -1 });

        // Send the found results back to the frontend as a JSON array.
        res.status(200).json(results);

    } catch (error) {
        // If anything goes wrong, log the error and send a 500 status.
        console.error("Error in getMyResults controller:", error.message);
        res.status(500).json({ error: "Failed to fetch interview results." });
    }
};

export const getResultById = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        // --- SECURITY CHECK ---
        // Ensure the logged-in user is the owner of the result
        if (result.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view this result' });
        }

        res.json(result);

    } catch (error) {
        console.error("Error fetching single result:", error.message);
        res.status(500).json({ error: "Failed to fetch result." });
    }
};
// In the future, you could add more functions here, like:
// export const getResultById = async (req, res) => { ... }
// export const deleteResult = async (req, res) => { ... }