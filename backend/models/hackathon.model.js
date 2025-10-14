import mongoose from 'mongoose';
const { Schema } = mongoose;

const hackathonSchema = new Schema({
    hackathon_name: { type: String, required: true, maxlength: 20 },
    start_datetime: { type: Date, required: true },
    mid_submission_datetime: { type: Date, required: true },
    end_datetime: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    venue: { type: String, required: true },
    status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
    completedReason: { 
        type: String, 
        enum: ['time_ended', 'insufficient_participants', 'winners_announced'], 
        required: false 
    },
    completedAt: { type: Date, required: false },
    
    // Limits for hackathon
    limits: {
        totalParticipants: { type: Number, required: true, min: 1 },
        totalTeams: { type: Number, required: true, min: 1 },
        totalCoordinators: { type: Number, required: true, min: 1 },
        totalEvaluators: { type: Number, required: true, min: 1 },
        maxMembersPerTeam: { type: Number, required: true, min: 2 }
    },
    
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    coordinators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    evaluators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    winners: {
        firstPlace: { type: Schema.Types.ObjectId, ref: 'Team' },
        secondPlace: { type: Schema.Types.ObjectId, ref: 'Team' },
        thirdPlace: { type: Schema.Types.ObjectId, ref: 'Team' }
    },
    winnersAnnouncedAt: { type: Date }
}, { timestamps: true });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

export default Hackathon;