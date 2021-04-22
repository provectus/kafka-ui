import fetchMock from 'fetch-mock-jest';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';

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
});
