import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Milestone, Roadmap } from '@/utils/types';

interface CurrentRoadmapState {
	roadmap: Roadmap | null;
	loading: boolean;
	error: string | null;
}

const initialState: CurrentRoadmapState = {
	roadmap: null,
	loading: false,
	error: null,
};

const currentRoadmapSlice = createSlice({
	name: 'currentRoadmap',
	initialState,
	reducers: {
		setCurrentRoadmap: (
			state,
			action: PayloadAction<Roadmap | null>
		) => {
			state.roadmap = action.payload;
			state.error = null;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		updateMilestone: (
			state,
			action: PayloadAction<{
				index: number;
				milestone: Milestone;
			}>
		) => {
			if (state.roadmap) {
				state.roadmap.milestones[action.payload.index] =
					action.payload.milestone;
			}
		},
		clearCurrentRoadmap: (state) => {
			state.roadmap = null;
			state.loading = false;
			state.error = null;
		},
	},
});

export const {
	setCurrentRoadmap,
	setLoading,
	setError,
	updateMilestone,
	clearCurrentRoadmap,
} = currentRoadmapSlice.actions;

export default currentRoadmapSlice.reducer;
