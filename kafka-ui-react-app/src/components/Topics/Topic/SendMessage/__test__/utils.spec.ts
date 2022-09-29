import { serdesPayload } from 'lib/fixtures/topicMessages';
import {
  getDefaultValues,
  getSerdeOptions,
  validateBySchema,
} from 'components/Topics/Topic/SendMessage/utils';
import { SerdeDescription } from 'generated-sources';

describe('SendMessage utils', () => {
  describe('getDefaultValues', () => {
    it('should return default values', () => {
      const actual = getDefaultValues(serdesPayload);
      expect(actual.keySerde).toEqual(
        serdesPayload.key?.find((item) => item.preferred)?.name
      );
      expect(actual.key).not.toBeUndefined();
      expect(actual.valueSerde).toEqual(
        serdesPayload.value?.find((item) => item.preferred)?.name
      );
      expect(actual.content).not.toBeUndefined();
    });
    it('works even with empty serdes', () => {
      const actual = getDefaultValues({});
      expect(actual.keySerde).toBeUndefined();
      expect(actual.key).toBeUndefined();
      expect(actual.valueSerde).toBeUndefined();
      expect(actual.content).toBeUndefined();
    });
  });
  describe('getSerdeOptions', () => {
    it('should return options', () => {
      const options = getSerdeOptions(serdesPayload.key as SerdeDescription[]);
      expect(options).toHaveLength(2);
    });
    it('should skip options without label', () => {
      const keySerdes = serdesPayload.key as SerdeDescription[];
      const payload = [{ ...keySerdes[0], name: undefined }, keySerdes[1]];
      const options = getSerdeOptions(payload);
      expect(options).toHaveLength(1);
    });
  });
  describe('validateBySchema', () => {
    const defaultSchema = '{"type": "integer", "minimum" : 1, "maximum" : 2 }';

    it('should return empty error data if value is empty', () => {
      expect(validateBySchema('', defaultSchema, 'key')).toHaveLength(0);
    });

    it('should return empty error data if schema is empty', () => {
      expect(validateBySchema('My Value', '', 'key')).toHaveLength(0);
    });

    it('should return parsing error data if schema is not parsed with type of key', () => {
      const schema = '{invalid';
      expect(validateBySchema('My Value', schema, 'key')).toEqual([
        `Error in parsing the "key" field schema`,
      ]);
    });
    it('should return parsing error data if schema is not parsed with type of key', () => {
      const schema = '{invalid';
      expect(validateBySchema('My Value', schema, 'content')).toEqual([
        `Error in parsing the "content" field schema`,
      ]);
    });
    it('should return empty error data if schema type is string', () => {
      const schema = `{"type": "string"}`;
      expect(validateBySchema('My Value', schema, 'key')).toHaveLength(0);
    });
    it('returns errors on invalid input data', () => {
      expect(validateBySchema('0', defaultSchema, 'key')).toEqual([
        'Key/minimum - must be >= 1',
      ]);
    });
    it('returns error on broken key value', () => {
      expect(validateBySchema('{120', defaultSchema, 'key')).toEqual([
        'Error in parsing the "key" field value',
      ]);
    });
    it('returns error on broken content value', () => {
      expect(validateBySchema('{120', defaultSchema, 'content')).toEqual([
        'Error in parsing the "content" field value',
      ]);
    });
  });
});
