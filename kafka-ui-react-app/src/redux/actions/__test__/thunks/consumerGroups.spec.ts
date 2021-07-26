import fetchMock from 'fetch-mock-jest';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import { FailurePayload } from 'redux/interfaces';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';

const store = mockStoreCreator;
const clusterName = 'local';
const id = 'test';

describe('Consumer Groups Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('deleting consumer groups', () => {
    it('calls DELETE_CONSUMER_GROUP__SUCCESS after successful delete', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/consumer-groups/${id}`,
        200
      );

      await store.dispatch(thunks.deleteConsumerGroup(clusterName, id));
      expect(store.getActions()).toEqual([
        actions.deleteConsumerGroupAction.request(),
        actions.deleteConsumerGroupAction.success(id),
      ]);
    });

    it('calls DELETE_CONSUMER_GROUP__FAILURE after successful delete', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/consumer-groups/${id}`,
        500
      );

      await store.dispatch(thunks.deleteConsumerGroup(clusterName, id));
      const alert: FailurePayload = {
        subject: ['consumer-group', id].join('-'),
        title: `Consumer Gropup ${id}`,
        response: {
          body: undefined,
          status: 500,
          statusText: 'Internal Server Error',
        },
      };
      expect(store.getActions()).toEqual([
        actions.deleteConsumerGroupAction.request(),
        actions.deleteConsumerGroupAction.failure({ alert }),
      ]);
    });
  });
});
