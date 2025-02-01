import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface UserInterestsData {
	interests: string[];
	userId: string;
}
const userInterests: UserInterestsData = {
	interests: [],
	userId: '',
};

const userInterestsSlice = createSlice({
	name: 'userInterests',
	initialState: userInterests,
	reducers: {
		setUserInterests: (
			state,
			action: PayloadAction<UserInterestsData>
		) => {
			state.interests = action.payload.interests;
			state.userId = action.payload.userId;
		},
	},
});

export const { setUserInterests } = userInterestsSlice.actions;
export default userInterestsSlice.reducer;
