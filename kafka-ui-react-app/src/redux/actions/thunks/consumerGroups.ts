import {
  ConsumerGroupsApi,
  Configuration,
  ConsumerGroupState,
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
      // const consumerGroups = await consumerGroupsApiClient.getConsumerGroups({
      //   clusterName,
      // });
      const consumerGroups = [
        {
          groupId: 'amazon.msk.canary.group.broker-1',
          members: 0,
          topics: 1,
          simple: false,
          partitionAssignor: '',
          state: ConsumerGroupState.DEAD,
          coordinator: {
            id: 2,
            host: 'b-2.kad-msk.st2jzq.c6.kafka.eu-west-1.amazonaws.com',
          },
          messagesBehind: 0,
        },
        {
          groupId: 'amazon.msk.canary.group.broker-2',
          members: 0,
          topics: 1,
          simple: false,
          partitionAssignor: '',
          state: ConsumerGroupState.EMPTY,
          coordinator: {
            id: 1,
            host: 'b-1.kad-msk.st2jzq.c6.kafka.eu-west-1.amazonaws.com',
          },
          messagesBehind: 0,
        },
      ];
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
      // const consumerGroupDetails =
      //   await consumerGroupsApiClient.getConsumerGroup({
      //     clusterName,
      //     id: consumerGroupID,
      //   });
      const consumerGroupDetails = {
        groupId: 'amazon.msk.canary.group.broker-1',
        members: 0,
        topics: 2,
        simple: false,
        partitionAssignor: '',
        state: ConsumerGroupState.EMPTY,
        coordinator: {
          id: 2,
          host: 'b-2.kad-msk.st2jzq.c6.kafka.eu-west-1.amazonaws.com',
        },
        messagesBehind: 0,
        partitions: [
          {
            topic: '__amazon_msk_canary',
            partition: 1,
            currentOffset: 0,
            endOffset: 0,
            messagesBehind: 0,
            consumerId: undefined,
            host: undefined,
          },
          {
            topic: '__amazon_msk_canary',
            partition: 0,
            currentOffset: 56932,
            endOffset: 56932,
            messagesBehind: 0,
            consumerId: undefined,
            host: undefined,
          },
          {
            topic: 'other_topic',
            partition: 3,
            currentOffset: 56932,
            endOffset: 56932,
            messagesBehind: 0,
            consumerId: undefined,
            host: undefined,
          },
          {
            topic: 'other_topic',
            partition: 4,
            currentOffset: 56932,
            endOffset: 56932,
            messagesBehind: 0,
            consumerId: undefined,
            host: undefined,
          },
        ],
      };
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
