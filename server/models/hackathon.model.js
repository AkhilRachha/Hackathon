import mongoose from 'mongoose';
const { Schema } = mongoose;

const hackathonSchema = new Schema({
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    venue: { type: String, required: true },
    status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    coordinators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    evaluators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    winners: {
        firstPlace: { type: Schema.Types.ObjectId, ref: 'Team' },
        secondPlace: { type: Schema.Types.ObjectId, ref: 'Team' },
        thirdPlace: { type: Schema.Types.ObjectId, ref: 'Team' }
    }
}, { timestamps: true });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

export default Hackathon;