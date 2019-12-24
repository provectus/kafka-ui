import { FetchStatus } from 'types';

export type TopicName = string;
export interface TopicConfigs {
  [key: string]: string;
}

export interface TopicReplica {
  broker: number;
  leader: boolean;
  in_sync: true;
}

export interface TopicPartition {
  partition: number;
  leader: number;
  replicas: TopicReplica[];
}

export interface Topic {
  name: TopicName;
  configs: TopicConfigs;
  partitions: TopicPartition[];
}

export interface TopicsState {
  fetchStatus: FetchStatus;
  items: Topic[];
  brokers?: Broker[];
}

export type Broker = number;
