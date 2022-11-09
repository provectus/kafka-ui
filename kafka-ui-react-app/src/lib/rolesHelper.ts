import { UserPermission } from 'generated-sources';

export type RolesType = UserPermission[];

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
