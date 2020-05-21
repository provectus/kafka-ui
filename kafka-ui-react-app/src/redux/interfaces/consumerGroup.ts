export type ConsumerGroupID = string;

export interface ConsumerGroup {
  consumerGroupId: ConsumerGroupID;
  numConsumers: number;
  numTopics: number;
}

export interface ConsumerGroupDetails {
  consumerGroupId: ConsumerGroupID;
  numConsumers: number;
  numTopics: number;
  consumers: Consumer[];
}

export interface Consumer {
  consumerId: string;
  topic: string;
  partition: number;
  messagesBehind: number;
  currentOffset: number;
  endOffset: number;
}

export interface ConsumerGroupDetailedInfo extends ConsumerGroup, ConsumerGroupDetails {
}

export interface ConsumerGroupsState {
  byID: { [consumerGroupID: string]: ConsumerGroupDetailedInfo },
  allIDs: string[]
}