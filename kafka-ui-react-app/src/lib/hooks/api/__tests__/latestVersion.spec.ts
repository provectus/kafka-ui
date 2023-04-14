import fetchMock from 'fetch-mock';
import { expectQueryWorks, renderQueryHook } from 'lib/testHelpers';
import { latestVersionPayload } from 'lib/fixtures/latestVersion';
import { useLatestVersion } from 'lib/hooks/api/latestVersion';

const latestVersionPath = '/api/info';

describe('Latest version hooks', () => {
  beforeEach(() => fetchMock.restore());
  describe('useLatestVersion', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(latestVersionPath, latestVersionPayload);
      const { result } = renderQueryHook(() => useLatestVersion());
      await expectQueryWorks(mock, result);
    });
  });
});
