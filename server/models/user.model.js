import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    user_email: { type: String, required: true, unique: true },
    user_password: { type: String, required: true },
    user_phoneno: { type: String, required: true },
    clg_id: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    role_id: { 
        type: String, 
        // Default role is participant
        default: '68d1f884ce0af1a5778f50c1' 
    }
});

const User = mongoose.model('User', userSchema);

export default User;
