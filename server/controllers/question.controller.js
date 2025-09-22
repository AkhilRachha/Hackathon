import Question from '../models/question.model.js';

export const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error });
    }
};

export const addQuestion = async (req, res) => {
    try {
        const { q_title, q_description } = req.body;
        const newQuestion = new Question({ q_title, q_description });
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Error adding question', error });
    }
};