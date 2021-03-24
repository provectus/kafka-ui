import { createStore, applyMiddleware, compose } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { RootState } from 'redux/interfaces';
import { Action } from 'typesafe-actions';
import rootReducer from 'redux/reducers';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

export default () => {
  const middlewares = [thunk as ThunkMiddleware<RootState, Action>];
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const enhancer = composeEnhancers(applyMiddleware(...middlewares));
  return createStore(rootReducer, undefined, enhancer);
};
