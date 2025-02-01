import mongoose, { Schema } from 'mongoose';

const pathManagementSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	customMsg: { type: String, default: '' },
	learningSpeed: {
		type: String,
		default: 'medium',
	},
	currentEducation: { type: String, default: '' },
	country: { type: String, default: '' },
	updatedAt: { type: Date, default: Date.now },
});

const PathManagement =
	mongoose.models.PathManagement ||
	mongoose.model('PathManagement', pathManagementSchema);

export default PathManagement;
