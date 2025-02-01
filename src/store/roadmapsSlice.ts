import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Roadmap } from '@/utils/types';

interface RoadmapsState {
	roadmaps: Roadmap[];
	loading: boolean;
	error: string | null;
}

const initialState: RoadmapsState = {
	roadmaps: [],
	loading: false,
	error: null,
};

const roadmapsSlice = createSlice({
	name: 'roadmaps',
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		addRoadmap: (state, action: PayloadAction<Roadmap>) => {
			state.roadmaps.push(action.payload);
		},
		setRoadmaps: (state, action: PayloadAction<Roadmap[]>) => {
			state.roadmaps = action.payload;
		},
		updateRoadmap: (state, action: PayloadAction<Roadmap>) => {
			const index = state.roadmaps.findIndex((r) => r.id === action.payload.id);
			if (index !== -1) {
				state.roadmaps[index] = action.payload;
			}
		},
	},
});

export const { setLoading, setError, addRoadmap, setRoadmaps, updateRoadmap } =
	roadmapsSlice.actions;

export default roadmapsSlice.reducer;
