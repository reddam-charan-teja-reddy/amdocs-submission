import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@/hooks/storage';
import userInfoSlice from './userInfoSlice';
import userPathsSlice from './userPathsSlice';
import userInterestsSlice from './userInterestsSlice';
import userSkillsSlice from './userSkillsSlice';
import userPathManagementSlice from './userPathManagementSlice';
import roadmapsSlice from './roadmapsSlice';
import currentRoadmapSlice from './currentRoadmapSlice';

const persistConfig = {
	key: 'root',
	storage,
	whitelist: [
		'user',
		'userPaths',
		'userInterests',
		'userSkills',
		'userPathManagement',
		'currentRoadmap',
		'roadmaps',
	], // only persist these reducers
};

const rootReducer = combineReducers({
	user: userInfoSlice,
	userPaths: userPathsSlice,
	userInterests: userInterestsSlice,
	userSkills: userSkillsSlice,
	userPathManagement: userPathManagementSlice,
	roadmaps: roadmapsSlice,
	currentRoadmap: currentRoadmapSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
