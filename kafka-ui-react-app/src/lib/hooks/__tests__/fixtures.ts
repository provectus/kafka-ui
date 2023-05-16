import { Action, ResourceType } from 'generated-sources';
import { modifyRolesData } from 'lib/permissions';

export const clusterName1 = 'local';
export const clusterName2 = 'dev';

const userPermissionsMock = [
  {
    clusters: [clusterName1],
    resource: ResourceType.TOPIC,
    actions: [Action.CREATE],
  },
  {
    clusters: [clusterName1],
    resource: ResourceType.SCHEMA,
    actions: [Action.EDIT, Action.DELETE],
    value: '123.*',
  },
  {
    clusters: [clusterName1, clusterName2],
    resource: ResourceType.TOPIC,
    value: 'test.*',
    actions: [Action.MESSAGES_DELETE],
  },
  {
    clusters: [clusterName1, clusterName2],
    resource: ResourceType.TOPIC,
    value: '.*',
    actions: [Action.EDIT, Action.DELETE],
  },
];

export const modifiedData = modifyRolesData(userPermissionsMock);
