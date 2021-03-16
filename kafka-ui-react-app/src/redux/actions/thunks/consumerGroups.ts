import { ConsumerGroupsApi, Configuration } from 'generated-sources';
import {
  ConsumerGroupID,
  PromiseThunkResult,
  ClusterName,
} from 'redux/interfaces';

import { BASE_PARAMS } from 'lib/constants';
import * as actions from '../actions';

const apiClientConf = new Configuration(BASE_PARAMS);
export const consumerGroupsApiClient = new ConsumerGroupsApi(apiClientConf);

export const fetchConsumerGroupsList = (
  clusterName: ClusterName
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchConsumerGroupsAction.request());
  try {
    const consumerGroups = await consumerGroupsApiClient.getConsumerGroups({
      clusterName,
    });
    dispatch(actions.fetchConsumerGroupsAction.success(consumerGroups));
  } catch (e) {
    dispatch(actions.fetchConsumerGroupsAction.failure());
  }
};

export const fetchConsumerGroupDetails = (
  clusterName: ClusterName,
  consumerGroupID: ConsumerGroupID
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchConsumerGroupDetailsAction.request());
  try {
    const consumerGroupDetails = await consumerGroupsApiClient.getConsumerGroup(
      {
        clusterName,
        id: consumerGroupID,
      }
    );
    dispatch(
      actions.fetchConsumerGroupDetailsAction.success({
        consumerGroupID,
        details: consumerGroupDetails,
      })
    );
  } catch (e) {
    dispatch(actions.fetchConsumerGroupDetailsAction.failure());
  }
};
