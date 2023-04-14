import { isValidEnum, isValidJsonObject } from 'lib/yupExtended';

const invalidEnum = `
ennum SchemType {
  AVRO = 0;
  JSON = 1;
  PROTOBUF = 3;
}
`;
const validEnum = `
enum SchemType {
  AVRO = 0;
  JSON = 1;
  PROTOBUF = 3;
}
`;
describe('yup extended', () => {
  describe('isValidJsonObject', () => {
    it('returns false for no value', () => {
      expect(isValidJsonObject()).toBeFalsy();
    });

    it('returns false for invalid string', () => {
      expect(isValidJsonObject('foo: bar')).toBeFalsy();
    });

    it('returns false on parsing error', () => {
      JSON.parse = jest.fn().mockImplementationOnce(() => {
        throw new Error();
      });
      expect(isValidJsonObject('{ "foo": "bar" }')).toBeFalsy();
    });

    it('returns true for valid JSON object', () => {
      expect(isValidJsonObject('{ "foo": "bar" }')).toBeTruthy();
    });
  });

  describe('isValidEnum', () => {
    it('returns false for invalid enum', () => {
      expect(isValidEnum(invalidEnum)).toBeFalsy();
    });
    it('returns false for no value', () => {
      expect(isValidEnum()).toBeFalsy();
    });
    it('returns true should trim value', () => {
      expect(
        isValidEnum(`  enum SchemType {AVRO = 0; PROTOBUF = 3;}   `)
      ).toBeTruthy();
    });
    it('returns true for valid enum', () => {
      expect(isValidEnum(validEnum)).toBeTruthy();
    });
  });
});
