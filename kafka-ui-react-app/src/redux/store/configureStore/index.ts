import devConfigureStore from './dev';
import prodConfigureStore from './prod';

const configureStore =
  process.env.NODE_ENV === 'production'
    ? prodConfigureStore
    : devConfigureStore;

export default configureStore;
