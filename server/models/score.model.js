import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  problem_understanding: { type: Number, required: true },
  design_approach: { type: Number, required: true },
  implementation_clarity: { type: Number, required: true },
  code_organizing: { type: Number, required: true },
  code_readability: { type: Number, required: true },
  completion: { type: Number, required: true },
  presentation: { type: Number, required: true },
  usability: { type: Number, required: true },
  total_score: { type: Number, required: true }
}, { timestamps: true });

const Score = mongoose.model('Score', scoreSchema);
export default Score;
