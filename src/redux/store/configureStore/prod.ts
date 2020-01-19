import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../../reducers';

export default () => {
  const middlewares = [thunk]

  const enhancer = applyMiddleware(...middlewares);

  const store = createStore(rootReducer, undefined, enhancer);

  return store
};
