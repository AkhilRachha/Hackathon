import Question from '../models/question.model.js';

// --- Create a new Question ---
export const createQuestion = async (req, res) => {
    try {
        const { q_title, q_description, domain } = req.body;

        // Basic validation
        if (!q_title || !domain) {
            return res.status(400).json({ message: "Title and domain are required." });
        }

        const newQuestion = new Question({
            q_title,
            q_description,
            domain
        });

        await newQuestion.save();
        res.status(201).json({ message: 'Question created successfully!', question: newQuestion });
    } catch (error) {
        // Handle potential duplicate key errors if you add unique fields
        if (error.code === 11000) {
            return res.status(409).json({ message: "A question with this identifier already exists.", error });
        }
        res.status(500).json({ message: 'Error creating question', error: error.message });
    }
};

// --- Get all Questions ---
export const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find({});
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

// --- Get a single Question by ID ---
export const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching question', error: error.message });
    }
};

// --- Update a Question by ID ---
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { q_title, q_description, domain } = req.body;

        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { q_title, q_description, domain },
            { new: true, runValidators: true } // {new: true} returns the updated document
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({ message: 'Question updated successfully!', question: updatedQuestion });
    } catch (error) {
        res.status(500).json({ message: 'Error updating question', error: error.message });
    }
};

// --- Delete a Question by ID ---
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({ message: 'Question deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
};
