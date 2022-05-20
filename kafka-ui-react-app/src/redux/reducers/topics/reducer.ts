import { Action, TopicsState } from 'redux/interfaces';
import { SortOrder, TopicColumnsToSort } from 'generated-sources';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
  totalPages: 1,
  search: '',
  orderBy: TopicColumnsToSort.NAME,
  sortOrder: SortOrder.ASC,
  consumerGroups: [],
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const reducer = (state = initialState, action: Action): TopicsState => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
