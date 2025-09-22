import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    user_email: { type: String, required: true, unique: true },
    user_phoneno: { type: String, required: true },
    user_github_url: { type: String, required: true },
    user_password: { type: String, required: true },
    clg_id: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    q_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
});

const User = mongoose.model('User', userSchema);

export default User;