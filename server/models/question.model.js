import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  q_title: {
    type: String,
    required: true,
    trim: true
  },
  q_description: {
    type: String,
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  evaluationCriteria: [{
    name: { type: String, required: true },
    maxScore: { type: Number, required: true, default: 10 }
  }]
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;