import { TopicsState, FetchStatus, Action } from 'types';
import actionType from 'redux/reducers/actionType';

export const initialState: TopicsState = {
  fetchStatus: FetchStatus.notFetched,
  items: [],
  brokers: undefined,
};

const reducer = (state = initialState, action: Action): TopicsState => {
  switch (action.type) {
    case actionType.TOPICS__FETCH_REQUEST:
      return {
        ...state,
        fetchStatus: FetchStatus.fetching,
      };
    case actionType.TOPICS__FETCH_SUCCESS:
      return {
        ...state,
        fetchStatus: FetchStatus.fetched,
        items: action.payload,
      };
    case actionType.TOPICS__FETCH_FAILURE:
      return {
        ...state,
        fetchStatus: FetchStatus.errorFetching,
      };

    case actionType.BROKERS__FETCH_REQUEST:
      return {
        ...state,
        brokers: undefined,
      };
    case actionType.BROKERS__FETCH_SUCCESS:
      return {
        ...state,
        brokers: action.payload,
      };
    case actionType.BROKERS__FETCH_FAILURE:
      return {
        ...state,
        brokers: undefined,
      };
    default:
      return state;
  }
};

export default reducer;
