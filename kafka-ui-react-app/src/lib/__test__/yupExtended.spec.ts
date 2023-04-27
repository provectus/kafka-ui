import { isValidSchema, isValidJsonObject } from 'lib/yupExtended';

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
const invalidSchema = `
ssssyntax = "proto3";
package com.provectus;

message TestProtoRecord {
  string f1 = 1;
  int32 f2 = 2;
  int32 f6 = 3;
}
`;
const validSchema = `
syntax = "proto3";
package com.provectus;

message TestProtoRecord {
  string f1 = 1;
  int32 f2 = 2;
  int32 f6 = 3;
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

  describe('isValidSchema', () => {
    it('returns false for invalid enum', () => {
      expect(isValidSchema(invalidEnum)).toBeFalsy();
    });
    it('returns false for invalid schema', () => {
      expect(isValidSchema(invalidSchema)).toBeFalsy();
    });
    it('returns false for no value', () => {
      expect(isValidSchema()).toBeFalsy();
    });
    it('returns true should trim value', () => {
      expect(
        isValidSchema(`  enum SchemType {AVRO = 0; PROTOBUF = 3;}   `)
      ).toBeTruthy();
    });
    it('returns true for valid enum', () => {
      expect(isValidSchema(validEnum)).toBeTruthy();
    });
    it('returns true for valid schema', () => {
      expect(isValidSchema(validSchema)).toBeTruthy();
    });
  });
});
