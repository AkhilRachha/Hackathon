import Question from "../models/question.model.js";
import {
    OK,
    CREATED,
    BAD_REQUEST,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

// --- Create Question ---
export const createQuestion = async (req, res) => {
    try {
        const { q_title, q_description, domain, evaluationCriteria } = req.body;
        if (!q_title || !domain) {
            return res.status(BAD_REQUEST).json({ message: "Title and domain are required." });
        }
        const newQuestion = new Question({ q_title, q_description, domain, evaluationCriteria });
        await newQuestion.save();
        res.status(CREATED).json({ message: "Question created successfully!", question: newQuestion });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Error creating question", error: error.message });
    }
};

// --- Get all Questions ---
export const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find({});
        res.status(OK).json(questions);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Error fetching questions", error: error.message });
    }
};

// --- Get Questions Grouped by Domain ---
export const getDomainsAndQuestions = async (req, res) => {
    try {
        const questions = await Question.find({});
        const grouped = {};

        questions.forEach((q) => {
            const domainName = q.domain.trim();
            if (!grouped[domainName]) {
                grouped[domainName] = {
                    name: domainName,
                    criteria: q.evaluationCriteria || [],
                    projects: []
                };
            }
            grouped[domainName].projects.push({
                _id: q._id,
                title: q.q_title,
                description: q.q_description,
            });
        });

        res.status(OK).json(Object.values(grouped));
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Error fetching grouped questions", error: error.message });
    }
};

// --- Get a Question by ID ---
export const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id);
        if (!question) {
            return res.status(NOT_FOUND).json({ message: "Question not found" });
        }
        res.status(OK).json(question);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Error fetching question", error: error.message });
    }
};

// --- Update Question ---
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { q_title, q_description, domain, evaluationCriteria } = req.body;
        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { q_title, q_description, domain, evaluationCriteria },
            { new: true, runValidators: true }
        );
        if (!updatedQuestion) {
            return res.status(NOT_FOUND).json({ message: "Question not found" });
        }
        res.status(OK).json({
            message: "Question updated successfully!",
            question: updatedQuestion,
        });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Error updating question", error: error.message });
    }
};

// --- Delete Question ---
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedQuestion = await Question.findByIdAndDelete(id);
        if (!deletedQuestion) {
            return res.status(NOT_FOUND).json({ message: "Question not found" });
        }
        res.status(OK).json({ message: "Question deleted successfully!" });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Error deleting question", error: error.message });
    }
};