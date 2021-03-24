import configureMockStore, {
  MockStoreCreator,
  MockStoreEnhanced,
} from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import fetchMock from 'fetch-mock-jest';
import { Middleware } from 'redux';
import { RootState, Action } from 'redux/interfaces';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';

const middlewares: Array<Middleware> = [thunk];
type DispatchExts = ThunkDispatch<RootState, undefined, Action>;

const mockStoreCreator: MockStoreCreator<
  RootState,
  DispatchExts
> = configureMockStore<RootState, DispatchExts>(middlewares);

const store: MockStoreEnhanced<RootState, DispatchExts> = mockStoreCreator();

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
});
