import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserSkillsState {
	skills: string[];
	userId: string | null;
}

const initialState: UserSkillsState = {
	skills: [],
	userId: null,
};

const userSkillsSlice = createSlice({
	name: 'userSkills',
	initialState,
	reducers: {
		setUserSkills: (state, action: PayloadAction<UserSkillsState>) => {
			state.skills = action.payload.skills;
			state.userId = action.payload.userId;
		},
	},
});

export const { setUserSkills } = userSkillsSlice.actions;
export default userSkillsSlice.reducer;
