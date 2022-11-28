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

interface IsPermittedConfig {
  roles?: RolesModifiedTypes;
  resource: UserPermissionResourceEnum;
  action: Action | Array<Action>;
  clusterName: string;
  value?: string;
  rbacFlag: boolean;
}

/**
 * @description it the logic behind depending on the roles whether a certain action
 * is permitted or not the philosophy is inspired from Headless UI libraries where
 * you separate the logic from the renderer besides the Creation process which is handled by isPermittedToCreate
 *
 * Algorithm: we Mapped the cluster name and the resource name , because all the actions in them are
 * constant and limited and hence faster lookup approach
 *
 * @example you can use this in the hook format where it used in , or if you want to calculate it dynamically
 * you can call this dynamically in your component but the render is on you from that point on
 *
 * Don't use this anywhere , use the hook version in the component for declarative purposes
 *
 * Array action approach bear in mind they should be from the same resource with the same name restrictions, then the logic it
 * will try to find every element from the given array inside the permissions data
 *
 * DON'T use the array approach until it is necessary to do so
 *
 * */
export function isPermitted({
  roles,
  resource,
  action,
  clusterName,
  value,
  rbacFlag,
}: {
  roles?: RolesModifiedTypes;
  resource: UserPermissionResourceEnum;
  action: Action | Array<Action>;
  clusterName: string;
  value?: string;
  rbacFlag: boolean;
}) {
  if (!rbacFlag) return true;

  // short circuit
  if (!roles || roles.size === 0) return false;

  // short circuit
  const clusterMap = roles.get(clusterName);
  if (!clusterMap) return false;

  // short circuit
  const resourceData = clusterMap.get(resource);
  if (!resourceData) return false;

  return (
    resourceData.findIndex((item) => {
      let valueCheck = true;
      if (item.value) {
        valueCheck = false;

        if (value) valueCheck = new RegExp(item.value).test(value);
      }

      // short circuit
      if (!valueCheck) return false;

      if (!Array.isArray(action)) {
        return item.actions.includes(action);
      }

      // every given action should be found in that resource
      return action.every(
        (currentAction) =>
          item.actions.findIndex((element) => element === currentAction) !== -1
      );
    }) !== -1
  );
}

/**
 * @description it the logic behind depending on create roles, since create has extra custom permission logic that is why
 * it is seperated from the others
 *
 * Algorithm: we Mapped the cluster name and the resource name , because all the actions in them are
 * constant and limited and hence faster lookup approach
 *
 * @example you can use this in the hook format where it used in , or if you want to calculate it dynamically
 * you can call this dynamically in your component but the render is on you from that point on
 *
 * Don't use this anywhere , use the hook version in the component for declarative purposes
 *
 * */
export function isPermittedToCreate({
  roles,
  resource,
  clusterName,
  rbacFlag,
}: Omit<IsPermittedConfig, 'value' | 'action'>) {
  if (!rbacFlag) return true;

  // short circuit
  if (!roles || roles.size === 0) return false;

  // short circuit
  const clusterMap = roles.get(clusterName);
  if (!clusterMap) return false;

  // short circuit
  const resourceData = clusterMap.get(resource);
  if (!resourceData) return false;

  const action = Action.CREATE;

  return resourceData.some((item) => {
    return item.actions.includes(action);
  });
}
