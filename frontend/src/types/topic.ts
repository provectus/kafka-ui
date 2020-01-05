import { FetchStatus } from 'types';

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

export interface Topic {
  name: TopicName;
  internal: boolean;
  partitions: TopicPartition[];
}

export interface TopicsState {
  fetchStatus: FetchStatus;
  items: Topic[];
  brokers?: Broker[];
}

export interface Broker {
  id: 1,
  host: "broker",
};
