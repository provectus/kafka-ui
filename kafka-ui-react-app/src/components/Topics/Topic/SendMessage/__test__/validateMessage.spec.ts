import validateMessage from 'components/Topics/Topic/SendMessage/validateMessage';

import { testSchema } from './fixtures';

describe('validateMessage', () => {
  it('returns no errors on correct input data', () => {
    const key = `{"f1": 32, "f2": "multi-state", "schema": "Bedfordshire violet SAS"}`;
    const content = `{"f1": 21128, "f2": "Health Berkshire", "schema": "Dynamic"}`;
    expect(validateMessage(key, content, testSchema)).toEqual([]);
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
