import { Action, BrokersState, ZooKeeperStatus } from 'redux/interfaces';
import { ClusterStats } from 'generated-sources';
import ActionType from 'redux/actionType';

export const initialState: BrokersState = {
  items: [],
  brokerCount: 0,
  zooKeeperStatus: ZooKeeperStatus.offline,
  activeControllers: 0,
  onlinePartitionCount: 0,
  offlinePartitionCount: 0,
  inSyncReplicasCount: 0,
  outOfSyncReplicasCount: 0,
  underReplicatedPartitionCount: 0,
  diskUsage: [],
};

const updateBrokerSegmentSize = (
  state: BrokersState,
  payload: ClusterStats
) => {
  const brokers = state.items;
  const { diskUsage } = payload;

  const items = brokers.map((broker) => {
    const brokerMetrics =
      diskUsage && diskUsage.find(({ brokerId }) => brokerId === broker.id);
    if (brokerMetrics !== undefined) {
      return { ...broker, ...brokerMetrics };
    }
    return broker;
  });

  return { ...state, items, ...payload };
};

const reducer = (state = initialState, action: Action): BrokersState => {
  switch (action.type) {
    case ActionType.GET_BROKERS__REQUEST:
      return initialState;
    case ActionType.GET_BROKERS__SUCCESS:
      return {
        ...state,
        items: action.payload,
      };
    case ActionType.GET_CLUSTER_STATS__SUCCESS:
      return updateBrokerSegmentSize(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
