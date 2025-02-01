import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PathData } from '@/utils/types';
interface userPathsData {
	paths: PathData[];
	userId: string;
}
const userPaths: userPathsData = {
	paths: [],
	userId: '',
};

const userPathsSlice = createSlice({
	name: 'userPaths',
	initialState: userPaths,
	reducers: {
		setUserPaths: (state, action: PayloadAction<userPathsData>) => {
			state.paths = action.payload.paths;
			state.userId = action.payload.userId;
		},
	},
});

export const { setUserPaths } = userPathsSlice.actions;
export default userPathsSlice.reducer;
