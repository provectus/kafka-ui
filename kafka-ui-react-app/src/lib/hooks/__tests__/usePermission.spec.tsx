import React from 'react';
import { useParams } from 'react-router-dom';
import { renderHook } from '@testing-library/react';
import { usePermission } from 'lib/hooks/usePermission';
import { isPermitted } from 'lib/permissions';
import { Action, ResourceType } from 'generated-sources';
import {
  UserInfoRolesAccessContext,
  UserInfoType,
} from 'components/contexts/UserInfoRolesAccessContext';

import { clusterName1, modifiedData, clusterName2 } from './fixtures';

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
    resource: ResourceType;
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

  it('should check if the hook renders the same value as the isPermitted Headless logic method', () => {
    const permissionConfig = {
      resource: ResourceType.TOPIC,
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
      resource: ResourceType.SCHEMA,
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
      resource: ResourceType.SCHEMA,
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
