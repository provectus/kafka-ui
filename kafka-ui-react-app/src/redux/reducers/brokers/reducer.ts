import {
  Action,
  BrokersState,
  ZooKeeperStatus,
  BrokerMetrics,
} from 'redux/interfaces';
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
  payload: BrokerMetrics
) => {
  const brokers = state.items;
  const { diskUsage } = payload;

  const items = brokers.map((broker) => {
    const brokerMetrics = diskUsage.find(
      ({ brokerId }) => brokerId === broker.brokerId
    );
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
    case ActionType.GET_BROKER_METRICS__SUCCESS:
      return updateBrokerSegmentSize(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
