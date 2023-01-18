import React, { useMemo } from 'react';
import { useGetUserInfo } from 'lib/hooks/api/roles';
import { modifyRolesData, RolesModifiedTypes } from 'lib/permissions';

export interface UserInfoType {
  username: string;
  roles: RolesModifiedTypes;
  rbacFlag: boolean;
}

export const UserInfoRolesAccessContext = React.createContext({
  username: '',
  roles: new Map() as RolesModifiedTypes,
  rbacFlag: true,
});

export const UserInfoRolesAccessProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { data } = useGetUserInfo();

  const contextValue = useMemo(() => {
    const username = data?.userInfo?.username ? data?.userInfo?.username : '';

    const roles = modifyRolesData(data?.userInfo?.permissions);

    return {
      username,
      rbacFlag: !!data?.rbacEnabled,
      roles,
    };
  }, [data]);

  return (
    <UserInfoRolesAccessContext.Provider value={contextValue}>
      {children}
    </UserInfoRolesAccessContext.Provider>
  );
};
