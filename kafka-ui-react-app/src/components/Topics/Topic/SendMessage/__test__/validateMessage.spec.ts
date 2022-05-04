import validateMessage from 'components/Topics/Topic/SendMessage/validateMessage';
import cloneDeep from 'lodash/cloneDeep';

import { testSchema } from './fixtures';

describe('validateMessage', () => {
  const defaultValidKey = `{"f1": 32, "f2": "multi-state", "schema": "Bedfordshire violet SAS"}`;
  const defaultValidContent = `{"f1": 21128, "f2": "Health Berkshire", "schema": "Dynamic"}`;

  it('should return empty error data if value is empty', () => {
    const key = ``;
    const content = ``;
    expect(validateMessage(key, content, testSchema)).toEqual([]);
  });

  it('should return empty error data if schema is empty', () => {
    const key = `{"f1": 32, "f2": "multi-state", "schema": "Bedfordshire violet SAS"}`;
    const content = `{"f1": 21128, "f2": "Health Berkshire", "schema": "Dynamic"}`;
    const schema = cloneDeep(testSchema);
    schema.key.schema = '';
    schema.value.schema = '';
    expect(validateMessage(key, content, schema)).toEqual([]);
  });

  it('should return parsing error data if schema is not parsed with type of key', () => {
    const schema = cloneDeep(testSchema);
    schema.key.schema = '{invalid';
    expect(
      validateMessage(defaultValidKey, defaultValidContent, schema)
    ).toEqual([`Error in parsing the "key" field schema`]);
  });

  it('should return parsing error data if schema is not parsed with type of value', () => {
    const schema = cloneDeep(testSchema);
    schema.value.schema = '{invalid';
    expect(
      validateMessage(defaultValidKey, defaultValidContent, schema)
    ).toEqual([`Error in parsing the "content" field schema`]);
  });

  it('should return empty error data if schema type is string', () => {
    const schema = cloneDeep(testSchema);
    schema.key.schema = `{"type": "string"}`;
    schema.value.schema = `{"type": "string"}`;
    expect(
      validateMessage(defaultValidKey, defaultValidContent, schema)
    ).toEqual([]);
  });

  it('should return  error data if compile Ajv data throws an error', () => {
    expect(
      validateMessage(defaultValidKey, defaultValidContent, testSchema)
    ).toEqual([]);
  });

  it('returns no errors on correct input data', () => {
    expect(
      validateMessage(defaultValidContent, defaultValidContent, testSchema)
    ).toEqual([]);
  });

  it('returns errors on invalid input data', () => {
    const key = `{"f1": "32", "f2": "multi-state", "schema": "Bedfordshire violet SAS"}`;
    const content = `{"f1": "21128", "f2": "Health Berkshire", "schema": "Dynamic"}`;
    expect(validateMessage(key, content, testSchema)).toEqual([
      'Key/properties/f1/type - must be integer',
      'Content/properties/f1/type - must be integer',
    ]);
  });

  it('returns error on broken key value', () => {
    const key = `{"f1": "32", "f2": "multi-state", "schema": "Bedfordshire violet SAS"`;
    const content = `{"f1": 21128, "f2": "Health Berkshire", "schema": "Dynamic"}`;
    expect(validateMessage(key, content, testSchema)).toEqual([
      'Error in parsing the "key" field value',
    ]);
  });

  it('returns error on broken content value', () => {
    const key = `{"f1": 32, "f2": "multi-state", "schema": "Bedfordshire violet SAS"}`;
    const content = `{"f1": 21128, "f2": "Health Berkshire", "schema": "Dynamic"`;
    expect(validateMessage(key, content, testSchema)).toEqual([
      'Error in parsing the "content" field value',
    ]);
  });
});
