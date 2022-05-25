import {
  Connect,
  Connector,
  ConnectorState,
  ConnectorTaskStatus,
  ConnectorType,
  FullConnectorInfo,
  Task,
} from 'generated-sources';

export const connects: Connect[] = [
  { name: 'first', address: 'localhost:8083' },
  { name: 'second', address: 'localhost:8084' },
];

export const connectorsServerPayload = [
  {
    connect: 'first',
    name: 'hdfs-source-connector',
    connector_class: 'FileStreamSource',
    type: ConnectorType.SOURCE,
    topics: ['a', 'b', 'c'],
    status: {
      state: ConnectorTaskStatus.RUNNING,
      workerId: 1,
    },
    tasks_count: 2,
    failed_tasks_count: 0,
  },
  {
    connect: 'second',
    name: 'hdfs2-source-connector',
    connector_class: 'FileStreamSource',
    type: ConnectorType.SINK,
    topics: ['test-topic'],
    status: {
      state: ConnectorTaskStatus.FAILED,
      workerId: 1,
    },
    tasks_count: 3,
    failed_tasks_count: 1,
  },
];

export const connectors: FullConnectorInfo[] = [
  {
    connect: 'first',
    name: 'hdfs-source-connector',
    connectorClass: 'FileStreamSource',
    type: ConnectorType.SOURCE,
    topics: ['a', 'b', 'c'],
    status: {
      state: ConnectorState.RUNNING,
    },
    tasksCount: 2,
    failedTasksCount: 0,
  },
  {
    connect: 'second',
    name: 'hdfs2-source-connector',
    connectorClass: 'FileStreamSource',
    type: ConnectorType.SINK,
    topics: ['test-topic'],
    status: {
      state: ConnectorState.FAILED,
    },
    tasksCount: 3,
    failedTasksCount: 1,
  },
];

export const failedConnectors: FullConnectorInfo[] = [
  {
    connect: 'first',
    name: 'hdfs-source-connector',
    connectorClass: 'FileStreamSource',
    type: ConnectorType.SOURCE,
    topics: ['a', 'b', 'c'],
    status: {
      state: ConnectorState.FAILED,
    },
    tasksCount: 2,
    failedTasksCount: 0,
  },
  {
    connect: 'second',
    name: 'hdfs2-source-connector',
    connectorClass: 'FileStreamSource',
    type: ConnectorType.SINK,
    topics: ['a', 'b', 'c'],
    status: {
      state: ConnectorState.FAILED,
    },
    tasksCount: 3,
    failedTasksCount: 1,
  },
];

export const connectorServerPayload = {
  connect: 'first',
  name: 'hdfs-source-connector',
  type: ConnectorType.SOURCE,
  status: {
    state: ConnectorTaskStatus.RUNNING,
    worker_id: 'kafka-connect0:8083',
  },
  config: {
    'connector.class': 'FileStreamSource',
    'tasks.max': '10',
    topic: 'test-topic',
    file: '/some/file',
  },
  tasks: [{ connector: 'first', task: 1 }],
};

export const connector: Connector = {
  connect: 'first',
  name: 'hdfs-source-connector',
  type: ConnectorType.SOURCE,
  status: {
    state: ConnectorState.RUNNING,
    workerId: 'kafka-connect0:8083',
  },
  config: {
    'connector.class': 'FileStreamSource',
    'tasks.max': '10',
    topic: 'test-topic',
    file: '/some/file',
  },
  tasks: [{ connector: 'first', task: 1 }],
};

export const tasksServerPayload = [
  {
    id: { connector: 'first', task: 1 },
    status: {
      id: 1,
      state: ConnectorTaskStatus.RUNNING,
      worker_id: 'kafka-connect0:8083',
    },
    config: {
      'batch.size': '2000',
      file: '/some/file',
      'task.class': 'org.apache.kafka.connect.file.FileStreamSourceTask',
      topic: 'test-topic',
    },
  },
  {
    id: { connector: 'first', task: 2 },
    status: {
      id: 2,
      state: ConnectorTaskStatus.FAILED,
      trace: 'Failure 1',
      worker_id: 'kafka-connect0:8083',
    },
    config: {
      'batch.size': '1000',
      file: '/some/file2',
      'task.class': 'org.apache.kafka.connect.file.FileStreamSourceTask',
      topic: 'test-topic',
    },
  },
  {
    id: { connector: 'first', task: 3 },
    status: {
      id: 3,
      state: ConnectorTaskStatus.RUNNING,
      worker_id: 'kafka-connect0:8083',
    },
    config: {
      'batch.size': '3000',
      file: '/some/file3',
      'task.class': 'org.apache.kafka.connect.file.FileStreamSourceTask',
      topic: 'test-topic',
    },
  },
];

export const tasks: Task[] = [
  {
    id: { connector: 'first', task: 1 },
    status: {
      id: 1,
      state: ConnectorTaskStatus.RUNNING,
      workerId: 'kafka-connect0:8083',
    },
    config: {
      'batch.size': '2000',
      file: '/some/file',
      'task.class': 'org.apache.kafka.connect.file.FileStreamSourceTask',
      topic: 'test-topic',
    },
  },
  {
    id: { connector: 'first', task: 2 },
    status: {
      id: 2,
      state: ConnectorTaskStatus.FAILED,
      trace: 'Failure 1',
      workerId: 'kafka-connect0:8083',
    },
    config: {
      'batch.size': '1000',
      file: '/some/file2',
      'task.class': 'org.apache.kafka.connect.file.FileStreamSourceTask',
      topic: 'test-topic',
    },
  },
  {
    id: { connector: 'first', task: 3 },
    status: {
      id: 3,
      state: ConnectorTaskStatus.RUNNING,
      workerId: 'kafka-connect0:8083',
    },
    config: {
      'batch.size': '3000',
      file: '/some/file3',
      'task.class': 'org.apache.kafka.connect.file.FileStreamSourceTask',
      topic: 'test-topic',
    },
  },
];
