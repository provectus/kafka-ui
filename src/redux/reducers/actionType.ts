import topicsActionType from './topics/actionType';
import clustersActionType from './clusters/actionType';
import brokersActionType from './brokers/actionType';

export default {
  ...topicsActionType,
  ...clustersActionType,
  ...brokersActionType,
};
