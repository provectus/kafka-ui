import { isPermitted, modifyRolesData } from 'lib/permissions';
import { Action, UserPermissionResourceEnum } from 'generated-sources';

describe('Permission Helpers', () => {
  const clusterName1 = 'local';
  const clusterName2 = 'dev';

  const userPermissionsMock = [
    {
      clusters: [clusterName1],
      resource: UserPermissionResourceEnum.TOPIC,
      actions: [Action.CREATE],
    },
    {
      clusters: [clusterName1],
      resource: UserPermissionResourceEnum.KSQL,
      actions: [Action.EXECUTE],
    },
    {
      clusters: [clusterName1, clusterName2],
      resource: UserPermissionResourceEnum.SCHEMA,
      actions: [Action.CREATE],
    },
    {
      clusters: [clusterName1, clusterName2],
      resource: UserPermissionResourceEnum.CONNECT,
      actions: [Action.CREATE],
    },
    {
      clusters: [clusterName1],
      resource: UserPermissionResourceEnum.CLUSTERCONFIG,
      actions: [Action.EDIT],
    },
    {
      clusters: [clusterName1],
      resource: UserPermissionResourceEnum.CONSUMER,
      actions: [Action.DELETE],
    },
    {
      clusters: [clusterName1],
      resource: UserPermissionResourceEnum.SCHEMA,
      actions: [Action.EDIT, Action.DELETE],
      value: '123.*',
    },
    {
      clusters: [clusterName1, clusterName2],
      resource: UserPermissionResourceEnum.TOPIC,
      value: 'test.*',
      actions: [Action.MESSAGES_DELETE],
    },
    {
      clusters: [clusterName1, clusterName2],
      resource: UserPermissionResourceEnum.TOPIC,
      value: '.*',
      actions: [Action.EDIT, Action.DELETE],
    },
  ];

  describe('modifyRoles', () => {
    it('should check if it transforms the data in a correct format to normal keys', () => {
      const result = modifyRolesData(userPermissionsMock);
      expect(result.keys()).toContain(clusterName1);
      expect(result.keys()).toContain(clusterName2);

      const cluster1Map = result.get(clusterName1);
      const cluster2Map = result.get(clusterName2);

      expect(cluster1Map).toBeDefined();
      expect(cluster2Map).toBeDefined();

      // first cluster
      expect(
        cluster1Map?.has(UserPermissionResourceEnum.CLUSTERCONFIG)
      ).toBeTruthy();
      expect(
        cluster1Map?.has(UserPermissionResourceEnum.CLUSTERCONFIG)
      ).toBeTruthy();
      expect(
        cluster1Map?.has(UserPermissionResourceEnum.CONSUMER)
      ).toBeTruthy();
      expect(cluster1Map?.has(UserPermissionResourceEnum.CONNECT)).toBeTruthy();
      expect(cluster1Map?.has(UserPermissionResourceEnum.KSQL)).toBeTruthy();
      expect(cluster1Map?.has(UserPermissionResourceEnum.TOPIC)).toBeTruthy();

      // second cluster
      expect(cluster2Map?.has(UserPermissionResourceEnum.SCHEMA)).toBeTruthy();
      expect(cluster2Map?.has(UserPermissionResourceEnum.CONNECT)).toBeTruthy();
      expect(cluster2Map?.has(UserPermissionResourceEnum.TOPIC)).toBeTruthy();
      expect(
        cluster2Map?.has(UserPermissionResourceEnum.CLUSTERCONFIG)
      ).toBeFalsy();

      expect(cluster2Map?.has(UserPermissionResourceEnum.CONSUMER)).toBeFalsy();
      expect(cluster2Map?.has(UserPermissionResourceEnum.KSQL)).toBeFalsy();
    });

    it('should check if it transforms the data length in keys are correct', () => {
      const result = modifyRolesData(userPermissionsMock);

      const cluster1Map = result.get(clusterName1);
      const cluster2Map = result.get(clusterName2);

      expect(result.size).toBe(2);

      expect(cluster1Map?.size).toBe(6);
      expect(cluster2Map?.size).toBe(3);

      // clusterMap1
      expect(cluster1Map?.get(UserPermissionResourceEnum.TOPIC)).toHaveLength(
        3
      );
      expect(cluster1Map?.get(UserPermissionResourceEnum.SCHEMA)).toHaveLength(
        2
      );
      expect(
        cluster1Map?.get(UserPermissionResourceEnum.CONSUMER)
      ).toHaveLength(1);
      expect(
        cluster1Map?.get(UserPermissionResourceEnum.CLUSTERCONFIG)
      ).toHaveLength(1);
      expect(cluster1Map?.get(UserPermissionResourceEnum.CONNECT)).toHaveLength(
        1
      );
      expect(
        cluster1Map?.get(UserPermissionResourceEnum.CLUSTERCONFIG)
      ).toHaveLength(1);

      // clusterMap2
      expect(cluster2Map?.get(UserPermissionResourceEnum.SCHEMA)).toHaveLength(
        1
      );
    });
  });

  describe('isPermitted', () => {
    const roles = modifyRolesData(userPermissionsMock);

    it('should check if the isPermitted returns the correct when there is no roles or clusters', () => {
      expect(
        isPermitted({
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.CREATE,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          clusterName: 'unFoundCluster',
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.CREATE,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles: new Map(),
          clusterName: 'unFoundCluster',
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.CREATE,
        })
      ).toBeFalsy();
    });

    it('should check if the isPermitted returns the correct value without name values', () => {
      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.CREATE,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.CREATE,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.CREATE,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.CLUSTERCONFIG,
          action: Action.EDIT,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.KSQL,
          action: Action.EXECUTE,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.KSQL,
          action: Action.EXECUTE,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.CREATE,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.CREATE,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.CONNECT,
          action: Action.CREATE,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.CONNECT,
          action: Action.CREATE,
        })
      ).toBeTruthy();
    });

    it('should check if the isPermitted returns the correct value with name values', () => {
      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.EDIT,
          value: '123456',
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.EDIT,
          value: '123',
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.EDIT,
          value: 'some_wrong_value',
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.MESSAGES_DELETE,
          value: 'test_something',
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.MESSAGES_DELETE,
          value: 'test_something',
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.EDIT,
          value: 'any_text',
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.EDIT,
          value: 'any_text',
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.DELETE,
          value: 'some_other',
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.DELETE,
          value: 'some_other',
        })
      ).toBeTruthy();
    });
  });
});
