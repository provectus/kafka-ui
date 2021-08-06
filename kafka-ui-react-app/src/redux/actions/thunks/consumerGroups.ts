import {
  ConsumerGroupsApi,
  Configuration,
  ConsumerGroupOffsetsResetType,
} from 'generated-sources';
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
      const response = await getResponse(e);
      const alert: FailurePayload = {
        subject: ['consumer-groups', clusterName].join('-'),
        title: `Consumer Gropups`,
        response,
      };
      dispatch(actions.fetchConsumerGroupsAction.failure({ alert }));
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
      const response = await getResponse(e);
      const alert: FailurePayload = {
        subject: ['consumer-group', consumerGroupID].join('-'),
        title: `Consumer Gropup ${consumerGroupID}`,
        response,
      };
      dispatch(actions.fetchConsumerGroupDetailsAction.failure({ alert }));
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

export const resetConsumerGroupOffsets =
  (
    clusterName: ClusterName,
    consumerGroupID: ConsumerGroupID,
    requestBody: {
      topic: string;
      resetType: ConsumerGroupOffsetsResetType;
      partitionsOffsets?: { offset: string; partition: number }[];
      resetToTimestamp?: Date;
      partitions: number[];
    }
  ): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.resetConsumerGroupOffsetsAction.request());
    try {
      await consumerGroupsApiClient.resetConsumerGroupOffsets({
        clusterName,
        id: consumerGroupID,
        consumerGroupOffsetsReset: {
          topic: requestBody.topic,
          resetType: requestBody.resetType,
          partitions: requestBody.partitions,
          partitionsOffsets: requestBody.partitionsOffsets?.map((offset) => ({
            ...offset,
            offset: +offset.offset,
          })),
          resetToTimestamp: requestBody.resetToTimestamp?.getTime(),
        },
      });
      dispatch(actions.resetConsumerGroupOffsetsAction.success());
    } catch (e) {
      const response = await getResponse(e);
      const alert: FailurePayload = {
        subject: ['consumer-group', consumerGroupID].join('-'),
        title: `Consumer Gropup ${consumerGroupID}`,
        response,
      };
      dispatch(actions.resetConsumerGroupOffsetsAction.failure({ alert }));
    }
  };
