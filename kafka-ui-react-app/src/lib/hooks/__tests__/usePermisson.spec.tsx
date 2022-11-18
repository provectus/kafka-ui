import React from 'react';
import { useParams } from 'react-router-dom';
import { renderHook } from '@testing-library/react';
import { usePermission } from 'lib/hooks/usePermission';
import { isPermitted, modifyRolesData } from 'lib/permissions';
import { Action, UserPermissionResourceEnum } from 'generated-sources';
import {
  UserInfoRolesAccessContext,
  UserInfoType,
} from 'components/contexts/UserInfoRolesAccessContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('usePermission', () => {
  const customRenderer = ({
    resource,
    action,
    value,
    userInfo,
  }: {
    resource: UserPermissionResourceEnum;
    action: Action;
    value?: string;
    userInfo: UserInfoType;
  }) =>
    renderHook(() => usePermission(resource, action, value), {
      wrapper: ({ children }) => (
        // eslint-disable-next-line react/react-in-jsx-scope

        // issue in initialProps of wrapper
        <UserInfoRolesAccessContext.Provider value={userInfo}>
          {children}
        </UserInfoRolesAccessContext.Provider>
      ),
    });

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

  const modifiedData = modifyRolesData(userPermissionsMock);

  it('should check if the hook renders the same value as the isPermitted Headless logic method', () => {
    const permissionConfig = {
      resource: UserPermissionResourceEnum.TOPIC,
      action: Action.CREATE,
      userInfo: {
        roles: modifiedData,
        rbacFlag: true,
        username: '',
      },
    };

    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName: clusterName1,
    }));

    const { result } = customRenderer(permissionConfig);

    expect(result.current).toEqual(
      isPermitted({
        ...permissionConfig,
        roles: modifiedData,
        clusterName: clusterName1,
        rbacFlag: true,
      })
    );
  });

  it('should check if the hook renders the same value as the isPermitted Headless logic method for Schema', () => {
    const permissionConfig = {
      resource: UserPermissionResourceEnum.SCHEMA,
      action: Action.CREATE,
      userInfo: {
        roles: modifiedData,
        rbacFlag: true,
        username: '',
      },
    };

    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName: clusterName1,
    }));

    const { result } = customRenderer(permissionConfig);

    expect(result.current).toEqual(
      isPermitted({
        ...permissionConfig,
        roles: modifiedData,
        clusterName: clusterName1,
        rbacFlag: true,
      })
    );
  });

  it('should check if the hook renders the same value as the isPermitted Headless logic method for another Cluster', () => {
    const permissionConfig = {
      resource: UserPermissionResourceEnum.SCHEMA,
      action: Action.CREATE,
      userInfo: {
        roles: modifiedData,
        rbacFlag: true,
        username: '',
      },
    };

    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName: clusterName2,
    }));

    const { result } = customRenderer(permissionConfig);

    expect(result.current).toEqual(
      isPermitted({
        ...permissionConfig,
        roles: modifiedData,
        clusterName: clusterName2,
        rbacFlag: true,
      })
    );
  });
});
