import {
  Action,
  UserPermission,
  UserPermissionResourceEnum,
} from 'generated-sources';

// TODO write tests here for both functions

export type RolesType = UserPermission[];

export type RolesModifiedTypes = Map<string, UserPermission[]>;

export function modifyRolesData(data?: RolesType): Map<string, RolesType> {
  const map = new Map<string, RolesType>();
  data?.forEach((item) => {
    item.clusters.forEach((name) => {
      const res = map.get(name);
      if (res) {
        map.set(name, res.concat(item));
        return;
      }
      map.set(name, [item]);
    });
  });
  return map;
}

/**
 * @description
 * */
export function isPermitted({
  roles,
  resource,
  action,
  clusterName,
  value,
}: {
  roles: RolesModifiedTypes;
  resource: UserPermissionResourceEnum;
  action: Action;
  clusterName: string;
  value?: string;
}) {
  if (!roles) return false;

  const cluster = roles.get(clusterName);
  if (!cluster) return false;

  return (
    cluster.findIndex((item) => {
      let valueCheck = true;
      if (item.value) {
        valueCheck = false;

        if (value) valueCheck = new RegExp(item.value).test(value);
      }

      return (
        item.resource === resource &&
        valueCheck &&
        item.actions.includes(action)
      );
    }) !== -1
  );
}
