import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createLeagcyFetchingSelector } from 'redux/reducers/loader/selectors';
import {
  ConsumerGroupID,
  ConsumerGroupsState,
} from 'redux/interfaces/consumerGroup';

const consumerGroupsState = ({
  consumerGroups,
}: RootState): ConsumerGroupsState => consumerGroups;

const getConsumerGroupsMap = (state: RootState) =>
  consumerGroupsState(state).byID;
const getConsumerGroupsIDsList = (state: RootState) =>
  consumerGroupsState(state).allIDs;

const getConsumerGroupsListFetchingStatus = createLeagcyFetchingSelector(
  'GET_CONSUMER_GROUPS'
);
const getConsumerGroupDetailsFetchingStatus = createLeagcyFetchingSelector(
  'GET_CONSUMER_GROUP_DETAILS'
);
const getConsumerGroupDeletingStatus = createLeagcyFetchingSelector(
  'DELETE_CONSUMER_GROUP'
);

const getOffsetResettingStatus = createLeagcyFetchingSelector('RESET_OFFSETS');

export const getIsConsumerGroupsListFetched = createSelector(
  getConsumerGroupsListFetchingStatus,
  (status) => status === 'fetched'
);

export const getIsConsumerGroupsDeleted = createSelector(
  getConsumerGroupDeletingStatus,
  (status) => status === 'fetched'
);

export const getIsConsumerGroupDetailsFetched = createSelector(
  getConsumerGroupDetailsFetchingStatus,
  (status) => status === 'fetched'
);

export const getOffsetReset = createSelector(
  getOffsetResettingStatus,
  (status) => status === 'fetched'
);

export const getConsumerGroupsList = createSelector(
  getIsConsumerGroupsListFetched,
  getConsumerGroupsMap,
  getConsumerGroupsIDsList,
  (isFetched, byID, ids) => {
    if (!isFetched) {
      return [];
    }

    return ids.map((key) => byID[key]);
  }
);

const getConsumerGroupID = (_: RootState, consumerGroupID: ConsumerGroupID) =>
  consumerGroupID;

export const getConsumerGroupByID = createSelector(
  getConsumerGroupsMap,
  getConsumerGroupID,
  (consumerGroups, consumerGroupID) => consumerGroups[consumerGroupID]
);
