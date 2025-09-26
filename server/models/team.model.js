import mongoose from 'mongoose';
const { Schema } = mongoose; // Import Schema for easier referencing

const teamSchema = new Schema({
    team_name: { 
        type: String, 
        required: true,
        unique: true 
    },
    max_members: { 
        type: Number, 
        required: true 
    },
    // --- THIS IS THE CRITICAL ADDITION ---
    // This field will store an array of user IDs.
    members: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    coordinator: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    q_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Question' 
    },
    user_github_url: { 
        type: String, 
        required: true 
    },
    status: {
        type: String,
        enum: ['Active', 'Pending', 'Completed', 'Inactive'],
        default: 'Pending'
    }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

export default Team;