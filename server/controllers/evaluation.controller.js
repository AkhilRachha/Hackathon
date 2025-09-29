import Evaluation from '../models/evaluation.model.js';

// Get all evaluations with score + team populated
export const getEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate('score_id')
      .populate('t_id')
      .populate('h_id')
      .populate('q_id');
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single evaluation
export const getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('score_id')
      .populate('t_id')
      .populate('h_id')
      .populate('q_id');
    if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new evaluation
export const addEvaluation = async (req, res) => {
  try {
    const newEval = new Evaluation(req.body);
    const savedEval = await newEval.save();
    res.status(201).json(savedEval);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update evaluation
export const updateEvaluation = async (req, res) => {
  try {
    const updated = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Evaluation not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete evaluation
export const deleteEvaluation = async (req, res) => {
  try {
    const deleted = await Evaluation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Evaluation not found' });
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
