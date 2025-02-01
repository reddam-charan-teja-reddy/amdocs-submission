import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PathManagementState {
	customMsg: string;
	learningSpeed: 'slow' | 'medium' | 'fast';
	currentEducation: string;
	country: string;
	userId: string;
}

const initialState: PathManagementState = {
	customMsg: '',
	learningSpeed: 'medium',
	currentEducation: '',
	country: '',
	userId: '',
};

const userPathManagementSlice = createSlice({
	name: 'userPathManagement',
	initialState,
	reducers: {
		setUserPathManagement: (
			state,
			action: PayloadAction<PathManagementState>
		) => {
			return { ...state, ...action.payload };
		},
	},
});

export const { setUserPathManagement } =
	userPathManagementSlice.actions;
export default userPathManagementSlice.reducer;
export { initialState as userPathManagementInitialState };
