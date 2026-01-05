import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import generalReducer from './slices/generalSlice';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import comicReducer from './slices/comicSlice';
import transactionReducer from './slices/transactionSlice';
import collectionReducer from './slices/collectionSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'wallet']
};

const rootReducer = combineReducers({
  general: generalReducer,
  auth: authReducer,
  wallet: walletReducer,
  comic: comicReducer,
  transactions: transactionReducer,
  collections: collectionReducer
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
export const persistor = persistStore(store);
