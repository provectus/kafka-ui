import fetchMock from 'fetch-mock';
import { expectQueryWorks, renderQueryHook } from 'lib/testHelpers';
import * as hooks from 'lib/hooks/api/timeFormat';
import { timeFormatPayload } from 'lib/fixtures/timeFormat';

const timeFormatPath = '/api/info/timestampformat/iso';

describe('Time format hooks', () => {
  beforeEach(() => fetchMock.restore());
  describe('useTimeFormat', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(timeFormatPath, timeFormatPayload);
      const { result } = renderQueryHook(() => hooks.useTimeFormat());
      await expectQueryWorks(mock, result);
    });
  });
});
