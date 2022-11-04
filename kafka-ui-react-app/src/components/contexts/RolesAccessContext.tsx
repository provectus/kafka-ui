import React from 'react';
import { useRoleBasedAccessMock } from 'lib/hooks/api/roles';

interface Types {
  roles: unknown;
}

const RolesAccessContext = React.createContext<Types>({} as Types);

export const RolesAccessProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { isFetching, isFetched } = useRoleBasedAccessMock();

  return (
    <RolesAccessContext.Provider value={{ roles: [] }}>
      {isFetching && <div>...Loading</div>}
      {isFetched && children}
    </RolesAccessContext.Provider>
  );
};
