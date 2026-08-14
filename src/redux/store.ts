import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import generalReducer from './slices/generalSlice';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import comicReducer from './slices/comicSlice';
import transactionReducer from './slices/transactionSlice';
import collectionReducer from './slices/collectionSlice';
import mirrorNodeAnalyticsReducer from './slices/analyticSlide';
import dashboardReducer from './slices/dashboardSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'wallet', 'comic', 'collections']
};

const rootReducer = combineReducers({
  general: generalReducer,
  auth: authReducer,
  wallet: walletReducer,
  comic: comicReducer,
  transactions: transactionReducer,
  collections: collectionReducer,
  mirrorNodeAnalytics: mirrorNodeAnalyticsReducer,
  dashboard: dashboardReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER'
        ]
      }
    })
});

// Use store.getState for type inference; cast through any to preserve slice keys from JS reducers
export type RootState = ReturnType<typeof store.getState> & {
  auth: any;
  wallet: any;
  comic: any;
  general: any;
  transactions: any;
  collections: any;
  mirrorNodeAnalytics: any;
  dashboard: any;
};
export type AppDispatch = typeof store.dispatch;

export default store;
export const persistor = persistStore(store);
