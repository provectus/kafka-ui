import { Action, BrokersState, ZooKeeperStatus } from 'types';
import actionType from 'redux/reducers/actionType';

export const initialState: BrokersState =  {
  items: [],
  brokerCount: 0,
  zooKeeperStatus: ZooKeeperStatus.offline,
  activeControllers: 0,
  networkPoolUsage: 0,
  requestPoolUsage: 0,
  onlinePartitionCount: 0,
  offlinePartitionCount: 0,
  underReplicatedPartitionCount: 0,
  diskUsageDistribution: undefined,
};

const reducer = (state = initialState, action: Action): BrokersState => {
  switch (action.type) {
    case actionType.GET_BROKERS__SUCCESS:
      return {
        ...state,
        items: action.payload,
      };
    case actionType.GET_BROKER_METRICS__SUCCESS:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
