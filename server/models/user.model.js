import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    user_email: { type: String, required: true, unique: true },
    user_password: { type: String, required: true },
    user_phoneno: { type: String, required: true },
    clg_id: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    role_name: { 
        type: String, 
        // This default is overridden if you provide a value like 'admin'
        default: 'participant' 
    }
});

const User = mongoose.model('User', userSchema);

export default User;
