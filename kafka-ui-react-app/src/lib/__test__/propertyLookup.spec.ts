import { propertyLookup } from 'lib/propertyLookup';

describe('Property Lookup', () => {
  const entityObject = {
    prop: {
      nestedProp: 1,
    },
  };
  it('returns undefined if property not found', () => {
    expect(
      propertyLookup('prop.nonExistingProp', entityObject)
    ).toBeUndefined();
  });

  it('returns value of nested property if it exists', () => {
    expect(propertyLookup('prop.nestedProp', entityObject)).toBe(1);
  });
});
