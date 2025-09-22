import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    role_name: { type: String, enum: ['admin', 'evaluator', 'coordinator', 'participant'], required: true },
    description: { type: String }
});

const Role = mongoose.model('Role', roleSchema);

export default Role;