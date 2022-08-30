import rootReducer from 'redux/reducers';
import { store } from 'redux/store';

export * from './topic';
export * from './cluster';
export * from './consumerGroup';
export * from './schema';
export * from './loader';

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
