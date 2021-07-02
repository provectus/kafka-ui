import { ConsumerGroupsState } from 'redux/interfaces';
import reducer from 'redux/reducers/consumerGroups/reducer';
import * as actions from 'redux/actions';

const state: ConsumerGroupsState = {
  byID: {
    test: {
      clusterId: 'local',
      consumerGroupId: 'test',
    },
  },
  allIDs: ['test'],
};

describe('consumerGroup reducer', () => {
  describe('consumer group deletion', () => {
    it('correctly deletes a consumer group on deleteConsumerGroupAction.success', () => {
      expect(
        reducer(state, actions.deleteConsumerGroupAction.success('test'))
      ).toEqual({
        byID: {},
        allIDs: [],
      });
    });
  });
});
