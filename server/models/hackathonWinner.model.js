import mongoose from 'mongoose';

const hackathonWinnerSchema = new mongoose.Schema({
  h_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  t_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  e_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation', required: true },
  position: {
    type: String,
    enum: ['Winner', '1stRunnerUp', '2ndRunnerUp'],
    required: true
  }
}, { timestamps: true });

const HackathonWinner = mongoose.model('HackathonWinner', hackathonWinnerSchema);
export default HackathonWinner;
