import React, { useMemo } from 'react';
import { useRoleBasedAccessMock } from 'lib/hooks/api/roles';

interface Types {
  roles: unknown;
}

const RolesAccessContext = React.createContext<Types>({} as Types);

export const RolesAccessProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { data } = useRoleBasedAccessMock();

  const roles = useMemo(() => data, [data]);

  return (
    <RolesAccessContext.Provider value={{ roles }}>
      {children}
    </RolesAccessContext.Provider>
  );
};
