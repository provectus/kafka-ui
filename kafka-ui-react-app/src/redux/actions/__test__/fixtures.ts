import {
  ClusterStats,
  CompatibilityLevelCompatibilityEnum,
  NewSchemaSubject,
  SchemaSubject,
  SchemaType,
  SortOrder,
} from 'generated-sources';

export const clusterStats: ClusterStats = {
  brokerCount: 1,
  activeControllers: 1,
  onlinePartitionCount: 6,
  offlinePartitionCount: 0,
  inSyncReplicasCount: 6,
  outOfSyncReplicasCount: 0,
  underReplicatedPartitionCount: 0,
  diskUsage: [{ brokerId: 1, segmentSize: 6538, segmentCount: 6 }],
};

export const schemaPayload: NewSchemaSubject = {
  subject: 'NewSchema',
  schema:
    '{"type":"record","name":"MyRecord1","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
  schemaType: SchemaType.JSON,
};

export const schema: SchemaSubject = {
  subject: 'NewSchema',
  schema:
    '{"type":"record","name":"MyRecord1","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
  schemaType: SchemaType.JSON,
  version: '1',
  id: 1,
  compatibilityLevel: CompatibilityLevelCompatibilityEnum.BACKWARD,
};

export const mockTopicsState = {
  byName: {},
  allNames: [],
  totalPages: 1,
  messages: [],
  search: '',
  orderBy: null,
  sortOrder: SortOrder.ASC,
  consumerGroups: [],
};
