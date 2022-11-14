import {
  Action,
  UserPermission,
  UserPermissionResourceEnum,
} from 'generated-sources';

export type RolesType = UserPermission[];

export type RolesModifiedTypes = Map<
  string,
  Map<UserPermissionResourceEnum, RolesType>
>;

export function modifyRolesData(
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
 * Algorithm: we Mapped the cluster name and the resource name , because all the actions in them are
 * constant and limited and hence faster lookup approach
 *
 * @example you can use this in the hook format where it used in , or if you want to calculate it dynamically
 * you can call this dynamically in your component but the render is on you from that point on
 *
 * Don't use this anywhere , use the hook version in the component for declarative purposes
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

  const clusterMap = roles.get(clusterName);
  if (!clusterMap) return false;

  const resourceData = clusterMap.get(resource);
  if (!resourceData) return false;

  return (
    resourceData.findIndex((item) => {
      let valueCheck = true;
      if (item.value) {
        valueCheck = false;

        if (value) valueCheck = new RegExp(item.value).test(value);
      }

      return valueCheck && item.actions.includes(action);
    }) !== -1
  );
}
