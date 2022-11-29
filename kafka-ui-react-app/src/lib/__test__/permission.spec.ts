import {
  isPermitted,
  isPermittedToCreate,
  modifyRolesData,
} from 'lib/permissions';
import { Action, UserPermissionResourceEnum } from 'generated-sources';

describe('Permission Helpers', () => {
  const clusterName1 = 'local';
  const clusterName2 = 'dev';

  const userPermissionsMock = [
    {
      clusters: [clusterName1],
      resource: UserPermissionResourceEnum.TOPIC,
      actions: [Action.VIEW, Action.CREATE],
    },
    {
      clusters: [clusterName1],
      resource: UserPermissionResourceEnum.KSQL,
      actions: [Action.EXECUTE],
    },
    {
      clusters: [clusterName1, clusterName2],
      resource: UserPermissionResourceEnum.SCHEMA,
      actions: [Action.VIEW],
    },
    {
      clusters: [clusterName1, clusterName2],
      resource: UserPermissionResourceEnum.CONNECT,
      actions: [Action.VIEW],
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
      actions: [Action.EDIT, Action.DELETE, Action.CREATE],
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

  const roles = modifyRolesData(userPermissionsMock);

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
    it('should check if the isPermitted returns the correct when there is no roles or clusters', () => {
      expect(
        isPermitted({
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          clusterName: 'unFoundCluster',
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: 'unFoundCluster',
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: '',
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles: new Map(),
          clusterName: 'unFoundCluster',
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles: new Map(),
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeFalsy();
    });

    it('should check if the isPermitted returns the correct value without name values', () => {
      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.CLUSTERCONFIG,
          action: Action.EDIT,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.KSQL,
          action: Action.EXECUTE,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.KSQL,
          action: Action.EXECUTE,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.CONNECT,
          action: Action.VIEW,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.CONNECT,
          action: Action.VIEW,
          rbacFlag: true,
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
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.EDIT,
          value: '123',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: Action.EDIT,
          value: 'some_wrong_value',
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.MESSAGES_DELETE,
          value: 'test_something',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.MESSAGES_DELETE,
          value: 'test_something',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.EDIT,
          value: 'any_text',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.EDIT,
          value: 'any_text',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.DELETE,
          value: 'some_other',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          action: Action.DELETE,
          value: 'some_other',
          rbacFlag: true,
        })
      ).toBeTruthy();
    });

    it('should test the algorithmic worse case when the input is multiple actions', () => {
      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.EDIT, Action.DELETE],
          value: '123456',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.EDIT],
          value: '123456',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.EDIT],
          value: '123456',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.DELETE],
          value: '123456',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.DELETE, Action.EDIT],
          value: '123456',
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.EDIT, Action.VIEW],
          value: '123456',
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.EDIT, Action.VIEW],
          value: 'notFound',
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [],
          value: '123456',
          rbacFlag: true,
        })
      ).toBeTruthy();
    });

    it('should check the rbac flag and works with permissions accordingly', () => {
      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [],
          value: '123456',
          rbacFlag: false,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.EDIT, Action.VIEW],
          value: '123456',
          rbacFlag: false,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.EDIT, Action.VIEW],
          value: 'notFound',
          rbacFlag: false,
        })
      ).toBeTruthy();

      expect(
        isPermitted({
          roles: new Map(),
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          action: [Action.EDIT, Action.VIEW],
          value: 'notFound',
          rbacFlag: false,
        })
      ).toBeTruthy();
    });
  });

  describe('isPermittedToCreate', () => {
    it('should check if the isPermitted returns the correct when there is no roles or clusters', () => {
      expect(
        isPermittedToCreate({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermittedToCreate({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermittedToCreate({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          rbacFlag: false,
        })
      ).toBeTruthy();

      expect(
        isPermittedToCreate({
          roles,
          clusterName: clusterName2,
          resource: UserPermissionResourceEnum.TOPIC,
          rbacFlag: false,
        })
      ).toBeTruthy();

      expect(
        isPermittedToCreate({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.SCHEMA,
          rbacFlag: true,
        })
      ).toBeTruthy();

      expect(
        isPermittedToCreate({
          roles,
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.CONNECT,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermittedToCreate({
          roles: new Map(),
          clusterName: 'unFoundCluster',
          resource: UserPermissionResourceEnum.TOPIC,
          rbacFlag: true,
        })
      ).toBeFalsy();

      expect(
        isPermittedToCreate({
          roles: new Map(),
          clusterName: clusterName1,
          resource: UserPermissionResourceEnum.TOPIC,
          rbacFlag: true,
        })
      ).toBeFalsy();
    });
  });
});
