import { Action, TopicsState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import * as _ from 'lodash';
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
