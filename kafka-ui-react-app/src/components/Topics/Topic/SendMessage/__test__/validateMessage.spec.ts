import validateMessage from 'components/Topics/Topic/SendMessage/validateMessage';

import { testSchema } from './fixtures';

describe('validateMessage', () => {
  it('returns true on correct input data', async () => {
    const mockSetError = jest.fn();
    expect(
      await validateMessage(
        `{
      "f1": 32,
      "f2": "multi-state",
      "schema": "Bedfordshire violet SAS"
    }`,
        `{
      "f1": 21128,
      "f2": "Health Berkshire Re-engineered",
      "schema": "Dynamic Greenland Beauty"
    }`,
        testSchema,
        mockSetError
      )
    ).toBe(true);
    expect(mockSetError).toHaveBeenCalledTimes(1);
  });

  it('returns false on incorrect input data', async () => {
    const mockSetError = jest.fn();
    expect(
      await validateMessage(
        `{
      "f1": "32",
      "f2": "multi-state",
      "schema": "Bedfordshire violet SAS"
    }`,
        `{
      "f1": "21128",
      "f2": "Health Berkshire Re-engineered",
      "schema": "Dynamic Greenland Beauty"
    }`,
        testSchema,
        mockSetError
      )
    ).toBe(false);
    expect(mockSetError).toHaveBeenCalledTimes(3);
  });
});
