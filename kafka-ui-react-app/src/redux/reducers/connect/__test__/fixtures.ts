import {
  ConnectorTaskStatus,
  ConnectorType,
  FullConnectorInfo,
} from 'generated-sources';

export const connectsPayload = [
  { name: 'first', address: 'localhost:8083' },
  { name: 'second', address: 'localhost:8084' },
];

export const connectorsServerPayload = [
  {
    connect: 'first',
    name: 'hdfs-source-connector',
    connector_class: 'FileStreamSource',
    type: ConnectorType.SOURCE,
    topics: ['test-topic'],
    status: ConnectorTaskStatus.RUNNING,
    tasks_count: 2,
    failed_tasks_count: 0,
  },
  {
    connect: 'second',
    name: 'hdfs2-source-connector',
    connector_class: 'FileStreamSource',
    type: ConnectorType.SINK,
    topics: ['test-topic'],
    status: ConnectorTaskStatus.FAILED,
    tasks_count: 3,
    failed_tasks_count: 1,
  },
];

export const connectorsPayload: FullConnectorInfo[] = [
  {
    connect: 'first',
    name: 'hdfs-source-connector',
    connectorClass: 'FileStreamSource',
    type: ConnectorType.SOURCE,
    topics: ['test-topic'],
    status: ConnectorTaskStatus.RUNNING,
    tasksCount: 2,
    failedTasksCount: 0,
  },
  {
    connect: 'second',
    name: 'hdfs2-source-connector',
    connectorClass: 'FileStreamSource',
    type: ConnectorType.SINK,
    topics: ['test-topic'],
    status: ConnectorTaskStatus.FAILED,
    tasksCount: 3,
    failedTasksCount: 1,
  },
];
