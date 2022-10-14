import fetchMock from 'fetch-mock';
import { expectQueryWorks, renderQueryHook } from 'lib/testHelpers';
import * as hooks from 'lib/hooks/api/latestVersion';
import { GIT_REPO_LATEST_RELEASE_LINK } from 'lib/constants';
import { latestVersionPayload } from 'lib/fixtures/latestVersion';

describe('Latest version hooks', () => {
  beforeEach(() => fetchMock.restore());
  describe('useLatestVersion', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(
        GIT_REPO_LATEST_RELEASE_LINK,
        latestVersionPayload
      );
      const { result } = renderQueryHook(() => hooks.useLatestVersion());
      await expectQueryWorks(mock, result);
    });
  });
});
