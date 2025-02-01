// models/interest.ts
import mongoose, { Schema } from 'mongoose';

const interestSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	interests: { type: [String], default: [] }, // Changed from 'intrest' to 'interests'
});

const Interests =
	mongoose.models.Interests || mongoose.model('Interests', interestSchema);

export default Interests;
