import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    q_title: { type: String, required: true },
    q_description: { type: String, required: true }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;