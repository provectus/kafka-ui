import { ConsumerGroup, ConsumerGroupDetails } from 'generated-sources';

export type ConsumerGroupID = ConsumerGroup['groupId'];

export type ConsumerGroupDetailedInfo = ConsumerGroupDetails;

export interface ConsumerGroupsState {
  byID: { [consumerGroupID: string]: ConsumerGroupDetailedInfo };
  allIDs: ConsumerGroupID[];
}
