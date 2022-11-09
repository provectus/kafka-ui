import React, { useMemo } from 'react';
import { useRoleBasedAccessMock } from 'lib/hooks/api/roles';
import { UserPermission } from 'generated-sources';
import { modifyRolesData } from 'lib/rolesHelper';

export const RolesAccessContext = React.createContext(
  new Map() as Map<string, UserPermission[]>
);

export const RolesAccessProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { data } = useRoleBasedAccessMock();

  const roles = useMemo(() => modifyRolesData(data), [data]);

  return (
    <RolesAccessContext.Provider value={roles}>
      {children}
    </RolesAccessContext.Provider>
  );
};
