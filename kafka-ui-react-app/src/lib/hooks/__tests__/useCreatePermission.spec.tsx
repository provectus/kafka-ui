import React from 'react';
import { useParams } from 'react-router-dom';
import { renderHook } from '@testing-library/react';
import { isPermittedToCreate } from 'lib/permissions';
import { Action, ResourceType } from 'generated-sources';
import {
  UserInfoRolesAccessContext,
  UserInfoType,
} from 'components/contexts/UserInfoRolesAccessContext';
import { useCreatePermission } from 'lib/hooks/useCreatePermisson';

import { modifiedData, clusterName1, clusterName2 } from './fixtures';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('useCreatePermission', () => {
  const customRenderer = ({
    resource,
    userInfo,
  }: {
    resource: ResourceType;
    userInfo: UserInfoType;
  }) =>
    renderHook(() => useCreatePermission(resource), {
      wrapper: ({ children }) => (
        // eslint-disable-next-line react/react-in-jsx-scope

        // issue in initialProps of wrapper
        <UserInfoRolesAccessContext.Provider value={userInfo}>
          {children}
        </UserInfoRolesAccessContext.Provider>
      ),
    });

  it('should check if the hook renders the same value as the isPermittedToCreate Headless logic method', () => {
    const permissionConfig = {
      resource: ResourceType.TOPIC,
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
      isPermittedToCreate({
        ...permissionConfig,
        roles: modifiedData,
        clusterName: clusterName1,
        rbacFlag: true,
      })
    );
  });

  it('should check if the hook renders the same value as the isPermittedToCreate Headless logic method for Schema', () => {
    const permissionConfig = {
      resource: ResourceType.SCHEMA,
      action: Action.CREATE,
      userInfo: {
        roles: modifiedData,
        rbacFlag: false,
        username: '',
      },
    };

    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName: clusterName1,
    }));

    const { result } = customRenderer(permissionConfig);

    expect(result.current).toEqual(
      isPermittedToCreate({
        ...permissionConfig,
        roles: modifiedData,
        clusterName: clusterName1,
        rbacFlag: false,
      })
    );
  });

  it('should check if the hook renders the same value as the isPermittedToCreate Headless logic method for another Cluster', () => {
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
      isPermittedToCreate({
        ...permissionConfig,
        roles: modifiedData,
        clusterName: clusterName2,
        rbacFlag: true,
      })
    );
  });
});
