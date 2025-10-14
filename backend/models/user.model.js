import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    user_email: { type: String, required: true, unique: true },
    user_password: { type: String, required: true },
    user_phoneno: { type: String, required: true, unique: true }, // Ensure this field is present and unique
    clg_id: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    role_name: { 
        type: String, 
        default: 'participant',
        enum: ['admin', 'coordinator', 'evaluator', 'participant'] 
    },
    current_hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon',
        default: null 
    }
});

const User = mongoose.model('User', userSchema);

export default User;