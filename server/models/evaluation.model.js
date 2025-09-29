import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  h_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  q_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  t_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  mid_sub_time: { type: Date },
  mid_sub_comments: { type: String },
  final_sub_time: { type: Date },
  final_sub_comments: { type: String },
  score_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Score' } 
}, { timestamps: true });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;
