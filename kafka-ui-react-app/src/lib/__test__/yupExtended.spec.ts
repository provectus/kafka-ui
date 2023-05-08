import { isValidJsonObject } from 'lib/yupExtended';

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
});
