import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'redux/reducers';

export default () => {
  const middlewares = [thunk];
  const enhancer = applyMiddleware(...middlewares);
  return createStore(rootReducer, undefined, enhancer);
};
