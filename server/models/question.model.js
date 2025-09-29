import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  q_id: {
    type: Number,
    // required: true, - This is likely auto-managed, so let's not make it required from the app side
    unique: true
  },
  q_title: {
    type: String,
    required: true,
    trim: true
  },
  q_description: {
    type: String,
    // Not all titles might have a long description initially
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  // You might want to add criteria for evaluation here as well
  // For example:
  // evaluationCriteria: [{
  //   name: String,
  //   maxScore: Number
  // }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// To auto-increment q_id if you need it to be a simple number like 1, 2, 3...
// This is an advanced feature and requires a separate package or more complex logic.
// For now, we'll rely on MongoDB's default _id for uniqueness.

const Question = mongoose.model('Question', questionSchema);

export default Question;
