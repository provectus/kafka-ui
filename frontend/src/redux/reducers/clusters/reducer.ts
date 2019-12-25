import { ClustersState, FetchStatus, Action } from 'types';
import actionType from 'redux/reducers/actionType';

export const initialState: ClustersState = {
  fetchStatus: FetchStatus.notFetched,
  items: [],
};

const reducer = (state = initialState, action: Action): ClustersState => {
  switch (action.type) {
    case actionType.CLUSTERS__FETCH_REQUEST:
      return {
        ...state,
        fetchStatus: FetchStatus.fetching,
      };
    case actionType.CLUSTERS__FETCH_SUCCESS:
      return {
        ...state,
        fetchStatus: FetchStatus.fetched,
        items: action.payload,
      };
    case actionType.CLUSTERS__FETCH_FAILURE:
      return {
        ...state,
        fetchStatus: FetchStatus.errorFetching,
      };

    default:
      return state;
  }
};

export default reducer;
