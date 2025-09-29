import Score from '../models/score.model.js';

// Get all scores
export const getScores = async (req, res) => {
  try {
    const scores = await Score.find();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single score by ID
export const getScoreById = async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ message: 'Score not found' });
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new score
export const addScore = async (req, res) => {
  try {
    const newScore = new Score(req.body);
    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update score
export const updateScore = async (req, res) => {
  try {
    const updated = await Score.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Score not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete score
export const deleteScore = async (req, res) => {
  try {
    const deleted = await Score.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Score not found' });
    res.json({ message: 'Score deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
