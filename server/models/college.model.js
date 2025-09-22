import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
    clg_name: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
});

const College = mongoose.model('College', collegeSchema);

export default College;