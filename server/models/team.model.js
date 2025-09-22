import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    team_name: { type: String, required: true },
    max_members: { type: Number, required: true },
    coordinator: { type: String },
    q_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    user_github_url: { type: String, required: true }
});

const Team = mongoose.model('Team', teamSchema);

export default Team;