import mongoose, { Schema } from 'mongoose';

const UserPathSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User' },
		pathTitle: String,
		pathDescription: String,
		assignedGoals: Number,
		completedGoals: Number,
	},
	{ timestamps: true }
);

const UserPaths =
	mongoose.models.UserPaths || mongoose.model('UserPaths', UserPathSchema);

export default UserPaths;
