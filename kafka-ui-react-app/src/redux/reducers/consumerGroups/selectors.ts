import { createSelector } from 'reselect';
import { ConsumerGroup, RootState, FetchStatus } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';


const consumerGroupsState = ({ consumerGroups }: RootState): ConsumerGroup[] => consumerGroups;

const getConsumerGroupsListFetchingStatus = createFetchingSelector('GET_CONSUMER_GROUPS');

export const getIsConsumerGroupsListFetched = createSelector(
  getConsumerGroupsListFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

export const getConsumerGroupsList = createSelector(consumerGroupsState, (consumerGroups) => consumerGroups);