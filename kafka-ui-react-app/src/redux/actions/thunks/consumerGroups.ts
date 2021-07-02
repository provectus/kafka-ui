import { ConsumerGroupsApi, Configuration } from 'generated-sources';
import {
  ConsumerGroupID,
  PromiseThunkResult,
  ClusterName,
  FailurePayload,
} from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import { getResponse } from 'lib/errorHandling';
import * as actions from 'redux/actions/actions';

const apiClientConf = new Configuration(BASE_PARAMS);
export const consumerGroupsApiClient = new ConsumerGroupsApi(apiClientConf);

export const fetchConsumerGroupsList =
  (clusterName: ClusterName): PromiseThunkResult =>
  async (dispatch) => {
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

export const fetchConsumerGroupDetails =
  (
    clusterName: ClusterName,
    consumerGroupID: ConsumerGroupID
  ): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.fetchConsumerGroupDetailsAction.request());
    try {
      const consumerGroupDetails =
        await consumerGroupsApiClient.getConsumerGroup({
          clusterName,
          id: consumerGroupID,
        });
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

export const deleteConsumerGroup =
  (
    clusterName: ClusterName,
    consumerGroupID: ConsumerGroupID
  ): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.deleteConsumerGroupAction.request());
    try {
      await consumerGroupsApiClient.deleteConsumerGroup({
        clusterName,
        id: consumerGroupID,
      });
      dispatch(actions.deleteConsumerGroupAction.success(consumerGroupID));
    } catch (e) {
      const response = await getResponse(e);
      const alert: FailurePayload = {
        subject: ['consumer-group', consumerGroupID].join('-'),
        title: `Consumer Gropup ${consumerGroupID}`,
        response,
      };
      dispatch(actions.deleteConsumerGroupAction.failure({ alert }));
    }
  };
