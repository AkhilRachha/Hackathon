import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  // Dynamic array to store scores against the criteria
  criterionScores: [{
    criterionName: { type: String, required: true },
    score: { type: Number, required: true },
  }],
  
  evaluator_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true // The user (Evaluator) who submitted this score
  },
  
  total_score: { type: Number, required: true },
}, { timestamps: true });

const Score = mongoose.model('Score', scoreSchema);
export default Score;