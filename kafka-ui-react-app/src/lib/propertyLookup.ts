// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function propertyLookup<T extends { [key: string]: any }>(
  path: string,
  obj: T
) {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
}
