"use client";

import { configureStore } from "@reduxjs/toolkit";
import {
	persistReducer,
	FLUSH,
	PAUSE,
	PURGE,
	persistStore,
	REGISTER,
	REHYDRATE,
	PERSIST,
} from "redux-persist";
import { rootReducer } from "../redux/root-reducer";
import logger from "redux-logger";
import storage from "./custom-storage";

const persistConfig = {
	key: "quiva-web",
	storage: storage,
	blacklist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware: any) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(logger),

	devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
export default store;
export type AppDispatch = typeof store.dispatch;
