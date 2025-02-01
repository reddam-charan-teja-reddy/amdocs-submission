import mongoose from 'mongoose';

const howToSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
		enum: ['resource', 'course', 'activity', 'tool', 'book'],
	},
	description: { type: String, required: true },
	link: { type: String },
});

const milestoneSchema = new mongoose.Schema({
	title: { type: String, required: true },
	outcome: { type: String, required: true },
	how_to: [howToSchema],
	isCompleted: { type: Boolean, default: false },
	rating: { type: Number },
});

const roadmapSchema = new mongoose.Schema({
	id: { type: String, required: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	title: { type: String, required: true },
	goal: { type: String, required: true },
	milestones: [milestoneSchema],
	createdAt: { type: Date, default: Date.now },
	progress: { type: Number, default: 0 },
});

export default mongoose.models.Roadmap ||
	mongoose.model('Roadmap', roadmapSchema);
