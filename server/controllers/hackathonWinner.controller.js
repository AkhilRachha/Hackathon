import HackathonWinner from '../models/hackathonWinner.model.js';

// Get all winners with details
export const getWinners = async (req, res) => {
  try {
    const winners = await HackathonWinner.find()
      .populate('h_id')
      .populate('t_id')
      .populate('e_id');
    res.json(winners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single winner
export const getWinnerById = async (req, res) => {
  try {
    const winner = await HackathonWinner.findById(req.params.id)
      .populate('h_id')
      .populate('t_id')
      .populate('e_id');
    if (!winner) return res.status(404).json({ message: 'Winner not found' });
    res.json(winner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add winner
export const addWinner = async (req, res) => {
  try {
    const newWinner = new HackathonWinner(req.body);
    const savedWinner = await newWinner.save();
    res.status(201).json(savedWinner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update winner
export const updateWinner = async (req, res) => {
  try {
    const updated = await HackathonWinner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Winner not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete winner
export const deleteWinner = async (req, res) => {
  try {
    const deleted = await HackathonWinner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Winner not found' });
    res.json({ message: 'Winner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
