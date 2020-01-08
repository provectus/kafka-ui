export type TopicName = string;
export interface TopicConfigs {
  [key: string]: string;
}

export interface TopicReplica {
  broker: number;
  leader: boolean;
  inSync: true;
}

export interface TopicPartition {
  partition: number;
  leader: number;
  replicas: TopicReplica[];
}

export interface TopicDetails {
  partitionCount?: number;
  replicationFactor?: number;
  replicas?: number;
  segmentSize?: number;
  inSyncReplicas?: number;
  segmentCount?: number;
  underReplicatedPartitions?: number;
}

export interface Topic {
  name: TopicName;
  internal: boolean;
  partitions: TopicPartition[];
}

export interface TopicsState {
  byName: { [topicName: string]: Topic & TopicDetails },
  allNames: TopicName[],
}
