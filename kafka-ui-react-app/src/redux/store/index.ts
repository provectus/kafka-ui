import { configureStore } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import rootReducer from 'redux/reducers';

export const store = configureStore<RootState>({
  reducer: rootReducer,
});
