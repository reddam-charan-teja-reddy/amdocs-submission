import mongoose, { Schema } from 'mongoose';

const skillSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	skills: { type: [String], default: [] },
});

const Skills = mongoose.models.Skills || mongoose.model('Skills', skillSchema);

export default Skills;
