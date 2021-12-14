import {
  ConsumerGroup,
  ConsumerGroupOffsetsResetType,
} from 'generated-sources';

import { ClusterName } from './cluster';

export type ConsumerGroupID = ConsumerGroup['groupId'];
export interface ConsumerGroupResetOffsetRequestParams {
  clusterName: ClusterName;
  consumerGroupID: ConsumerGroupID;
  requestBody: {
    topic: string;
    resetType: ConsumerGroupOffsetsResetType;
    partitionsOffsets?: { offset: string; partition: number }[];
    resetToTimestamp?: Date;
    partitions: number[];
  };
}
