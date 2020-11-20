import { ConsumerGroup, ConsumerGroupDetails } from 'generated-sources';

export type ConsumerGroupID = ConsumerGroup['consumerGroupId'];

export interface ConsumerGroupDetailedInfo
  extends ConsumerGroup,
    ConsumerGroupDetails {}

export interface ConsumerGroupsState {
  byID: { [consumerGroupID: string]: ConsumerGroupDetailedInfo };
  allIDs: ConsumerGroupID[];
}
