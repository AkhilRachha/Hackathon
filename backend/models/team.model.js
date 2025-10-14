import mongoose from 'mongoose';
const { Schema } = mongoose;

const teamSchema = new Schema({
    team_name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    hackathon_id: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    coordinator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    q_id: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    user_github_url: { type: String, required: true },
    
    // --- ⬇️ ADD THIS NEW OBJECT ⬇️ ---
    mid_submission: {
        url: { type: String },
        submitted_at: { type: Date }
    },
    // --- This was the original submission field, now used for the final submission ---
    github_submission: {
        url: { type: String },
        submitted_at: { type: Date }
    },
    status: {
        type: String,
        enum: ['Active', 'Pending', 'Completed', 'Inactive'],
        default: 'Pending'
    },
    // Evaluator assignment for exclusive evaluation
    assigned_evaluator: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        default: null 
    },
    evaluation_status: {
        type: String,
        enum: ['available', 'being_evaluated', 'completed'],
        default: 'available'
    },
    evaluation_started_at: {
        type: Date,
        default: null
    },
    // New field to track if team is ready for evaluation
    ready_for_evaluation: {
        type: Boolean,
        default: false
    },
    // Track when team became ready for evaluation
    evaluation_ready_at: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

export default Team;