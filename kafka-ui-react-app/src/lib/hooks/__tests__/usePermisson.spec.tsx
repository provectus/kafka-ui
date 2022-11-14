import React from 'react';
import { useParams } from 'react-router-dom';
import { renderHook } from '@testing-library/react';
import { usePermission } from 'lib/hooks/usePermission';
import {
  isPermitted,
  modifyRolesData,
  RolesModifiedTypes,
} from 'lib/permissions';
import { Action, UserPermissionResourceEnum } from 'generated-sources';
import { RolesAccessContext } from 'components/contexts/RolesAccessContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('usePermission', () => {
  const customRenderer = ({
    resource,
    action,
    value,
    roles,
  }: {
    resource: UserPermissionResourceEnum;
    action: Action;
    value?: string;
    roles: RolesModifiedTypes;
  }) =>
    renderHook(() => usePermission(resource, action, value), {
      wrapper: ({ children }) => (
        // eslint-disable-next-line react/react-in-jsx-scope

        // issue in initialProps of wrapper
        <RolesAccessContext.Provider value={roles}>
          {children}
        </RolesAccessContext.Provider>
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
      roles: modifiedData,
    };

    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName: clusterName1,
    }));

    const { result } = customRenderer(permissionConfig);

    expect(result.current).toEqual(
      isPermitted({
        ...permissionConfig,
        clusterName: clusterName1,
      })
    );
  });

  it('should check if the hook renders the same value as the isPermitted Headless logic method for Schema', () => {
    const permissionConfig = {
      resource: UserPermissionResourceEnum.SCHEMA,
      action: Action.CREATE,
      roles: modifiedData,
    };

    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName: clusterName1,
    }));

    const { result } = customRenderer(permissionConfig);

    expect(result.current).toEqual(
      isPermitted({
        ...permissionConfig,
        clusterName: clusterName1,
      })
    );
  });

  it('should check if the hook renders the same value as the isPermitted Headless logic method for another Cluster', () => {
    const permissionConfig = {
      resource: UserPermissionResourceEnum.SCHEMA,
      action: Action.CREATE,
      roles: modifiedData,
    };

    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName: clusterName2,
    }));

    const { result } = customRenderer(permissionConfig);

    expect(result.current).toEqual(
      isPermitted({
        ...permissionConfig,
        clusterName: clusterName2,
      })
    );
  });
});
