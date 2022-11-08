import React, { useMemo } from 'react';
import { useRoleBasedAccessMock } from 'lib/hooks/api/roles';
import { UserPermission } from 'generated-sources';

export const RolesAccessContext = React.createContext(
  new Map() as Map<string, UserPermission[]>
);

export const RolesAccessProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { data } = useRoleBasedAccessMock();

  const roles = useMemo(() => {
    const map = new Map<string, UserPermission[]>();
    data?.forEach((item) => {
      item.clusters?.forEach((name) => {
        const res = map.get(name);
        if (res) {
          map.set(name, res.concat(item));
          return;
        }
        map.set(name, [item]);
      });
    });
    return map;
  }, [data]);

  return (
    <RolesAccessContext.Provider value={roles}>
      {children}
    </RolesAccessContext.Provider>
  );
};
