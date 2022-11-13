import React, { useMemo } from 'react';
import { useRoleBasedAccessMock } from 'lib/hooks/api/roles';
import { modifyRolesData, RolesModifiedTypes } from 'lib/permissions';

export const RolesAccessContext = React.createContext(
  new Map() as RolesModifiedTypes
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
