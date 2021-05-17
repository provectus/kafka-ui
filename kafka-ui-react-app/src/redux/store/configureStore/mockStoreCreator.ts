import configureMockStore, { MockStoreCreator } from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { Middleware } from 'redux';
import { RootState, Action } from 'redux/interfaces';

const middlewares: Array<Middleware> = [thunk];
type DispatchExts = ThunkDispatch<RootState, undefined, Action>;

const mockStoreCreator: MockStoreCreator<RootState, DispatchExts> =
  configureMockStore<RootState, DispatchExts>(middlewares);

export default mockStoreCreator();
