import configureMockStore, { MockStoreCreator } from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { AnyAction, Middleware } from 'redux';
import { RootState } from 'redux/interfaces';

const middlewares: Array<Middleware> = [thunk];
type DispatchExts = ThunkDispatch<RootState, undefined, AnyAction>;

const mockStoreCreator: MockStoreCreator<RootState, DispatchExts> =
  configureMockStore<RootState, DispatchExts>(middlewares);

export default mockStoreCreator();
