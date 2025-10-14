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
  
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true // The hackathon this score belongs to
  },
  
  total_score: { type: Number, required: true },
  feedback: { type: String }, // Add feedback field
}, { timestamps: true });

const Score = mongoose.model('Score', scoreSchema);
export default Score;