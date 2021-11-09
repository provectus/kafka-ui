import fetchMock from 'fetch-mock-jest';
import { ConsumerGroupOffsetsResetType } from 'generated-sources';
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
    it('calls DELETE_CONSUMER_GROUP__SUCCESS after a successful delete', async () => {
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

    it('calls DELETE_CONSUMER_GROUP__FAILURE after an unsuccessful delete', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/consumer-groups/${id}`,
        500
      );

      await store.dispatch(thunks.deleteConsumerGroup(clusterName, id));
      const alert: FailurePayload = {
        subject: ['consumer-group', id].join('-'),
        title: `Consumer Group ${id}`,
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

  describe('resetting consumer groups offset', () => {
    it('calls RESET_OFFSETS__SUCCESS after successful reset', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/consumer-groups/${id}/offsets`,
        200
      );

      await store.dispatch(
        thunks.resetConsumerGroupOffsets(clusterName, id, {
          partitions: [1],
          partitionsOffsets: [
            {
              offset: '10',
              partition: 1,
            },
          ],
          resetType: ConsumerGroupOffsetsResetType.OFFSET,
          topic: '__amazon_msk_canary',
        })
      );
      expect(store.getActions()).toEqual([
        actions.resetConsumerGroupOffsetsAction.request(),
        actions.resetConsumerGroupOffsetsAction.success(),
      ]);
    });

    it('calls RESET_OFFSETS__FAILURE after an unsuccessful reset', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/consumer-groups/${id}/offsets`,
        500
      );

      await store.dispatch(
        thunks.resetConsumerGroupOffsets(clusterName, id, {
          partitions: [1],
          partitionsOffsets: [
            {
              offset: '10',
              partition: 1,
            },
          ],
          resetType: ConsumerGroupOffsetsResetType.OFFSET,
          topic: '__amazon_msk_canary',
        })
      );
      const alert: FailurePayload = {
        subject: ['consumer-group', id].join('-'),
        title: `Consumer Group ${id}`,
        response: {
          body: undefined,
          status: 500,
          statusText: 'Internal Server Error',
        },
      };
      expect(store.getActions()).toEqual([
        actions.resetConsumerGroupOffsetsAction.request(),
        actions.resetConsumerGroupOffsetsAction.failure({ alert }),
      ]);
    });
  });
});
