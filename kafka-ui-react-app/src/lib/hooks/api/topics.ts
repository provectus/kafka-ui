import {
  topicsApiClient as api,
  messagesApiClient as messagesApi,
  consumerGroupsApiClient,
} from 'lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClusterName,
  TopicFormData,
  TopicFormDataRaw,
  TopicFormFormattedParams,
} from 'redux/interfaces';
import {
  CreateTopicMessage,
  GetTopicDetailsRequest,
  GetTopicsRequest,
  Topic,
  TopicConfig,
  TopicCreation,
  TopicUpdate,
} from 'generated-sources';
import { showServerError, showSuccessAlert } from 'lib/errorHandling';

export const topicKeys = {
  all: (clusterName: ClusterName) =>
    ['clusters', clusterName, 'topics'] as const,
  list: (
    clusterName: ClusterName,
    filters: Omit<GetTopicsRequest, 'clusterName'>
  ) => [...topicKeys.all(clusterName), filters] as const,
  details: ({ clusterName, topicName }: GetTopicDetailsRequest) =>
    [...topicKeys.all(clusterName), topicName] as const,
  config: (props: GetTopicDetailsRequest) =>
    [...topicKeys.details(props), 'config'] as const,
  schema: (props: GetTopicDetailsRequest) =>
    [...topicKeys.details(props), 'schema'] as const,
  consumerGroups: (props: GetTopicDetailsRequest) =>
    [...topicKeys.details(props), 'consumerGroups'] as const,
};

export function useTopics(props: GetTopicsRequest) {
  const { clusterName, ...filters } = props;
  return useQuery(topicKeys.list(clusterName, filters), () =>
    api.getTopics(props)
  );
}
export function useTopicDetails(props: GetTopicDetailsRequest) {
  return useQuery(topicKeys.details(props), () => api.getTopicDetails(props));
}
export function useTopicConfig(props: GetTopicDetailsRequest) {
  return useQuery(topicKeys.config(props), () => api.getTopicConfigs(props));
}
export function useTopicConsumerGroups(props: GetTopicDetailsRequest) {
  return useQuery(topicKeys.consumerGroups(props), () =>
    consumerGroupsApiClient.getTopicConsumerGroups(props)
  );
}

const topicReducer = (
  result: TopicFormFormattedParams,
  customParam: TopicConfig
) => {
  return {
    ...result,
    [customParam.name]: customParam.value,
  };
};
const formatTopicCreation = (form: TopicFormData): TopicCreation => {
  const {
    name,
    partitions,
    replicationFactor,
    cleanupPolicy,
    retentionBytes,
    retentionMs,
    maxMessageBytes,
    minInSyncReplicas,
    customParams,
  } = form;

  return {
    name,
    partitions,
    replicationFactor,
    configs: {
      'cleanup.policy': cleanupPolicy,
      'retention.ms': retentionMs.toString(),
      'retention.bytes': retentionBytes.toString(),
      'max.message.bytes': maxMessageBytes.toString(),
      'min.insync.replicas': minInSyncReplicas.toString(),
      ...Object.values(customParams || {}).reduce(topicReducer, {}),
    },
  };
};

export function useCreateTopic(clusterName: ClusterName) {
  const client = useQueryClient();
  return useMutation(
    (data: TopicFormData) =>
      api.createTopic({
        clusterName,
        topicCreation: formatTopicCreation(data),
      }),
    {
      onSuccess: () => {
        showSuccessAlert({
          message: `Topic successfully created.`,
        });
        client.invalidateQueries(topicKeys.all(clusterName));
      },
    }
  );
}

const formatTopicUpdate = (form: TopicFormDataRaw): TopicUpdate => {
  const {
    cleanupPolicy,
    retentionBytes,
    retentionMs,
    maxMessageBytes,
    minInSyncReplicas,
    customParams,
  } = form;

  return {
    configs: {
      ...Object.values(customParams || {}).reduce(topicReducer, {}),
      'cleanup.policy': cleanupPolicy,
      'retention.ms': retentionMs,
      'retention.bytes': retentionBytes,
      'max.message.bytes': maxMessageBytes,
      'min.insync.replicas': minInSyncReplicas,
    },
  };
};

export function useUpdateTopic(props: GetTopicDetailsRequest) {
  const client = useQueryClient();
  return useMutation(
    (data: TopicFormDataRaw) =>
      api.updateTopic({ ...props, topicUpdate: formatTopicUpdate(data) }),
    {
      onSuccess: () => {
        showSuccessAlert({
          message: `Topic successfully updated.`,
        });
        client.invalidateQueries(topicKeys.all(props.clusterName));
      },
    }
  );
}
export function useIncreaseTopicPartitionsCount(props: GetTopicDetailsRequest) {
  const client = useQueryClient();
  return useMutation(
    (totalPartitionsCount: number) =>
      api.increaseTopicPartitions({
        ...props,
        partitionsIncrease: { totalPartitionsCount },
      }),
    {
      onSuccess: () => {
        showSuccessAlert({
          message: `Number of partitions successfully increased`,
        });
        client.invalidateQueries(topicKeys.all(props.clusterName));
      },
    }
  );
}
export function useUpdateTopicReplicationFactor(props: GetTopicDetailsRequest) {
  const client = useQueryClient();
  return useMutation(
    (totalReplicationFactor: number) =>
      api.changeReplicationFactor({
        ...props,
        replicationFactorChange: { totalReplicationFactor },
      }),
    {
      onSuccess: () => {
        showSuccessAlert({
          message: `Replication factor successfully updated`,
        });
        client.invalidateQueries(topicKeys.all(props.clusterName));
      },
    }
  );
}
export function useDeleteTopic(clusterName: ClusterName) {
  const client = useQueryClient();
  return useMutation(
    (topicName: Topic['name']) => api.deleteTopic({ clusterName, topicName }),
    {
      onSuccess: (_, topicName) => {
        showSuccessAlert({
          message: `Topic ${topicName} successfully deleted!`,
        });
        client.invalidateQueries(topicKeys.all(clusterName));
      },
    }
  );
}
export function useRecreateTopic(props: GetTopicDetailsRequest) {
  const client = useQueryClient();
  return useMutation(() => api.recreateTopic(props), {
    onSuccess: () => {
      showSuccessAlert({
        message: `Topic ${props.topicName} successfully recreated!`,
      });
      client.invalidateQueries(topicKeys.all(props.clusterName));
    },
  });
}

export function useTopicMessageSchema(props: GetTopicDetailsRequest) {
  return useQuery(topicKeys.schema(props), () =>
    messagesApi.getTopicSchema(props)
  );
}
export function useSendMessage(props: GetTopicDetailsRequest) {
  const client = useQueryClient();
  return useMutation(
    (message: CreateTopicMessage) =>
      messagesApi.sendTopicMessages({ ...props, createTopicMessage: message }),
    {
      onSuccess: () => {
        showSuccessAlert({
          message: `Message successfully sent`,
        });
        client.invalidateQueries(topicKeys.all(props.clusterName));
      },
      onError: (e) => {
        showServerError(e as Response, {
          message: `Error in sending a message to ${props.topicName}`,
        });
      },
    }
  );
}
