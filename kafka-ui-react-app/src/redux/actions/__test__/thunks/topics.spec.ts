import fetchMock from 'fetch-mock-jest';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';
import { mockTopicsState } from 'redux/actions/__test__/fixtures';
import { FailurePayload } from 'redux/interfaces';
import { getResponse } from 'lib/errorHandling';

const store = mockStoreCreator;

const clusterName = 'local';
const topicName = 'localTopic';

describe('Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('deleteTopis', () => {
    it('creates DELETE_TOPIC__SUCCESS when deleting existing topic', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/topics/${topicName}`,
        200
      );
      await store.dispatch(thunks.deleteTopic(clusterName, topicName));
      expect(store.getActions()).toEqual([
        actions.deleteTopicAction.request(),
        actions.deleteTopicAction.success(topicName),
      ]);
    });

    it('creates DELETE_TOPIC__FAILURE when deleting existing topic', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/topics/${topicName}`,
        404
      );
      try {
        await store.dispatch(thunks.deleteTopic(clusterName, topicName));
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.deleteTopicAction.request(),
          actions.deleteTopicAction.failure(),
        ]);
      }
    });
  });

  describe('clearTopicMessages', () => {
    it('creates CLEAR_TOPIC_MESSAGES__SUCCESS when deleting existing messages', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        200
      );
      await store.dispatch(thunks.clearTopicMessages(clusterName, topicName));
      expect(store.getActions()).toEqual([
        actions.clearMessagesTopicAction.request(),
        actions.clearMessagesTopicAction.success(topicName),
      ]);
    });

    it('creates CLEAR_TOPIC_MESSAGES__FAILURE when deleting existing messages', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        404
      );
      try {
        await store.dispatch(thunks.clearTopicMessages(clusterName, topicName));
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.clearMessagesTopicAction.request(),
          actions.clearMessagesTopicAction.failure({}),
        ]);
      }
    });
  });

  describe('fetchTopicMessages', () => {
    it('creates GET_TOPIC_MESSAGES__FAILURE when deleting existing messages', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        404
      );
      try {
        await store.dispatch(
          thunks.fetchTopicMessages(clusterName, topicName, {})
        );
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.fetchTopicMessagesAction.request(),
          actions.fetchTopicMessagesAction.failure(),
        ]);
      }
    });
  });

  describe('fetchTopicConsumerGroups', () => {
    it('GET_TOPIC_CONSUMER_GROUPS__FAILURE', async () => {
      fetchMock.getOnce(
        `api/clusters/${clusterName}/topics/${topicName}/consumer-groups`,
        404
      );
      try {
        await store.dispatch(
          thunks.fetchTopicConsumerGroups(clusterName, topicName)
        );
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.fetchTopicConsumerGroupsAction.request(),
          actions.fetchTopicConsumerGroupsAction.failure(),
        ]);
      }
    });

    it('GET_TOPIC_CONSUMER_GROUPS__SUCCESS', async () => {
      fetchMock.getOnce(
        `api/clusters/${clusterName}/topics/${topicName}/consumer-groups`,
        200
      );
      try {
        await store.dispatch(
          thunks.fetchTopicConsumerGroups(clusterName, topicName)
        );
      } catch (error) {
        expect(error.status).toEqual(200);
        expect(store.getActions()).toEqual([
          actions.fetchTopicConsumerGroupsAction.request(),
          actions.fetchTopicConsumerGroupsAction.success(mockTopicsState),
        ]);
      }
    });
  });

  describe('increasing partitions count', () => {
    it('calls updateTopicPartitionsCountAction.success on success', async () => {
      fetchMock.patchOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/partitions`,
        { totalPartitionsCount: 4, topicName }
      );
      await store.dispatch(
        thunks.updateTopicPartitionsCount(clusterName, topicName, 4)
      );
      expect(store.getActions()).toEqual([
        actions.updateTopicPartitionsCountAction.request(),
        actions.updateTopicPartitionsCountAction.success(),
      ]);
    });

    it('calls updateTopicPartitionsCountAction.failure on failure', async () => {
      fetchMock.patchOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/partitions`,
        404
      );
      try {
        await store.dispatch(
          thunks.updateTopicPartitionsCount(clusterName, topicName, 4)
        );
      } catch (error) {
        const response = await getResponse(error);
        const alert: FailurePayload = {
          subject: ['topic-partitions', topicName].join('-'),
          title: `Topic ${topicName} partitions count increase failed`,
          response,
        };
        expect(store.getActions()).toEqual([
          actions.updateTopicPartitionsCountAction.request(),
          actions.updateTopicPartitionsCountAction.failure({ alert }),
        ]);
      }
    });
  });

  describe('updating replication factor', () => {
    it('calls updateTopicReplicationFactorAction.success on success', async () => {
      fetchMock.patchOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/replications`,
        { totalReplicationFactor: 4, topicName }
      );
      await store.dispatch(
        thunks.updateTopicReplicationFactor(clusterName, topicName, 4)
      );
      expect(store.getActions()).toEqual([
        actions.updateTopicReplicationFactorAction.request(),
        actions.updateTopicReplicationFactorAction.success(),
      ]);
    });

    it('calls updateTopicReplicationFactorAction.failure on failure', async () => {
      fetchMock.patchOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/replications`,
        404
      );
      try {
        await store.dispatch(
          thunks.updateTopicReplicationFactor(clusterName, topicName, 4)
        );
      } catch (error) {
        const response = await getResponse(error);
        const alert: FailurePayload = {
          subject: ['topic-replication-factor', topicName].join('-'),
          title: `Topic ${topicName} replication factor change failed`,
          response,
        };
        expect(store.getActions()).toEqual([
          actions.updateTopicReplicationFactorAction.request(),
          actions.updateTopicReplicationFactorAction.failure({ alert }),
        ]);
      }
    });
  });
});
