import {
  ConsumerGroup,
  ConsumerGroupOffsetsResetType,
} from 'generated-sources';

import { ClusterName } from './cluster';

export interface ConsumerGroupResetOffsetRequestParams {
  clusterName: ClusterName;
  consumerGroupID: ConsumerGroup['groupId'];
  requestBody: {
    topic: string;
    resetType: ConsumerGroupOffsetsResetType;
    partitionsOffsets?: { offset: string; partition: number }[];
    resetToTimestamp?: Date;
    partitions: number[];
  };
}
