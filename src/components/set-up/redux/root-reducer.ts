"use client";
import { combineReducers } from "redux";
import generalReducer from './slices/generalSlice';

export const rootReducer = combineReducers({
	general: generalReducer
});
export type RootState = ReturnType<typeof rootReducer>;
