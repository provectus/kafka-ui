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

export function modifyRolesDataV2(
  data?: RolesType
): Map<string, Map<UserPermissionResourceEnum, RolesType>> {
  const map = new Map<string, Map<UserPermissionResourceEnum, RolesType>>();

  data?.forEach((item) => {
    item.clusters.forEach((name) => {
      const cluster = map.get(name);
      if (cluster) {
        const { resource } = item;

        const resourceItem = cluster.get(resource);
        if (resourceItem) {
          cluster.set(resource, resourceItem.concat(item));
          return;
        }
        cluster.set(resource, [item]);
        return;
      }

      map.set(name, new Map().set(item.resource, [item]));
    });
  });
  return map;
}

/**
 * @description it the logic behind depending on the roles whether a certain action
 * is permitted or not the philosophy is inspired from Headless UI libraries where
 * you separate the logic from the renderer
 *
 * @example you can use this in the hook format where it used in , or if you want to calculate it dynamically
 * you can call this dynamically in your component but the render is on you from that point on
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
